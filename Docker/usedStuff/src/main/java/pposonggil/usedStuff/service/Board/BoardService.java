package pposonggil.usedStuff.service.Board;

import com.amazonaws.services.s3.AmazonS3Client;
import com.amazonaws.services.s3.model.AmazonS3Exception;
import com.amazonaws.services.s3.model.CannedAccessControlList;
import com.amazonaws.services.s3.model.PutObjectRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import pposonggil.usedStuff.domain.Board;
import pposonggil.usedStuff.domain.Member;
import pposonggil.usedStuff.domain.Route.LatXLngY;
import pposonggil.usedStuff.domain.TransactionAddress;
import pposonggil.usedStuff.dto.Board.BoardDto;
import pposonggil.usedStuff.dto.Forecast.ForecastDto;
import pposonggil.usedStuff.dto.Route.Path.PathDto;
import pposonggil.usedStuff.dto.Route.PointInformation.PointInformationDto;
import pposonggil.usedStuff.repository.board.BoardRepository;
import pposonggil.usedStuff.repository.member.MemberRepository;
import pposonggil.usedStuff.service.Forecast.ForecastService;
import pposonggil.usedStuff.service.Route.PathService;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class BoardService {
    private final BoardRepository boardRepository;
    private final MemberRepository memberRepository;
    private final PathService pathService;
    private final ForecastService forecastService;
    private final AwsS3 awsS3;

    /**
     * 전체 게시글 조회
     */
    public List<BoardDto> findBoards() {
        List<Board> boards = boardRepository.findAll();
        return boards.stream()
                .map(BoardDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 거래장소 까지의 예상 강수량
     * 거래 시작 시각 기준 기상정보
     * 포함한 게시글 조회
     */
    public List<BoardDto> findBoardsWithExpectedRain(PointInformationDto startDto, Long memberId) throws IOException {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(NoSuchElementException::new);

        LocalTime curTime = LocalTime.now(ZoneId.of("Asia/Seoul"));
        DateTimeFormatter inputFormatter = DateTimeFormatter.ofPattern("HHmm");

        List<Board> boards = boardRepository.findAll();
        List<BoardDto> boardDtos = boards.stream()
                .map(BoardDto::fromEntity)
                .collect(Collectors.toList());

        for (BoardDto boardDto : boardDtos) {
            TransactionAddress address = boardDto.getAddress();
            PointInformationDto endDto = PointInformationDto.builder()
                    .name(address.getName())
                    .latitude(address.getLatitude())
                    .longitude(address.getLongitude())
                    .build();
            try {;
                PathDto pathDto = pathService.createPath(startDto, endDto, curTime.format(inputFormatter), memberId);
                boardDto.setExpectedRain(pathDto.getTotalRain());
            } catch (Exception e) {
              log.info("Forecast 정보를 가져오는 데 실패했습니다: " + e.getMessage());
            }
        }
        return boardDtos;
    }

    /**
     * 게시글 상세 조회
     */
    public BoardDto findOne(Long boardId) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(NoSuchElementException::new);

        LocalTime curTime = LocalTime.now(ZoneId.of("Asia/Seoul"));
        DateTimeFormatter inputFormatter = DateTimeFormatter.ofPattern("HHmm");

        BoardDto boardDto = BoardDto.fromEntity(board);

        LatXLngY latXLngY = LatXLngY.convertGRID_GPS(LatXLngY.TO_GRID, board.getAddress().getLatitude(), boardDto.getAddress().getLongitude());

        ForecastDto forecastDto = ForecastDto.builder()
                .time(curTime.format(inputFormatter))
                .x(String.format("%.0f", latXLngY.x))
                .y(String.format("%.0f", latXLngY.y))
                .build();

        try {
            ForecastDto forecastByTimeAndXAndY = forecastService.findForecastByTimeAndXAndY(forecastDto);
            boardDto.setForecastDto(forecastByTimeAndXAndY);
        } catch (Exception e) {
            log.info("Forecast 정보를 가져오는 데 실패했습니다: " + e.getMessage());
        }

        return boardDto;
    }

    /**
     * 작성자 아이디로 게시글 조회
     */
    public List<BoardDto> findBoardsByWriterId(Long writerId) {
        List<Board> boards = boardRepository.findBoardsWithMemberByWriterId(writerId);

        return boards.stream()
                .map(BoardDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 작성자 & 게시글 조회
     */
    public List<BoardDto> findAllWithMember() {
        List<Board> boards = boardRepository.findAllWithMember();
        return boards.stream()
                .map(BoardDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 게시글 작성
     */
    @Transactional
    public Long createBoard(BoardDto boardDto, MultipartFile file) throws Exception {
        Member writer = memberRepository.findById(boardDto.getWriterId())
                .orElseThrow(() -> new NoSuchElementException("Member not found with id: " + boardDto.getWriterId()));

        Board board = Board.buildBoard(writer, boardDto.getTitle(), boardDto.getContent(), boardDto.getStartTimeString(),
                boardDto.getEndTimeString(), boardDto.getAddress(), boardDto.getPrice(), boardDto.isFreebie());

        board.setWriter(writer);

        if (file != null && !file.isEmpty()) {
            String imageUrl = awsS3.uploadFileToS3(file, "board");
            board.changeImageUrl(imageUrl);
        }
        boardRepository.save(board);
        return board.getId();
    }

    public Long createBoard(BoardDto boardDto) throws Exception {
        return createBoard(boardDto, null); // 파일이 없는 경우 null을 전달
    }

    /**
     * 게시글 수정
     */
    @Transactional
    public void updateBoard(BoardDto boardDto, MultipartFile file) throws Exception {
        Board board = boardRepository.findById(boardDto.getBoardId())
                .orElseThrow(NoSuchElementException::new);

        if (!board.getTitle().equals(boardDto.getTitle()))
            board.changeTitle(boardDto.getTitle());
        if (!board.getContent().equals(boardDto.getContent()))
            board.changeContent(boardDto.getContent());
        if (!board.getStartTimeString().equals(boardDto.getStartTimeString()))
            board.changeStartTimeString(boardDto.getStartTimeString());
        if (!board.getEndTimeString().equals(boardDto.getEndTimeString()))
            board.changeEndTimeString(boardDto.getEndTimeString());
        if (!board.getAddress().equals(boardDto.getAddress()))
            board.changeAddress(boardDto.getAddress());
        if (!board.getPrice().equals(boardDto.getPrice()))
            board.changePrice(boardDto.getPrice());
        if (board.isFreebie() != boardDto.isFreebie())
            board.changeIsFreebie(boardDto.isFreebie());

        if (file != null) {
            if (board.getImageUrl() != null) {
                awsS3.deleteS3(board.getImageUrl());
            }
            String imageUrl = awsS3.uploadFileToS3(file, "board");
            board.changeImageUrl(imageUrl);
        }

        boardRepository.save(board);
    }

    public void updateBoard(BoardDto boardDto) throws Exception {
        updateBoard(boardDto, null); // 파일이 없는 경우 null을 전달
    }

    /**
     * 게시글 삭제
     */
    @Transactional
    public void deleteBoard(Long boardId) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(NoSuchElementException::new);

        if (board.getImageUrl() != null) {
            try {
                awsS3.deleteS3(board.getImageUrl());
            } catch (Exception e) {
                throw new RuntimeException("S3에서 파일을 삭제하는 중 오류가 발생했습니다.", e);
            }
        }

        boardRepository.delete(board);
    }

    @Component
    @Slf4j
    static
    class AwsS3 {
        @Autowired
        AmazonS3Client amazonS3Client;
        @Value("${cloud.aws.s3.bucket}")
        private String bucket;

        /**
         * 로컬 경로에 저장
         */
        public String uploadFileToS3(MultipartFile multipartFile, String filePath) {
            // MultiPartFile --> File 로 변환
            File uploadFile = null;
            try {
                uploadFile = convert(multipartFile)
                        .orElseThrow(() -> new IllegalArgumentException("[error] : MultipartFile --> 파일 변환 실패"));
            } catch (IOException e) {
                throw new RuntimeException(e);
            }

            // S3에 저장된 파일 이름
            String fileName = filePath + "/" + UUID.randomUUID();

            // S3에 업로드 후 로컬 파일 삭제
            String uploadImageUrl = putS3(uploadFile, fileName);
            removeNewFile(uploadFile);
            return uploadImageUrl;
        }

        /**
         * S3으로 업로드
         *
         * @param uploadFile : 업로드할 파일
         * @param fileName   : 업로드할 파일 이름
         * @return 업로드 경로
         */
        public String putS3(File uploadFile, String fileName) {
            amazonS3Client.putObject(new PutObjectRequest(bucket, fileName, uploadFile).withCannedAcl(
                    CannedAccessControlList.PublicRead));
            return amazonS3Client.getUrl(bucket, fileName).toString();
        }

        /**
         * S3에 있는 파일 삭제
         * 영어 파일만 삭제 가능 --> 한글 이름 파일은 안됨
         */
        public void deleteS3(String filePath) throws Exception {
            String key = filePath.substring(58);

            try {
                amazonS3Client.deleteObject(bucket, key);
            } catch (AmazonS3Exception e) {
                log.info(e.getErrorMessage());
            } catch (Exception exception) {
                log.info(exception.getMessage());
            }
            log.info("[S3Uploader] : S3에 있는 파일 삭제");
        }

        /**
         * 로컬에 저장된 파일 지우기
         *
         * @param targetFile : 저장된 파일
         */
        private void removeNewFile(File targetFile) {
            if (targetFile.delete()) {
                log.info("[파일 업로드] : 파일 삭제 성공");
                return;
            }
            log.info("[파일 업로드] : 파일 삭제 실패");
        }

        /**
         * 로컬에 파일 업로드 및 변환
         *
         * @param file : 업로드할 파일
         */
        private Optional<File> convert(MultipartFile file) throws IOException {
            String originalFileName = file.getOriginalFilename();
            String fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));

            String fileName = File.separator + originalFileName.substring(0, originalFileName.lastIndexOf(".")) + "-";

            try {
                // 유니크한 파일명 -> createTempFile 중복방지: 자체적으로 난수 생성
                File convertFile = File.createTempFile(fileName, fileExtension);
                try (FileOutputStream fos = new FileOutputStream(convertFile)) {
                    fos.write(file.getBytes());
                }
                return Optional.of(convertFile);
            } catch (IOException e) {
                return Optional.empty();
            }
        }
    }
}

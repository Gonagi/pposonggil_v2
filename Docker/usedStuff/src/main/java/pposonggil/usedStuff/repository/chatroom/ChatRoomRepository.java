package pposonggil.usedStuff.repository.chatroom;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import pposonggil.usedStuff.domain.ChatRoom;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class ChatRoomRepository {
    private final EntityManager em;

    public void save(ChatRoom chatRoom) {
        em.persist(chatRoom);
    }

    public ChatRoom findOne(Long id) {
        return em.find(ChatRoom.class, id);
    }

    public List<ChatRoom> findAll() {
        return em.createQuery("select r from ChatRoom r", ChatRoom.class)
                .setMaxResults(1000)
                .getResultList();
    }

    public List<ChatRoom> findWithMemberBoard() {
        return em.createQuery("select r from ChatRoom r " +
                        "join fetch r.chatMember m " +
                        "join fetch r.chatBoard b", ChatRoom.class)
                .getResultList();
    }

    public List<ChatRoom> findChatRoomsByMemberId(Long memberId) {
        return em.createQuery("select c from ChatRoom c where c.chatMember.id = :memberId OR c.chatBoard.writer.id = :memberId", ChatRoom.class)
                .setParameter("memberId", memberId)
                .getResultList();
    }

    public void delete(ChatRoom chatRoom) {
        em.remove(chatRoom);
    }
}

// document.addEventListener('DOMContentLoaded', () => {
//     const chatContainer = document.getElementById('chatContainer');
//     const chatInput = document.getElementById('chatInput');
//     const sendButton = document.getElementById('sendButton');
//     const dealButton = document.getElementById('dealButton');

//     // 채팅 메시지 배열
//     let messages = JSON.parse(localStorage.getItem('chatMessages')) || [];

//     // 채팅 메시지 렌더링 함수
//     const renderMessages = () => {
//         chatContainer.innerHTML = '';
//         messages.forEach(msg => {
//             const messageDiv = document.createElement('div');
//             messageDiv.className = `chat-message ${msg.type}`;
//             messageDiv.textContent = msg.content;
//             chatContainer.appendChild(messageDiv);
//         });
//     };

//     // 메시지 보내기 버튼 클릭 이벤트
//     sendButton.addEventListener('click', () => {
//         const message = chatInput.value.trim();
//         if (message) {
//             // 새로운 메시지를 배열에 추가
//             messages.push({ type: 'sent', content: message });
//             localStorage.setItem('chatMessages', JSON.stringify(messages));
//             renderMessages();
//             chatInput.value = '';
//             chatContainer.scrollTop = chatContainer.scrollHeight;
//         }
//     });
//     dealButton.addEventListener('click', () => {
//         alert('거래예정 버튼이 클릭되었습니다.');
//     });
//     // 초기 렌더링
//     renderMessages();
// });

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('post_id');
    if (!postId) {
        // alert('게시글 ID가 필요합니다.');
        // return;
        postId = 'default'; // 게시글 ID가 없을 경우 임시 ID 사용
    }

    const chatContainer = document.getElementById('chatContainer');
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendButton');
    const dealButton = document.getElementById('dealButton');

    const storageKey = `chatMessages_${postId}`;

    // 채팅 메시지 배열
    let messages = JSON.parse(localStorage.getItem(storageKey)) || [];

    // 채팅 메시지 렌더링 함수
    const renderMessages = () => {
        chatContainer.innerHTML = '';
        messages.forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `chat-message ${msg.type}`;
            messageDiv.textContent = msg.content;
            chatContainer.appendChild(messageDiv);
        });
        chatContainer.scrollTop = chatContainer.scrollHeight; // 스크롤을 맨 아래로
    };
    // 임시로 자동 응답 메시지 추가
    const addAutoResponse = (message) => {
        setTimeout(() => {
            const responseMessage = { type: 'received', content: `응답: ${message}` };
            messages.push(responseMessage);
            localStorage.setItem(storageKey, JSON.stringify(messages));
            renderMessages();
        }, 1000); // 1초 후에 응답
    };

    // 메시지 보내기 버튼 클릭 이벤트
    sendButton.addEventListener('click', () => {
        const message = chatInput.value.trim();
        if (message) {
            // 새로운 메시지를 배열에 추가
            messages.push({ type: 'sent', content: message });
            // 상대방의 응답을 임의로 추가 (실제 구현에서는 서버 응답에 따라 다름)
            // setTimeout(() => {
            //     messages.push({ type: 'received', content: '상대방의 응답 메시지입니다.' });
            //     localStorage.setItem(storageKey, JSON.stringify(messages));
            //     renderMessages();
            //     chatContainer.scrollTop = chatContainer.scrollHeight;
            // }, 1000);
            localStorage.setItem(storageKey, JSON.stringify(messages));
            renderMessages();
            chatInput.value = '';
            chatContainer.scrollTop = chatContainer.scrollHeight;

            addAutoResponse(message);
        }
    });

    // 거래예정 버튼 클릭 이벤트
    dealButton.addEventListener('click', () => {
        alert('거래예정 버튼이 클릭되었습니다.');
    });

    // 초기 렌더링
    renderMessages();
});

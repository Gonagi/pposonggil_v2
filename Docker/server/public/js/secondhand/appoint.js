import { fetchUserInfo } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
    const appointFrm = document.querySelector("#appointFrm");

    appointFrm.addEventListener("submit", async (e) => { //버튼 누르면
        e.preventDefault();

        const newPost = JSON.parse(localStorage.getItem('posts'));
        // const title = localStorage.getItem('title');
        // const content = localStorage.getItem('content');
        // const price = localStorage.getItem('price');
        const date = e.target.date.value;
        const startTime = e.target.startTime.value;
        const endTime = e.target.endTime.value;
        const location = e.target.location.value;

        const startTimeString = `${date}T${startTime}:00`;
        const endTimeString = `${date}T${endTime}:00`;

        const address = {
            name: location,
            latitude: 37.4958,
            longitude: 126.9583,
            street: "주소1"
        };

        const post = {
            ...newPost,
            writerId: 1,
            startTimeString,
            endTimeString,
            address,
            isFreebie: false
        };

        // Post request to backend
        // await fetch('http://localhost:8080/api/board', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify(post),
        // });
        //나중에 백으로 보내기

        // Save to local storage
        let posts = JSON.parse(localStorage.getItem('posts')) || [];
        posts.unshift(post);
        localStorage.setItem('posts', JSON.stringify(posts));

        // Redirect to post list
        window.location.href = '/secondhand/list.html';
        localStorage.pop(posts);
    });
});

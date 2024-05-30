
document.addEventListener('DOMContentLoaded', () => {
    const postList = document.getElementById('postList');

    // 로컬 스토리지에서 게시글 목록 가져오기
    const posts = JSON.parse(localStorage.getItem('posts')) || [];

    // 게시글 목록을 렌더링
    posts.forEach((post, index) => {
        const postItem = document.createElement('div');
        postItem.className = 'post-item';
        postItem.dataset.index = index;  // 각 게시글에 인덱스를 데이터 속성으로 저장

        const textContent = document.createElement('div');
        textContent.className = 'text-content';

        const postTitle = document.createElement('h2');
        postTitle.textContent = post.title;

        const postContent = document.createElement('p');
        postContent.textContent = post.content;

        const postTime = document.createElement('p');
        postTime.textContent = `거래 시각: ${post.startTimeString} - ${post.endTimeString}`;

        const postLocation = document.createElement('p');
        postLocation.className = 'location';
        postLocation.textContent = `위치: ${post.location}`;

        const postPrice = document.createElement('p');
        postPrice.textContent = `거래 가격: ${post.price}원`;

        textContent.appendChild(postTitle);
        textContent.appendChild(postContent);
        textContent.appendChild(postTime);
        textContent.appendChild(postLocation);
        textContent.appendChild(postPrice);

        const postImages = document.createElement('div');
        postImages.className = 'image-content';

        // post.images.forEach((imageSrc) => {
        if (post.images && post.images.length > 0) {
            const postImage = document.createElement('img');
            postImage.src = post.images[0];
            postImages.appendChild(postImage);
        };


        postItem.appendChild(textContent);
        postItem.appendChild(postImages);
        postList.appendChild(postItem);

        postItem.addEventListener('click', () => {
            // 클릭한 게시글의 데이터를 로컬 스토리지에 저장
            localStorage.setItem('selectedPost', JSON.stringify(post));
            // 상세 페이지로 이동
            window.location.href = '/secondhand/show.html';
        });
    });
});

// document.addEventListener('DOMContentLoaded', () => {
//     const postList = document.getElementById('postList');

//     // 로컬 스토리지에서 게시글 목록 가져오기
//     const posts = JSON.parse(localStorage.getItem('posts')) || [];

//     // 게시글 목록을 렌더링
//     posts.forEach((post, index) => {
//         const postItem = document.createElement('div');
//         postItem.className = 'post-item';
//         postItem.dataset.index = index;  // 각 게시글에 인덱스를 데이터 속성으로 저장

//         const textContent = document.createElement('div');
//         textContent.className = 'text-content';

//         const postTitle = document.createElement('h2');
//         postTitle.textContent = post.title;

//         const postContent = document.createElement('p');
//         postContent.textContent = post.content;

//         const postLocation = document.createElement('p');
//         postLocation.className = 'location';
//         postLocation.textContent = `위치: ${post.address.name}`;

//         const postPrice = document.createElement('p');
//         postPrice.textContent = `거래 가격: ${post.price}원`;

//         const postTime = document.createElement('p');
//         postTime.textContent = `거래 시간: ${post.startTimeString.split('T')[0]} ${post.startTimeString.split('T')[1].substring(0, 5)} - ${post.endTimeString.split('T')[1].substring(0, 5)}`;

//         textContent.appendChild(postTitle);
//         textContent.appendChild(postContent);
//         textContent.appendChild(postLocation);
//         textContent.appendChild(postPrice);
//         textContent.appendChild(postTime);

//         const postImages = document.createElement('div');
//         postImages.className = 'image-content';

//         // if (post.images && post.images.length > 0) {
//         //     const postImage = document.createElement('img');
//         //     postImage.src = post.images[0];
//         //     postImages.appendChild(postImage);
//         // }

//         // 이미지 로드
//         // for (let i = 1; i <= 10; i++) {
//         const imageSrc = localStorage.getItem(`image1`);
//         if (imageSrc) {
//             const postImage = document.createElement('img');
//             postImage.src = imageSrc;
//             postImages.appendChild(postImage);
//         }
//         // }

//         postItem.appendChild(textContent);
//         postItem.appendChild(postImages);
//         postList.appendChild(postItem);

//         postItem.addEventListener('click', () => {
//             // 클릭한 게시글의 데이터를 로컬 스토리지에 저장
//             localStorage.setItem('selectedPost', JSON.stringify(post));
//             // 상세 페이지로 이동
//             window.location.href = '/secondhand/show.html';
//         });
//     });
// });

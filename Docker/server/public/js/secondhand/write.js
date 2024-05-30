import { fetchUserInfo } from './utils.js';

async function getGeocode(address) {
    const apiKey = 'b57b73ae393ddcbd717c07c95f05efd0'; // 여기에 카카오 API 키를 입력하세요.
    const response = await fetch(`https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`, {
        headers: {
            'Authorization': `KakaoAK ${apiKey}`
        }
    });
    const data = await response.json();

    if (data.documents && data.documents.length > 0) {
        const document = data.documents[0];
        return {
            name: address,
            latitude: parseFloat(document.y),
            longitude: parseFloat(document.x),
            street: document.address_name
        };
    } else {
        throw new Error('Geocoding failed');
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const writeFrm = document.querySelector("#writeFrm");

    writeFrm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.querySelector('#title-box').value;//제목
        const content = document.querySelector('#content-box').value;//내용
        const price = document.querySelector('#price-box').value;//거래 가격
        const startTime = document.querySelector('#startTime').value;//거래 시작 시각
        const endTime = document.querySelector('#endTime').value;//거래 종료 시각
        const address = document.querySelector('#location').value;//거래 위치

        const images = [];
        for (let i = 1; i <= 10; i++) {
            const preview = document.getElementById(`preview${i}`);
            if (preview && preview.src) {
                images.push(preview.src);
            }
        }

        let today = new Date();

        let year = today.getFullYear(); // 년도
        let month = String(today.getMonth() + 1).padStart(2, '0');  // 월
        let date = today.getDate();  // 날짜

        const startTimeString = `${year}-${month}-${date}-${startTime}`;
        const endTimeString = `${year}-${month}-${date}-${endTime}`;


        // try {
        //const address = await getGeocode(address);

        const newPost = {
            title: title,
            content: content,
            startTimeString: startTimeString,
            endTimeString: endTimeString,
            address: address,
            price: price,
            images: images,
        };

        let posts = JSON.parse(localStorage.getItem('posts')) || [];
        posts.unshift(newPost); // 새 게시글을 맨 앞에 추가
        localStorage.setItem('posts', JSON.stringify(posts));

        // Here you can add the code to send a POST request to the server
        // await fetch('http://localhost:8080/api/board', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify(newPost),
        // });

        window.location.href = '/secondhand/list.html';
        // } catch (error) {
        //     console.error('Geocoding failed:', error);
        //     alert('주소 변환에 실패했습니다. 올바른 주소를 입력했는지 확인해주세요.');
        // }
    });

    //사진 첨부 관련 코드
    const imageContainer = document.getElementById('image-container');

    const addImageUpload = (index) => {
        const imageUpload = document.createElement('div');
        imageUpload.classList.add('image-upload');
        imageUpload.id = `image-upload${index}`;

        const icon = document.createElement('i');
        icon.classList.add('fa-solid', 'fa-camera');

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = `file-input${index}`;
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';

        const preview = document.createElement('img');
        preview.id = `preview${index}`;
        preview.style.display = 'none';
        preview.style.width = '100%';
        preview.style.height = '100%';

        imageUpload.appendChild(icon);
        imageUpload.appendChild(fileInput);
        imageUpload.appendChild(preview);

        imageContainer.appendChild(imageUpload);

        imageUpload.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', () => {
            const file = fileInput.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                    if (index < 10 && !document.getElementById(`image-upload${index + 1}`)) {
                        addImageUpload(index + 1);
                    }
                    updateImageContainerLayout();
                };
                reader.readAsDataURL(file);
            }
        });
    };

    const updateImageContainerLayout = () => {
        const imageUploads = document.querySelectorAll('.image-upload');
        const container = document.querySelector('.image-container');
        if (imageUploads.length === 1) {
            container.style.justifyContent = 'center';
        } else {
            container.style.justifyContent = 'flex-start';
        }
    };

    addImageUpload(1); // 초기 하나만 아이콘 생성
    updateImageContainerLayout();
});

// import { fetchUserInfo } from './utils.js';
// import { GetPOI } from '../mainFunc.js';
// import { initAutocomplete } from '../autocomplete.js';


// function initAutocomplete(inputElement, latitude, longitude, addressField) {
//     $(inputElement)
//         .autocomplete({
//             source: async function (request, response) {
//                 const places = await GetPOI(request.term);
//                 const placesData = places.map((place) => ({
//                     label: place.Name,
//                     value: place.Name,
//                     name: place.Name,
//                     address: place.Address,
//                     lat: place.Lat,
//                     lon: place.Lon,
//                 }));
//                 response(placesData);
//             },
//             open: function (event, ui) {
//                 const menu = $(this).autocomplete("widget");
//                 const maxHeight = 400;
//                 const fieldWidth = $(this).outerWidth();
//                 menu.width(fieldWidth);
//                 menu.css("max-height", maxHeight + "px");
//                 menu.css("overflow-y", "auto");
//                 menu.css("overflow-x", "hidden");
//             },
//             select: function (event, ui) {
//                 console.log(ui.item.name);
//                 console.log(ui.item.address);
//                 latitude.value = ui.item.lat;
//                 longitude.value = ui.item.lon;
//                 addressField.value = ui.item.address;
//             },
//             focus: function (event, ui) {
//                 return false;
//             },
//             minLength: 1,
//             delay: 50,
//             close: function (event, ui) {
//                 //console.log(event);
//             },
//         })
//         .autocomplete("instance")._renderItem = function (ul, item) {
//             return $("<li>")
//                 .append(
//                     `<div class="address"><div class="address-name">${item.name}<div>
//                 <span class="address-detail">${item.address}</span><br></div>`
//                 )
//                 .appendTo(ul);
//         };
// }

// document.addEventListener('DOMContentLoaded', async () => {
//     const writeFrm = document.querySelector("#writeFrm");

//     // Autocomplete input fields
//     const locationInput = document.getElementById("location");
//     const latitudeField = document.createElement('input');
//     latitudeField.type = 'hidden';
//     latitudeField.id = 'latitude';
//     writeFrm.appendChild(latitudeField);

//     const longitudeField = document.createElement('input');
//     longitudeField.type = 'hidden';
//     longitudeField.id = 'longitude';
//     writeFrm.appendChild(longitudeField);

//     const addressField = document.createElement('input');
//     addressField.type = 'hidden';
//     addressField.id = 'address';
//     writeFrm.appendChild(addressField);

//     initAutocomplete(locationInput, latitudeField, longitudeField, addressField);

//     writeFrm.addEventListener('submit', async (e) => {
//         e.preventDefault();

//         const title = document.querySelector('#title-box').value;
//         const content = document.querySelector('#content-box').value;
//         const price = document.querySelector('#price-box').value;
//         const startTime = document.querySelector('#startTime').value;
//         const endTime = document.querySelector('#endTime').value;
//         const addressInput = document.querySelector('#location').value;
//         const latitude = document.querySelector('#latitude').value;
//         const longitude = document.querySelector('#longitude').value;
//         const street = document.querySelector('#address').value;

//         const images = [];
//         for (let i = 1; i <= 10; i++) {
//             const preview = document.getElementById(`preview${i}`);
//             if (preview && preview.src) {
//                 images.push(preview.src);
//             }
//         }

//         const startTimeString = `T${startTime}:00`;
//         const endTimeString = `T${endTime}:00`;

//         const address = {
//             name: addressInput,
//             latitude: parseFloat(latitude),
//             longitude: parseFloat(longitude),
//             street: street
//         };

//         try {
//             const newPost = {
//                 title: title,
//                 content: content,
//                 startTimeString: startTimeString,
//                 endTimeString: endTimeString,
//                 address: address,
//                 price: price,
//                 images: images,
//                 isFreebie: false
//             };

//             let posts = JSON.parse(localStorage.getItem('posts')) || [];
//             posts.unshift(newPost); // 새 게시글을 맨 앞에 추가
//             localStorage.setItem('posts', JSON.stringify(posts));

//             // 여기에서 서버로 POST 요청을 보내는 코드를 추가할 수 있습니다.
//             // await fetch('http://localhost:8080/api/board', {
//             //     method: 'POST',
//             //     headers: {
//             //         'Content-Type': 'application/json',
//             //     },
//             //     body: JSON.stringify(newPost),
//             // });

//             window.location.href = '/secondhand/list.html';
//         } catch (error) {
//             console.error('Geocoding failed:', error);
//             alert('주소 변환에 실패했습니다. 올바른 주소를 입력했는지 확인해주세요.');
//         }
//     });

//     const imageContainer = document.getElementById('image-container');

//     const addImageUpload = (index) => {
//         const imageUpload = document.createElement('div');
//         imageUpload.classList.add('image-upload');
//         imageUpload.id = `image-upload${index}`;

//         const icon = document.createElement('i');
//         icon.classList.add('fa-solid', 'fa-camera');

//         const fileInput = document.createElement('input');
//         fileInput.type = 'file';
//         fileInput.id = `file-input${index}`;
//         fileInput.accept = 'image/*';
//         fileInput.style.display = 'none';

//         const preview = document.createElement('img');
//         preview.id = `preview${index}`;
//         preview.style.display = 'none';
//         preview.style.width = '100%';
//         preview.style.height = '100%';

//         imageUpload.appendChild(icon);
//         imageUpload.appendChild(fileInput);
//         imageUpload.appendChild(preview);

//         imageContainer.appendChild(imageUpload);

//         imageUpload.addEventListener('click', () => fileInput.click());

//         fileInput.addEventListener('change', () => {
//             const file = fileInput.files[0];
//             if (file) {
//                 const reader = new FileReader();
//                 reader.onload = (e) => {
//                     preview.src = e.target.result;
//                     preview.style.display = 'block';
//                     if (index < 10 && !document.getElementById(`image-upload${index + 1}`)) {
//                         addImageUpload(index + 1);
//                     }
//                     updateImageContainerLayout();
//                 };
//                 reader.readAsDataURL(file);
//             }
//         });
//     };

//     const updateImageContainerLayout = () => {
//         const imageUploads = document.querySelectorAll('.image-upload');
//         const container = document.querySelector('.image-container');
//         if (imageUploads.length === 1) {
//             container.style.justifyContent = 'center';
//         } else {
//             container.style.justifyContent = 'flex-start';
//         }
//     };

//     addImageUpload(1); // 초기 하나만 아이콘 생성
//     updateImageContainerLayout();
// });

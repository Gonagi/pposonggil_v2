import axios from 'axios';

const api = axios.create();

api.interceptors.request.use(
    (config) => {
        // 요청 URL이 백엔드 서버로의 요청인지 확인
        if (config.url.startsWith('http://localhost:8080/api')) {
            // 백엔드 서버로의 요청일 경우에만 Authorization 헤더 추가
            const token = localStorage.getItem('token');
            if (token) {
                console.log("TOKEN", token)
                config.headers.Authorization = `Bearer ${token}`;
            }
            else {
                console.error('No Token in LocalStorage');
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const data = error.response.data;
                if (data.accessToken) {
                    // 새로 발급된 토큰 저장
                    let currentAccessToken = data.accessToken;
                    localStorage.setItem('token', currentAccessToken);
                    originalRequest.headers.Authorization = `Bearer ${currentAccessToken}`;
                    window.location.href = '/';
                } else {
                    // 로그인 페이지로 리다이렉션 등
                    window.location.href = '/login';
                }
            } catch (refreshError) {
                console.error('Token refresh failed', refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
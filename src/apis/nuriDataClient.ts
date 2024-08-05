import axios from 'axios';

const BASE_URL = 'http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService';

const apiClient = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default apiClient;

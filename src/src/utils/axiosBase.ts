import axios from "axios";

const apiClient = axios.create({
    baseURL: 'https://lunarsmashunited-api.azurewebsites.net/api',
    timeout: 5000,
});

export default apiClient;

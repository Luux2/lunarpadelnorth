import axios from "axios";

const apiClient = axios.create({
    baseURL: 'https://lunarpadelnorth-api-b3d5fabfcwcpe9az.westeurope-01.azurewebsites.net/api',
    timeout: 5000,
});

export default apiClient;

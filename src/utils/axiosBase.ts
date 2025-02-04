import axios from "axios";

const apiClient = axios.create({
    baseURL: 'lunarpadelnorth-api-b3d5fabfcwcpe9az.westeurope-01.azurewebsites.net',
    timeout: 5000,
});

export default apiClient;

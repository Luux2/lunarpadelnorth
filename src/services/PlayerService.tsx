import apiClient from "../utils/axiosBase";
import {PlayerInterface} from "../utils/interfaces.ts";

class PlayerService {


    static async getPlayers(): Promise<PlayerInterface[]> {
        const response = await apiClient.get('/players');
        return response.data as PlayerInterface[];
    }
}

export default PlayerService;

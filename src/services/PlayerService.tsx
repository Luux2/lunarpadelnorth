import apiClient from "../utils/axiosBase";
import {PlayerInterface} from "../utils/interfaces.ts";

class PlayerService {


    static async getPlayers(): Promise<PlayerInterface[]> {
        const response = await apiClient.get('/players');
        return response.data as PlayerInterface[];
    }

    static async addPlayer(player: PlayerInterface): Promise<PlayerInterface> {
        const response = await apiClient.post('/players', player);
        return response.data as PlayerInterface;
    }

    static async deletePlayer(id: string): Promise<void> {
        await apiClient.delete(`/players/${id}`);
    }
}

export default PlayerService;

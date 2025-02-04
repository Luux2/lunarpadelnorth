import apiClient from "../utils/axiosBase.ts";
import {PracticeTeamInterface} from "../utils/interfaces.ts";

class PracticeTeamService {

    static async getPracticeTeams(): Promise<PracticeTeamInterface[]> {
        const response = await apiClient.get('/practice-teams');
        return response.data;
    }

    static async createPracticeTeams(practiceTeams: PracticeTeamInterface): Promise<void> {
        await apiClient.post('/practice-teams', practiceTeams);
    }

    static async patchPlayer(teamId: string, oldPlayerId: string, newPlayerId: string): Promise<void> {
        await apiClient.patch(`/practice-teams/${teamId}`, {
            oldPlayerId,
            newPlayerId,
        });
    }

}

export default PracticeTeamService;

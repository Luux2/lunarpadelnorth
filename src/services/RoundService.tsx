import apiClient from "../utils/axiosBase";
import { MatchInterface, RoundInterface } from "../utils/interfaces.ts";

class RoundService {
    static async getRounds(): Promise<RoundInterface[]> {
        const response = await apiClient.get('/rounds');
        return response.data as RoundInterface[];
    }

    static async createRound(matches: MatchInterface[], startTime: string, endTime: string): Promise<void> {
        const formattedMatches = matches.map(match => ({
            team1: { ...match.team1 },
            team2: { ...match.team2 },
            sidesFixed: match.sidesFixed || false,
        }));

        await apiClient.post(`/rounds`, { matches: formattedMatches, startTime, endTime });
    }



    static async updateMatchTeams(roundId: string, matchId: string, updatedMatch: MatchInterface): Promise<void> {
        await apiClient.patch(`/rounds/${roundId}/${matchId}`, updatedMatch);
    }

}

export default RoundService;

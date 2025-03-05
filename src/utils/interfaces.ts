export interface PlayerInterface {
    id?: string;
    name: string;
}

export interface TeamInterface {
    player1: string;
    player2: string;
}


export interface MatchInterface {
    id?: string;
    team1: TeamInterface;
    team2: TeamInterface;
    sidesFixed?: boolean
}

export interface RoundInterface {
    id?: string;
    matches: MatchInterface[];
    startTime: string;
    endTime: string;
}

export interface PracticeTeamInterface {
    id?: string;
    startTime: string;
    endTime: string;
    players: string[];
}

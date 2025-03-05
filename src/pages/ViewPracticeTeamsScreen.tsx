import {useEffect, useState} from "react";
import {PlayerInterface, PracticeTeamInterface} from "../utils/interfaces.ts";
import PracticeTeamService from "../services/PracticeTeamService.tsx";
import BackArrow from "../components/BackArrow.tsx";
import PlayerService from "../services/PlayerService.tsx";
import {ChevronDownIcon, ChevronRightIcon} from "@heroicons/react/24/outline";
import {format} from "date-fns";
import {da} from "date-fns/locale";
import {registerLocale} from "react-datepicker";

registerLocale("da", da);

const ViewPracticeTeamsScreen = () => {
    const [practiceTeams, setPracticeTeams] = useState<PracticeTeamInterface[]>([]);
    const [players, setPlayers] = useState<PlayerInterface[]>([]);
    const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPracticeTeams = async () => {
            try {
                const response = await PracticeTeamService.getPracticeTeams();
                const sortedTeams = response.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
                setPracticeTeams(sortedTeams);
            } catch (error) {
                console.error("Error fetching practice teams:", error);
            }
        };
        const fetchPlayers = async () => {
            try {
                const response = await PlayerService.getPlayers();
                setPlayers(response);
            } catch (error) {
                console.error("Error fetching players:", error);
            }
        };
        Promise.all([fetchPracticeTeams(), fetchPlayers()]).then(() => setIsLoading(false));
    }, []);

    const getPlayerName = (id: string): string => {
        const player = players.find((p) => p.id === id);
        return player ? player.name : "Ukendt spiller";
    };

    const toggleDate = (teamId: string) => {
        setExpandedTeam(expandedTeam === teamId ? null : teamId);
    };

    const groupedTeams: Record<string, PracticeTeamInterface[]> = practiceTeams.reduce((acc, team) => {
        const date = format(new Date(team.startTime), "yyyy-MM-dd");
        if (!acc[date]) acc[date] = [];
        acc[date].push(team);
        return acc;
    }, {} as Record<string, PracticeTeamInterface[]>);




    if (isLoading) {
        return <p className="text-center mt-10">Indlæser træningshold...</p>;
    }

    return (
        <div>
            <BackArrow />
            <h1 className="text-3xl text-center font-semibold">Privat time</h1>

            {Object.keys(groupedTeams).length > 0 ? (
                <ul>
                    {Object.entries(groupedTeams).map(([date, teams]) => {
                        const isExpanded = expandedTeam === date;
                        return (
                            <li key={date} className="border-b-2 pb-4 my-4">
                                <button
                                    onClick={() => toggleDate(date)}
                                    className="w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-semibold">
                                            {format(new Date(date), "EEEE d. MMMM", { locale: da })}
                                        </span>
                                        <span className="text-xl">{isExpanded ? <ChevronDownIcon className="h-6"/> : <ChevronRightIcon className="h-6"/>}</span>
                                    </div>
                                </button>

                                {isExpanded && (
                                    <ul className="mt-4 px-4">
                                        {teams.map((team) => (
                                            <li key={team.id} className="mb-4">
                                                <div className="font-semibold mb-3 border-t">
                                                    <p className="p-2">
                                                        {format(new Date(team.startTime), "HH:mm")} - {format(new Date(team.endTime), "HH:mm")}
                                                    </p>
                                                </div>
                                                <ul>
                                                    {team.players.map((playerId) => (
                                                        <li
                                                            key={playerId}
                                                            className="mb-2 p-2 mx-1 cursor-pointer hover:bg-gray-700 border-2 border-[#232e39] rounded-xl"
                                                        >
                                                            {getPlayerName(playerId)}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <p className="text-center mt-10">Ingen kommende træningshold oprettet... endnu!</p>
            )}
        </div>
    );
};

export default ViewPracticeTeamsScreen;

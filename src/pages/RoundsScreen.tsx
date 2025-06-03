import { PlayerInterface, RoundInterface } from "../utils/interfaces.ts";
import { useEffect, useState } from "react";
import RoundService from "../services/RoundService.tsx";
import PlayerService from "../services/PlayerService.tsx";
import BackArrow from "../components/BackArrow.tsx";
import { format, isAfter, isToday } from "date-fns";
import { da } from "date-fns/locale";
import {ChevronDownIcon, ChevronRightIcon} from "@heroicons/react/24/outline";

const RoundsScreen = () => {
    const [rounds, setRounds] = useState<RoundInterface[]>([]);
    const [players, setPlayers] = useState<PlayerInterface[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedRound, setExpandedRound] = useState<string | null>(null);

    useEffect(() => {
        const fetchRounds = async () => {
            const response = await RoundService.getRounds();

            // Filtrer runder fra i dag eller frem
            const today = new Date();
            const filteredRounds = response.filter((round) => {
                if (!round.startTime) return false;

                const roundDate = new Date(round.startTime);
                return isToday(roundDate) || isAfter(roundDate, today);
            });

            // Sorter runder efter startTime
            filteredRounds.sort((a, b) => {
                return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
            });

            setRounds(filteredRounds);
        };

        const fetchPlayers = async () => {
            const playerResponse = await PlayerService.getPlayers();
            setPlayers(playerResponse);
        };

        Promise.all([fetchRounds(), fetchPlayers()]).then(() => setIsLoading(false));
    }, []);

    const getPlayerName = (id: string | undefined): string => {
        const player = players.find((p) => p.id === id);
        return player ? player.name : "Ukendt spiller";
    };

    const toggleRound = (roundId: string) => {
        setExpandedRound(expandedRound === roundId ? null : roundId); // Lukker hvis allerede åben, ellers åbner
    };

    const matchNames = ["Bane 1", "Bane 2", "Bane 3", "Bane 4", "Bane 5"];

    if (isLoading) {
        return <p className="text-center mt-10">Indlæser runder...</p>;
    }

    return (
        <div>
            <BackArrow />
            <h1 className="text-3xl text-center font-semibold">Dagens kampe</h1>

            {rounds.length > 0 ? (
                <ul>
                    {rounds.map((round) => {
                        const isExpanded = expandedRound === round.id;
                        return (
                            <li key={round.id} className="border-b-2 pb-4 my-4">
                                {/* Expandable Header */}
                                <button
                                    onClick={() => toggleRound(round.id!)}
                                    className="w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-semibold">
                                            {format(new Date(round.startTime), "EEEE d. MMMM", { locale: da })}, {" "}
                                            {format(new Date(round.startTime), "HH:mm", { locale: da })} -{" "}
                                            {format(new Date(round.endTime), "HH:mm", { locale: da })}
                                        </span>
                                        <span className="text-xl">{isExpanded ? <ChevronDownIcon className="h-6"/> : <ChevronRightIcon className="h-6"/>}</span>
                                    </div>
                                </button>

                                {/* Expandable Content */}
                                {isExpanded && (
                                    <div className="px-4 mt-2">
                                        <h1 className="italic">Første navn angivet: Venstre side</h1>
                                        <h1 className="italic">Andet navn angivet: Højre side</h1>
                                        <ul className="mt-4">
                                            {round.matches.map((match, index) => {

                                                return (
                                                    match.id && (
                                                        <li
                                                            key={match.id}
                                                            className="mb-4 p-2 border-2 border-[#232e39] rounded-xl"
                                                        >
                                                            <h2 className="text-xl font-semibold text-center mb-2">
                                                                {matchNames[index]}
                                                            </h2>
                                                            <p className="font-semibold">
                                                                {getPlayerName(match.team1.player1)} &{" "}
                                                                {getPlayerName(match.team1.player2)}
                                                            </p>
                                                            <p>vs</p>
                                                            <p className="font-semibold">
                                                                {getPlayerName(match.team2.player1)} &{" "}
                                                                {getPlayerName(match.team2.player2)}
                                                            </p>
                                                            <p className="mt-2 italic">
                                                                {!match.sidesFixed ? "Sider ikke fastlåst" : ""}
                                                            </p>
                                                        </li>
                                                    )
                                                );
                                            })}
                                        </ul>
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <p className="text-center mt-10">Ingen kommende kampe sat... endnu!</p>
            )}
        </div>
    );
};

export default RoundsScreen;

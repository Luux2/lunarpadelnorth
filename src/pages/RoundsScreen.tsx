import { PlayerInterface, RoundInterface } from "../utils/interfaces.ts";
import { useEffect, useState } from "react";
import RoundService from "../services/RoundService.tsx";
import PlayerService from "../services/PlayerService.tsx";
import BackArrow from "../components/BackArrow.tsx";
import { format, isAfter, isToday, parse } from "date-fns";
import { da } from "date-fns/locale";

const RoundsScreen = () => {
    const [rounds, setRounds] = useState<RoundInterface[]>([]);
    const [players, setPlayers] = useState<PlayerInterface[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRounds = async () => {
            const response = await RoundService.getRounds();

            // Filtrer runder fra i dag eller frem
            const today = new Date();
            const filteredRounds = response.filter((round) =>
                isToday(parse(round.id, "dd-MM-yyyy", new Date())) ||
                isAfter(parse(round.id, "dd-MM-yyyy", new Date()), today)
            );

            // Sorter runder efter dato
            filteredRounds.sort((a, b) =>
                parse(a.id, "dd-MM-yyyy", new Date()).getTime() -
                parse(b.id, "dd-MM-yyyy", new Date()).getTime()
            );

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

    const courts = ["Bane 8", "Bane 9", "Bane 10", "Bane 11", "Bane 12", "Bane 7"];

    if (isLoading) {
        return <p className="text-center mt-10">Indlæser runder...</p>;
    }

    return (
        <div>
            <BackArrow />
            <h1 className="text-3xl text-center font-semibold">Dagens kampe</h1>
            {rounds.length > 0 ? (
                <ul>
                    {rounds.map((round) => (
                        <li key={round.id} className="border-b-2 pb-4 my-4">
                            <div className="ml-4 text-lg font-semibold">
                                {format(parse(round.id, "dd-MM-yyyy", new Date()), "eeee, dd. MMMM", {
                                    locale: da,
                                })}
                            </div>
                            <h1 className="ml-4 italic">Første navn angivet: Venstre side</h1>
                            <h1 className="ml-4 italic">Andet navn angivet: Højre side</h1>
                            <ul className="mt-4 px-4">
                                {round.matches.map((match, index) => {
                                    const numCourtsInUse = Math.ceil(round.matches.length / 2); // Dynamisk antal baner
                                    const courtIndex = index % numCourtsInUse; // Gentag baner

                                    return (
                                        match.id && (
                                            <li
                                                key={match.id}
                                                className="mb-4 p-2 border-2 border-[#232e39] rounded-xl"
                                            >
                                                <h2 className="text-xl font-semibold text-center mb-2">
                                                    {courts[courtIndex]} {/* Dynamisk banenavn */}
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
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-center mt-10">Ingen kommende kampe sat... endnu!</p>
            )}
        </div>
    );
};

export default RoundsScreen;

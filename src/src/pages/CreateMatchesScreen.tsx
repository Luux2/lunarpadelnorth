import { useEffect, useState } from "react";
import {
    Listbox,
    ListboxButton,
    ListboxOption,
    ListboxOptions,
} from "@headlessui/react";
import {MatchInterface, PlayerInterface, TeamInterface} from "../utils/interfaces.ts";
import PlayerService from "../services/PlayerService.tsx";
import RoundService from "../services/RoundService.tsx";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import BackArrow from "../components/BackArrow.tsx";

const CreateMatchesScreen = () => {
    const navigate = useNavigate();
    const [players, setPlayers] = useState<PlayerInterface[]>([]);
    const [numPlayers, setNumPlayers] = useState(0); // Antal spillere valgt
    const [numMatches, setNumMatches] = useState(0); // Antal kampe baseret på spillere
    const [selectedPlayers, setSelectedPlayers] = useState<(PlayerInterface | null)[]>(Array(numPlayers).fill(null));
    const today = format(new Date().toISOString().split("T")[0], "dd-MM-yyyy");
    const [sidesNotFixedMap, setSidesNotFixedMap] = useState<Record<number, boolean>>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPlayers = async () => {
            const response = await PlayerService.getPlayers();
            const sortedPlayers = response.sort((a, b) => a.name.localeCompare(b.name));
            setPlayers(sortedPlayers);
        };
        Promise.all([fetchPlayers()]).then(() => setIsLoading(false));
    }, []);

    const handlePlayerSelection = (index: number, selectedPlayer: PlayerInterface | null) => {
        const updatedSelections = [...selectedPlayers];
        updatedSelections[index] = selectedPlayer;
        setSelectedPlayers(updatedSelections);
    };

    const handleSidesNotFixedChange = (matchIndex: number, isChecked: boolean) => {
        setSidesNotFixedMap((prev) => ({
            ...prev,
            [matchIndex]: isChecked,
        }));
    };

    const handleConfirmMatches = async () => {
        if (selectedPlayers.some((player) => !player)) {
            alert("Alle spillere skal vælges!");
            return;
        }

        const matches: MatchInterface[] = Array.from({ length: numMatches }).map((_, matchIndex) => {
            const sidesNotFixed = sidesNotFixedMap[matchIndex]; // Tjek om sider ikke er fastlagt

            const team1: TeamInterface = {
                player1: selectedPlayers[matchIndex * 4]!.id as string,
                player2: selectedPlayers[matchIndex * 4 + 1]!.id as string,
            };

            const team2: TeamInterface = {
                player1: selectedPlayers[matchIndex * 4 + 2]!.id as string,
                player2: selectedPlayers[matchIndex * 4 + 3]!.id as string,
            };

            return {
                team1,
                team2,
                sidesFixed: !sidesNotFixed,
            };
        });

        try {
            await RoundService.createRound(today, matches);
            alert(`Runde ${today} gemt med succes!`);
            setSelectedPlayers(Array(numPlayers).fill(null));
            navigate("/rounds");
        } catch (error) {
            console.error("Error saving round:", error);
            alert("Der opstod en fejl under gemning af runden.");
        }
    };

    const handleSetPlayers = (playersCount: number) => {
        setNumPlayers(playersCount);
        setNumMatches(playersCount / 2);
        setSelectedPlayers(Array(playersCount).fill(null));
    };

    const courts =
        [
            "Bane 8", "Bane 9", "Bane 10", "Bane 11", "Bane 12", "Bane 7"
        ];

    if (isLoading) {
        return <p className="text-center mt-10">Indlæser spillere...</p>;
    }

    return (
        <>
            <BackArrow />
            <div className="flex justify-center space-x-4 mb-10 mt-4">
                { [12, 16, 20, 24].map((num) => (
                    <button
                        key={num}
                        className={`rounded-xl border-2 border-[#232E39] p-2 ${numPlayers === num ? "bg-green-500" : ""}`}
                        onClick={() => handleSetPlayers(num)}
                    >
                        {num} spillere
                    </button>
                ))}
            </div>

            {Array.from({ length: numMatches }).map((_, groupIndex) => {
                const numCourtsInUse = Math.ceil(numMatches / 2); // Dynamisk antal baner
                const courtIndex = groupIndex % numCourtsInUse; // Gentag baner efter behov

                return (
                    <div key={groupIndex} className="mb-10">
                        <h2 className="text-2xl font-semibold text-center mb-4">
                            {courts[courtIndex]}
                        </h2>
                        <div className="grid grid-cols-2 gap-4 mx-1">
                            <h1 className="text-center font-semibold">Venstre side</h1>
                            <h1 className="text-center font-semibold">Højre side</h1>
                            {Array.from({ length: 4 }).map((_, index) => {
                                const globalIndex = groupIndex * 4 + index;

                                return (
                                    <Listbox
                                        key={globalIndex}
                                        value={selectedPlayers[globalIndex] || null}
                                        onChange={(selectedPlayer) => handlePlayerSelection(globalIndex, selectedPlayer)}
                                    >
                                        <div
                                            className={`relative border-4 rounded-lg ${
                                                index < 2 ? "border-blue-500" : "border-red-500"
                                            }`}
                                        >
                                            <ListboxButton className="w-full h-20 text-center bg-white text-black rounded-md px-2 py-1">
                                                {selectedPlayers[globalIndex]?.name || "Vælg spiller"}
                                            </ListboxButton>
                                            <ListboxOptions className="absolute mt-1 w-full bg-white shadow-md rounded-md z-50 max-h-60 overflow-y-auto text-black">
                                                {players.map((player) => (
                                                    <ListboxOption
                                                        key={player.id}
                                                        value={player}
                                                        className="cursor-pointer px-4 py-2 hover:bg-gray-200"
                                                    >
                                                        {player.name}
                                                    </ListboxOption>
                                                ))}
                                            </ListboxOptions>
                                        </div>
                                    </Listbox>
                                );
                            })}
                        </div>
                        <div className="flex justify-center mt-4">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    className="h-5 w-5"
                                    onChange={(e) => handleSidesNotFixedChange(groupIndex, e.target.checked)}
                                />
                                <span>Sider ikke fastlagt</span>
                            </label>
                        </div>
                    </div>
                );
            })}

            <div className="flex justify-center mt-10">
                <button
                    className={`rounded-xl border-2 border-[#232E39] p-2 text-3xl mb-52 ${numPlayers === 0 ? "hidden" : ""}`}
                    onClick={handleConfirmMatches}
                >
                    Bekræft valg
                </button>
            </div>
        </>
    );
};

export default CreateMatchesScreen;

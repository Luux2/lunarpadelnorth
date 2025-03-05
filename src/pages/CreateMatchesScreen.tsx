import {ChangeEvent, useEffect, useState} from "react";
import {
    Listbox,
    ListboxButton,
    ListboxOption,
    ListboxOptions,
} from "@headlessui/react";
import {MatchInterface, PlayerInterface, TeamInterface} from "../utils/interfaces.ts";
import PlayerService from "../services/PlayerService.tsx";
import RoundService from "../services/RoundService.tsx";
import BackArrow from "../components/BackArrow.tsx";
import DatePicker from "react-datepicker";

const CreateMatchesScreen = () => {
    const [players, setPlayers] = useState<PlayerInterface[]>([]);
    const [numMatches, setNumMatches] = useState(0); // Antal kampe baseret på spillere
    const [numPlayers, setNumPlayers] = useState(numMatches * 4); // Antal spillere baseret på kampe
    const [selectedPlayers, setSelectedPlayers] = useState<(PlayerInterface | null)[]>(Array(numPlayers).fill(null));
    const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
    const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
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

    const formatLocalISOString = (date: Date) => {
        const offset = date.getTimezoneOffset() * 60000;
        const localDate = new Date(date.getTime() - offset);
        return localDate.toISOString().replace('Z', '');
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
            const startTime = formatLocalISOString(selectedStartDate!);
            const endTime = formatLocalISOString(selectedEndDate!);


            await RoundService.createRound(matches, startTime, endTime);
            alert(`Runde gemt med succes!`);
            setNumMatches(0);
            setNumPlayers(0);
            setSelectedPlayers(Array(numPlayers).fill(null));
            setSelectedStartDate(null);
            setSelectedEndDate(null);
        } catch (error) {
            console.error("Error saving round:", error);
            alert("Der opstod en fejl under gemning af runden.");
        }
    };

    const handleSetMatches = (event: ChangeEvent<HTMLInputElement>) => {
        let matchCount = parseInt(event.target.value, 10);
        if (isNaN(matchCount) || matchCount < 0 ) {
            matchCount = 0;
        }
        setNumMatches(matchCount);
        const playerCount = matchCount * 4;
        setNumPlayers(playerCount);
        setSelectedPlayers(Array(playerCount).fill(null));
    };

    if (isLoading) {
        return <p className="text-center mt-10">Indlæser spillere...</p>;
    }

    return (
        <>
            <BackArrow />
            <h1 className="text-3xl font-semibold text-center">Indtast antal kampe</h1>

            <div className="flex justify-center space-x-4 mb-10 mt-4">
                <input
                    type="number"
                    min="1"
                    className="border rounded-md p-2 text-black text-center w-64"
                    placeholder="Antal kampe"
                    value={numMatches || ""}
                    onChange={handleSetMatches}
                />
            </div>

                <h1 className="text-3xl font-semibold text-center">Vælg dato og tid</h1>
                <div className="flex justify-center my-4">
                    <DatePicker
                        selected={selectedStartDate}
                        onChange={(date) => {setSelectedStartDate(date)}}
                        showTimeSelect
                        locale="da"
                        timeFormat="HH:mm"
                        timeIntervals={30}
                        showWeekNumbers
                        placeholderText="Starttidspunkt"
                        minDate={new Date()}
                        dateFormat="dd. MMMM yyyy, HH:mm"
                        className="w-64 border rounded-md p-2 text-black text-center"
                    />
            </div>
            <div className="flex justify-center mb-10">
                <DatePicker
                    selected={selectedEndDate}
                    onChange={(date) => {setSelectedEndDate(date)}}
                    showTimeSelect
                    locale="da"
                    timeFormat="HH:mm"
                    timeIntervals={30}
                    showWeekNumbers
                    placeholderText="Sluttidspunkt"
                    minDate={new Date()}
                    dateFormat="dd. MMMM yyyy, HH:mm"
                    className="w-64 border rounded-md p-2 text-black text-center"
                />
            </div>

            {Array.from({ length: numMatches }).map((_, matchIndex) => {

                return (
                    <div key={matchIndex} className="mb-10">
                        <h2 className="text-2xl font-semibold text-center mb-4">
                            Kamp {matchIndex + 1}
                        </h2>
                        <div className="grid grid-cols-2 gap-4 mx-1">
                            <h1 className="text-center font-semibold">Venstre side</h1>
                            <h1 className="text-center font-semibold">Højre side</h1>
                            {Array.from({ length: 4 }).map((_, index) => {
                                const globalIndex = matchIndex * 4 + index;

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
                                    onChange={(e) => handleSidesNotFixedChange(matchIndex, e.target.checked)}
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

import { useEffect, useState } from "react";
import { PlayerInterface } from "../utils/interfaces.ts";
import PlayerService from "../services/PlayerService.tsx";
import BackArrow from "../components/BackArrow.tsx";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import DatePicker, {registerLocale} from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {da} from "date-fns/locale";
import PracticeTeamService from "../services/PracticeTeamService.tsx";
registerLocale("da", da);


const PracticeTeamsScreen = () => {
    const [players, setPlayers] = useState<PlayerInterface[]>([]);
    const [selectedPlayers, setSelectedPlayers] = useState<(PlayerInterface | null)[]>(Array(4).fill(null));
    const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
    const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
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
        if (!selectedPlayer) return; // Ignore null selection
        const updatedSelections = [...selectedPlayers];
        updatedSelections[index] = selectedPlayer;
        setSelectedPlayers(updatedSelections);
    };

    const formatLocalISOString = (date: Date) => {
        const offset = date.getTimezoneOffset() * 60000; // Offset i millisekunder
        const localDate = new Date(date.getTime() - offset);
        return localDate.toISOString().replace('Z', '');
    };

    const handleConfirmPracticeTeams = async () => {
        try {
            const selectedPlayerIds = selectedPlayers.map(player => player?.id);
            if (selectedPlayerIds.includes(undefined)) {
                alert("Vælg alle spillere før du fortsætter!");
                return;
            }

            // Formatter datoen her, kun når den skal bruges
            const startTime = formatLocalISOString(selectedStartDate!);
            const endTime = formatLocalISOString(selectedEndDate!);

            const newPracticeTeam = {
                startTime,
                endTime,
                players: selectedPlayerIds as string[],
            };


            await PracticeTeamService.createPracticeTeams(newPracticeTeam);

            alert("Træningshold oprettet!");
            setSelectedPlayers(Array(4).fill(null));
            setSelectedStartDate(null);
            setSelectedEndDate(null);
        } catch (error) {
            console.error("Fejl ved oprettelse af træningshold:", error);
            alert("Der opstod en fejl ved oprettelse af træningshold.");
        }
    };

    if (isLoading) {
        return <p className="text-center mt-10">Indlæser spillere...</p>;
    }



    return (
        <div className="mt-4">
            <BackArrow/>
            <div className="mb-10 space-y-4">
                <h1 className="text-3xl font-semibold text-center">Vælg dato og tid</h1>
                <div className="flex justify-center">
                    <DatePicker
                        selected={selectedStartDate}
                        onChange={(date) => {setSelectedStartDate(date);}}
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
                <div className="flex justify-center">
                    <DatePicker
                        selected={selectedEndDate}
                        onChange={(date) => {setSelectedEndDate(date);}}
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
            </div>


            <div className="grid grid-cols-2 gap-4 mb-10">
                {Array.from({length: 4}).map((_, index) => (
                    <Listbox
                        key={index}
                        value={selectedPlayers[index]}
                        onChange={(selectedPlayer) =>
                            handlePlayerSelection(index, selectedPlayer)
                        }
                    >
                        <div className="relative border-2 rounded-lg border-[#232e39] mx-2">
                            <ListboxButton className="w-full h-16 text-center bg-white text-black rounded-md px-2 py-1">
                                {selectedPlayers[index]?.name || "Vælg spiller"}
                            </ListboxButton>
                            <ListboxOptions
                                className="absolute mt-1 w-full bg-white shadow-md rounded-md z-50 max-h-60 overflow-y-auto text-black"
                            >
                                {players
                                    .filter((player) => !selectedPlayers.some((selected) => selected?.id === player.id)) // Fjern allerede valgte spillere
                                    .map((player) => (
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
                ))}
            </div>

            <div className="flex justify-center mt-10">
                <button
                    className="rounded-xl p-2 text-3xl border-[#232e39] border-2 mb-52"
                    onClick={handleConfirmPracticeTeams}
                >
                    Bekræft valg
                </button>
            </div>
        </div>
    );
};

export default PracticeTeamsScreen;

import { useEffect, useMemo, useState } from "react";
import { PlayerInterface, PracticeTeamInterface } from "../utils/interfaces.ts";
import PracticeTeamService from "../services/PracticeTeamService.tsx";
import BackArrow from "../components/BackArrow.tsx";
import PlayerService from "../services/PlayerService.tsx";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { format, parse } from "date-fns";
import { da } from "date-fns/locale";
import { registerLocale } from "react-datepicker";

registerLocale("da", da);

const EditPracticeTeams = () => {
    const [practiceTeams, setPracticeTeams] = useState<PracticeTeamInterface[]>([]);
    const [players, setPlayers] = useState<PlayerInterface[]>([]);
    const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [oldPlayerId, setOldPlayerId] = useState<string | null>(null);
    const [newPlayerId, setNewPlayerId] = useState<string | null>(null);
    const [selectedTeam, setSelectedTeam] = useState<PracticeTeamInterface | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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
                const sortedPlayers = response.sort((a, b) => a.name.localeCompare(b.name));
                setPlayers(sortedPlayers);
            } catch (error) {
                console.error("Error fetching players:", error);
            }
        };
        Promise.all([fetchPracticeTeams(), fetchPlayers()]).then(() => setIsLoading(false));
    }, []);

    const toggleDate = (date: string) => {
        setExpandedDates((prev) => {
            const updated = new Set(prev);
            if (updated.has(date)) {
                updated.delete(date);
            } else {
                updated.add(date);
            }
            return updated;
        });
    };

    const getPlayerName = (id: string): string => {
        const player = players.find((p) => p.id === id);
        return player ? player.name : "Ukendt spiller";
    };

    const groupedTeams = useMemo(() => {
        return practiceTeams.reduce((acc, team) => {
            const date = format(new Date(team.startTime), "dd/MM/yyyy");
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(team);
            return acc;
        }, {} as Record<string, PracticeTeamInterface[]>);
    }, [practiceTeams]);

    const openModal = (playerId: string, team: PracticeTeamInterface) => {
        setOldPlayerId(playerId); // Sæt spilleren, der skal erstattes
        setNewPlayerId(playerId); // Sæt default til den valgte spiller
        setSelectedTeam(team);
        setIsModalOpen(true);
    };


    const closeModal = () => {
        setOldPlayerId(null);
        setNewPlayerId(null);
        setSelectedTeam(null);
        setIsModalOpen(false);
    };

    const handlePlayerChange = (playerId: string) => {
        setNewPlayerId(playerId); // Sæt den nye spiller korrekt
    };

    const handleSavePlayerChange = async () => {
        if (!oldPlayerId || !newPlayerId || !selectedTeam) {
            console.error("Missing required data:", { oldPlayerId, newPlayerId, selectedTeam });
            return;
        }

        try {
            await PracticeTeamService.patchPlayer(selectedTeam.id!, oldPlayerId, newPlayerId);

            // Opdater UI
            setPracticeTeams((prev) =>
                prev.map((team) =>
                    team.id === selectedTeam.id
                        ? {
                            ...team,
                            players: team.players.map((player) =>
                                player === oldPlayerId ? newPlayerId : player
                            ),
                        }
                        : team
                )
            );

            closeModal();
        } catch {
            console.error("Fejl under opdatering af spiller. Prøv igen");
        }
    };

    const availablePlayers = useMemo(() => {
        if (!selectedTeam || !oldPlayerId) return [];
        return players.filter((player) =>
            !selectedTeam.players.includes(player.id!) && player.id !== oldPlayerId
        );
    }, [players, selectedTeam, oldPlayerId]);

    if (isLoading) {
        return <p className="text-center mt-10">Indlæser træningshold...</p>;
    }

    return (
        <div>
            <BackArrow />
            <h1 className="text-3xl text-center font-semibold">Redigér privat time</h1>
            {Object.keys(groupedTeams).length > 0 ? (
                <ul>
                    {Object.keys(groupedTeams)
                        .sort((a, b) =>
                            parse(a, "dd/MM/yyyy", new Date()).getTime() -
                            parse(b, "dd/MM/yyyy", new Date()).getTime()
                        )
                        .map((date) => (
                            <li key={date} className="border-b-2 pb-4 my-4">
                                <div className="flex justify-between items-center">
                                    <div className="ml-2 text-lg font-semibold cursor-pointer">{date}</div>
                                    <ChevronRightIcon
                                        className={`h-6 mr-2 cursor-pointer transition-transform duration-300 ${
                                            expandedDates.has(date) ? "rotate-90" : ""
                                        }`}
                                        onClick={() => toggleDate(date)}
                                    />
                                </div>
                                {expandedDates.has(date) && (
                                    <ul className="mt-4 border-gray-300">
                                        {groupedTeams[date].map((team) => (
                                            <li key={`${date}-${team.id}`} className="mb-4">
                                                <div className="font-semibold mb-3 border-t">
                                                    <p className="p-2">
                                                        {format(team.startTime, "HH:mm")} - {format(team.endTime, "HH:mm")}
                                                    </p>
                                                </div>
                                                <ul>
                                                    {team.players.map((playerId) => (
                                                        <li
                                                            key={playerId}
                                                            className="mb-2 p-2 mx-1 cursor-pointer hover:bg-gray-700 border-2 border-[#232e39] rounded-xl"
                                                            onClick={() => openModal(playerId, team)}
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
                        ))}
                </ul>
            ) : (
                <p className="text-center mt-10">Ingen kommende træningshold oprettet... endnu!</p>
            )}

            {isModalOpen && selectedTeam && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-semibold mb-4">Vælg ny spiller</h2>
                        <Listbox value={newPlayerId} onChange={handlePlayerChange}>
                            {({ open }) => (
                                <div className="relative">
                                    <ListboxButton className="w-full p-2 border rounded bg-white text-left">
                                        {getPlayerName(newPlayerId || "")}
                                    </ListboxButton>
                                    {open && (
                                        <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto bg-white border rounded shadow-lg">
                                            {availablePlayers.map((player) => (
                                                <ListboxOption
                                                    key={player.id}
                                                    value={player.id}
                                                    className="cursor-pointer px-4 py-2 hover:bg-gray-200"
                                                >
                                                    {player.name}
                                                </ListboxOption>
                                            ))}
                                        </ListboxOptions>
                                    )}
                                </div>
                            )}
                        </Listbox>
                        <div className="flex justify-end mt-4">
                            <button
                                className="bg-blue-500 text-white py-2 px-4 rounded mr-2"
                                onClick={handleSavePlayerChange}
                            >
                                Gem
                            </button>
                            <button className="bg-gray-500 text-white py-2 px-4 rounded" onClick={closeModal}>
                                Annuller
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditPracticeTeams;

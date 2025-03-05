import BackArrow from "../components/BackArrow";
import Modal from "../components/Modal";
import {useEffect, useState} from "react";
import { PlayerInterface, RoundInterface } from "../utils/interfaces";
import RoundService from "../services/RoundService";
import PlayerService from "../services/PlayerService";
import { format } from "date-fns";
import { da } from "date-fns/locale";
import {Listbox, ListboxButton, ListboxOption, ListboxOptions} from "@headlessui/react";
import {ChevronDownIcon, ChevronRightIcon} from "@heroicons/react/24/outline";

const EditRounds = () => {
    const [rounds, setRounds] = useState<RoundInterface[]>([]);
    const [players, setPlayers] = useState<PlayerInterface[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedRound, setExpandedRound] = useState<string | null>(null);
    const [selectedMatch, setSelectedMatch] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchRounds = async () => {
            const response = await RoundService.getRounds();
            const sortedResponse = response.sort((a, b) => a.startTime.localeCompare(b.startTime));
            setRounds(sortedResponse);
        };

        const fetchPlayers = async () => {
            const playerResponse = await PlayerService.getPlayers();
            const sortedPlayers = playerResponse.sort((a, b) => a.name.localeCompare(b.name));
            setPlayers(sortedPlayers);
        };

        Promise.all([fetchRounds(), fetchPlayers()]).then(() => setIsLoading(false));
    }, []);

    const getPlayerName = (id: string | undefined): string => {
        const player = players.find((p) => p.id === id);
        return player ? player.name : "Ukendt spiller";
    };

    const openModal = (match: any, roundId: string) => {
        setSelectedMatch({ ...match, roundId }); // Inkluder hele match-objektet
        setIsModalOpen(true);

    };


    const closeModal = () => {
        setSelectedMatch(null);
        setIsModalOpen(false);
    };

    const handlePlayerChange = (team: "team1" | "team2", playerIndex: 1 | 2, newPlayerId: string) => {
        if (selectedMatch) {
            setSelectedMatch((prevMatch: any) => ({
                ...prevMatch,
                [team]: {
                    ...prevMatch[team], // Bevar sidesFixed og andre felter
                    [`player${playerIndex}`]: newPlayerId, // Opdater kun spilleren
                },
            }));

        }
    };

    const toggleRound = (roundId: string) => {
        setExpandedRound(expandedRound === roundId ? null : roundId); // Lukker hvis allerede åben, ellers åbner
    };



    const saveChanges = () => {
        if (selectedMatch) {
            const { roundId, id: matchId, team1, team2 } = selectedMatch;

            if (!roundId || !matchId) {
                console.error("roundId or matchId is missing");
                return;
            }

            // Send hele team1 og team2, inklusive sidesFixed
            RoundService.updateMatchTeams(roundId, matchId, {
                team1: { ...team1 },
                team2: { ...team2 },
            }).then(() => {
                setRounds((prevRounds) =>
                    prevRounds.map((round) =>
                        round.id === roundId
                            ? {
                                ...round,
                                matches: round.matches.map((match) =>
                                    match.id === matchId ? selectedMatch : match
                                ),
                            }
                            : round
                    )
                );
                closeModal();
            });
        }
    };

    const matchNames = ["Tekniktræning", "Kamp 1", "Kamp 2", "Kamp 3", "Kamp 4"];



    if (isLoading) {
        return <p className="text-center mt-10">Indlæser runder...</p>;
    }

    return (
        <div>
            <BackArrow />
            <h1 className="text-3xl text-center font-semibold">Redigér runder</h1>

            {rounds.length > 0 ? (
                <ul>
                    {rounds.map((round) => {
                        const isExpanded = expandedRound === round.id;
                        return (
                            <li key={round.id} className="border-b-2 pb-4 my-4">
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

                                {isExpanded && (
                                    <ul className="mt-4 px-4">
                                        {round.matches.map((match, index) => {

                                            return (
                                                match.id && (
                                                    <li
                                                        key={match.id}
                                                        className="mb-4 p-2 border-2 border-[#232e39] rounded-xl cursor-pointer"
                                                        onClick={() => openModal(match, round.id!)}
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
                                )}
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <p className="text-center mt-10">Ingen kommende kampe sat... endnu!</p>
            )}

            {isModalOpen && selectedMatch && (
                <Modal onClose={closeModal}>
                    {/* Hold 1 */}
                    <div className="mb-6">
                        <h3 className="font-semibold text-lg text-center mb-4">Hold 1</h3>
                        <div className="mb-4">
                            <label className="block font-medium mb-2">Venstre</label>
                            <Listbox
                                value={selectedMatch.team1.player1}
                                onChange={(value) => handlePlayerChange("team1", 1, value)}
                            >
                                {({open}) => (
                                    <div className="relative">
                                        <ListboxButton className="w-full p-2 border rounded bg-white text-left">
                                            {getPlayerName(selectedMatch.team1.player1)}
                                        </ListboxButton>
                                        {open && (
                                            <ListboxOptions
                                                className="absolute z-10 mt-1 max-h-60 w-full overflow-auto bg-white border rounded shadow-lg">
                                                {players.map((player) => (
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
                        </div>
                        <div className="mb-4">
                            <label className="block font-medium mb-2">Højre</label>
                            <Listbox
                                value={selectedMatch.team1.player2}
                                onChange={(value) => handlePlayerChange("team1", 2, value)}
                            >
                                {({ open }) => (
                                    <div className="relative">
                                        <ListboxButton className="w-full p-2 border rounded bg-white text-left">
                                            {getPlayerName(selectedMatch.team1.player2)}
                                        </ListboxButton>
                                        {open && (
                                            <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto bg-white border rounded shadow-lg">
                                                {players.map((player) => (
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
                        </div>
                    </div>
                    {/* Hold 2 */}
                    <div className="mb-6">
                        <h3 className="font-semibold text-lg text-center mb-4">Hold 2</h3>
                        <div className="mb-4">
                            <label className="block font-medium mb-2">Venstre</label>
                            <Listbox
                                value={selectedMatch.team2.player1}
                                onChange={(value) => handlePlayerChange("team2", 1, value)}
                            >
                                {({ open }) => (
                                    <div className="relative">
                                        <ListboxButton className="w-full p-2 border rounded bg-white text-left">
                                            {getPlayerName(selectedMatch.team2.player1)}
                                        </ListboxButton>
                                        {open && (
                                            <ListboxOptions className="absolute z-10 bottom-full mb-1 max-h-60 w-full overflow-auto bg-white border rounded shadow-lg">
                                                {players.map((player) => (
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

                        </div>
                        <div className="mb-4">
                            <label className="block font-medium mb-2">Højre</label>
                            <Listbox
                                value={selectedMatch.team2.player2}
                                onChange={(value) => handlePlayerChange("team2", 2, value)}
                            >
                                {({ open }) => (
                                    <div className="relative">
                                        <ListboxButton className="w-full p-2 border rounded bg-white text-left">
                                            {getPlayerName(selectedMatch.team2.player2)}
                                        </ListboxButton>
                                        {open && (
                                            <ListboxOptions className="absolute z-10 bottom-full mb-1 max-h-60 w-full overflow-auto bg-white border rounded shadow-lg">
                                                {players.map((player) => (
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

                        </div>
                    </div>
                    <div className="mt-6">
                        <button
                            className="bg-blue-500 text-white py-2 px-4 rounded"
                            onClick={saveChanges}
                        >
                            Gem ændringer
                        </button>
                    </div>
                </Modal>
            )}


        </div>
    );
};

export default EditRounds;

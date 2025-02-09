import BackArrow from "../components/BackArrow.tsx";
import {useEffect, useState} from "react";
import {PlayerInterface} from "../utils/interfaces.ts";
import PlayerService from "../services/PlayerService.tsx";
import {XMarkIcon} from "@heroicons/react/24/outline";
import ExcelUploader from "../components/ExcelUploader.tsx";

export const AddPlayersScreen = () => {
    const [players, setPlayers] = useState<PlayerInterface[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [playerName, setPlayerName] = useState("");

    useEffect(() => {
        const fetchPlayers = async () => {
            const playerResponse = await PlayerService.getPlayers();
            const sortedPlayers = playerResponse.sort((a, b) => a.name.localeCompare(b.name));
            setPlayers(sortedPlayers);
        };

        fetchPlayers().then(() => setIsLoading(false));
    }, []);

    const handleAddPlayer = async () => {
        if (playerName.trim() === "") {
            return;
        }

        if (players.find((player) => player.name === playerName)) {
            return;
        }

        try {
            await PlayerService.addPlayer({name: playerName});
            alert("Spiller(e) tilføjet");
            setPlayerName("");
        } catch (error) {
            alert("Der skete en fejl");
        } finally {
            const playerResponse = await PlayerService.getPlayers();
            const sortedPlayers = playerResponse.sort((a, b) => a.name.localeCompare(b.name));
            setPlayers(sortedPlayers);
        }
    }

    const handleDeletePlayer = async (id: string, name: string) => {
        try {
            await PlayerService.deletePlayer(id);
            alert(name + " er slettet");
        } catch (error) {
            alert("Der skete en fejl");
        } finally {
            const playerResponse = await PlayerService.getPlayers();
            const sortedPlayers = playerResponse.sort((a, b) => a.name.localeCompare(b.name));
            setPlayers(sortedPlayers);
        }
    }

    if (isLoading) {
        return <p className="text-center mt-10">Indlæser spillere...</p>;
    }

    const handlePlayersAdded = async (newPlayers: string[]) => {
        // Filtrér kun de spillere, der ikke allerede er i listen
        const playersToAdd = newPlayers.filter((newPlayer) =>
            !players.some((player) => player.name === newPlayer)
        );

        if (playersToAdd.length === 0) {
            alert("Ingen nye spillere blev tilføjet.");
            return;
        }

        try {
            // Tilføj spillere én efter én for at sikre korrekt rækkefølge
            for (const name of playersToAdd) {
                await PlayerService.addPlayer({ name });
            }
            alert("Spillere tilføjet");
            window.location.reload();
        } catch (error) {
            alert("Der skete en fejl ved tilføjelse af spillere");
        }
    };


    return (
        <div>
            <BackArrow />
            <h1 className="text-3xl text-center font-semibold">Tilføj spillere</h1>

            <div className="flex mx-4">
                <input value={playerName} onChange={(e) => setPlayerName(e.target.value)} type="text" className="border-2 border-black rounded-xl pr-10 mt-4" placeholder="Indtast spillernavn" />
                <button onClick={handleAddPlayer} className="bg-blue-500 text-white px-10 rounded-xl mt-4 ml-10">Tilføj spiller</button>
                <div className="max-md:hidden ml-10">
                <ExcelUploader onPlayersAdded={handlePlayersAdded} />
                </div>
            </div>

            <ul>
                {players.map((player) => (
                    <li key={player.id} className="border-2 rounded-full border-black p-4 my-4 mx-4 flex justify-between">
                        <p>{player.name}</p>
                        <XMarkIcon onClick={() => handleDeletePlayer(player.id!, player.name)} className="h-6 w-6 text-red-500 cursor-pointer" />
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AddPlayersScreen;
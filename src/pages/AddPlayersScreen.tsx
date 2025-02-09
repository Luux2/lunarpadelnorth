import BackArrow from "../components/BackArrow.tsx";
import {useEffect, useState} from "react";
import {PlayerInterface} from "../utils/interfaces.ts";
import PlayerService from "../services/PlayerService.tsx";
import {XMarkIcon} from "@heroicons/react/24/outline";

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
            alert("Spiller tilføjet");
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


    return (
        <div>
            <BackArrow />
            <h1 className="text-3xl text-center font-semibold">Tilføj spillere</h1>

            <div className="flex mx-4">
                <input value={playerName} onChange={(e) => setPlayerName(e.target.value)} type="text" className="border-2 border-black rounded-full px-4 py-2 mt-4" placeholder="Indtast spillernavn" />
                <button onClick={handleAddPlayer} className="bg-green-500 text-white px-4 py-2 rounded-full mt-4 ml-10">Tilføj spiller</button>
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
import { Button } from "@headlessui/react";
import {useNavigate} from "react-router-dom";

const IndexScreen = () => {
    const navigate = useNavigate();


    const handleCreateMatches = () => {
        navigate("/create-matches");
    }

    const handleAllRounds = () => {
        navigate("/rounds");
    }

    const handleAllPracticeTeams = () => {
        navigate("/practice-teams");
    }

    const handleViewPracticeTeams = () => {
        navigate("/view-practice-teams");
    }

    const handleEdit = () => {
        //navigate("/edit");
        navigate("/edit-rounds");
    }

    return (
        <div className="flex items-center justify-center h-screen">
            <div className="flex flex-col space-y-10 text-center">
                <h1 className="text-4xl font-semibold">PN Træningsapp</h1>

                <Button className="bg-green-500 rounded-3xl py-2 font-semibold" onClick={handleCreateMatches}>Opret
                    runde</Button>
                <Button className="bg-orange-500 rounded-3xl py-2 font-semibold" onClick={handleAllRounds}>Se
                    runder</Button>
                <Button className="bg-yellow-500 rounded-3xl py-2 font-semibold hidden" onClick={handleAllPracticeTeams}>Opret
                    træningshold</Button>
                <Button className="bg-purple-500 rounded-3xl py-2 font-semibold hidden" onClick={handleViewPracticeTeams}>Se
                    træningshold</Button>
                <Button className="bg-pink-500 rounded-3xl py-2 font-semibold" onClick={handleEdit}>Rediger runder</Button>
                <Button className="bg-cyan-500 rounded-3xl py-2 font-semibold" onClick={() => navigate('/addplayers')}>Tilføj spillere</Button>
            </div>
        </div>
    );
};
export default IndexScreen;

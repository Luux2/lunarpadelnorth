import BackArrow from "../components/BackArrow.tsx";
import {Button} from "@headlessui/react";
import {useNavigate} from "react-router-dom";

const EditScreen = () => {
    const navigate = useNavigate();

    const handleEditRounds = () => {
        navigate("/edit-rounds");
    }

    const handleViewPracticeTeams = () => {
        navigate("/edit-practice-teams");
    };

    return (
        <div>
            <BackArrow/>

        <div className="flex items-center justify-center h-screen -mt-32">
            <div className="flex flex-col space-y-10 text-center w-64">
                <h1 className="text-3xl text-center font-semibold">Hvad vil du redigere?</h1>

                <Button className="bg-orange-500 rounded-3xl py-2 font-semibold" onClick={handleEditRounds}>Træningskampe</Button>
                <Button className="bg-purple-500 rounded-3xl py-2 font-semibold" onClick={handleViewPracticeTeams}>Privat time</Button>
            </div>
        </div>
        </div>
    );
}

export default EditScreen;
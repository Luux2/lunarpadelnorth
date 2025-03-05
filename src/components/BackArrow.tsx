import {ArrowLongLeftIcon} from "@heroicons/react/24/outline";
import {useNavigate} from "react-router-dom";

const BackArrow = () => {
    const navigate = useNavigate();

    const handleNavigateBack = () => {
        if (window.history.length > 1) {
            navigate(-1); // ✅ Gå tilbage, hvis muligt
        } else {
            navigate("/"); // ✅ Send brugeren til en sikker fallback-side
        }
    };



    return (
        <>
            <div
                onClick={handleNavigateBack} // 🚀 Klik kan nu registreres over hele området
                className="ml-3 mt-5 h-8 w-8 shrink-0 rounded-full p-1 border bg-[#4e4e4e] cursor-pointer flex items-center justify-center"
            >
                <ArrowLongLeftIcon className="h-full w-full text-white" />
            </div>


        </>
    )
}
export default BackArrow

import {ArrowLongLeftIcon} from "@heroicons/react/24/outline";
import {useNavigate} from "react-router-dom";

const BackArrow = () => {
    const navigate = useNavigate();

    const handleNavigateBack = () => {
        navigate(-1);
    }


    return (
        <>
            <div className="ml-3 mt-5 h-8 w-8 shrink-0 rounded-full p-1 border bg-[#4e4e4e]">
                <ArrowLongLeftIcon className="h-full w-full rounded-full text-white" onClick={handleNavigateBack}/>
            </div>

        </>
    )
}
export default BackArrow

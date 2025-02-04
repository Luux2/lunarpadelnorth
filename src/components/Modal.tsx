import {FC, ReactNode} from "react";

interface ModalProps {
    children: ReactNode;
    onClose: () => void;
}

const Modal: FC<ModalProps> = ({ children, onClose }) => {
    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-3/4 max-w-lg">
                {children}
                <button
                    className="mt-4 bg-red-500 text-white py-2 px-4 rounded"
                    onClick={onClose}
                >
                    Luk
                </button>
            </div>
        </div>
    );
};

export default Modal;

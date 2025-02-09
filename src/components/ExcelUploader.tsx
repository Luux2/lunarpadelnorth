import React, { FC, useState } from "react";
import { read, utils } from "xlsx";
import { XMarkIcon } from "@heroicons/react/24/outline";

const ExcelUploader: FC<{ onPlayersAdded: (players: string[]) => void }> = ({ onPlayersAdded }) => {
    const [fileName, setFileName] = useState<string>("");
    const [parsedPlayers, setParsedPlayers] = useState<string[]>([]);
    const [showPreview, setShowPreview] = useState(false);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setFileName(file.name);

        const reader = new FileReader();
        reader.onload = (e) => {
            const arrayBuffer = e.target?.result;
            if (!arrayBuffer || !(arrayBuffer instanceof ArrayBuffer)) return;

            const data = new Uint8Array(arrayBuffer);
            const workbook = read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0]; // Vælg første ark
            const sheet = workbook.Sheets[sheetName];
            const jsonData: any[][] = utils.sheet_to_json(sheet, { header: 1 }) as any[][];

            if (jsonData.length > 1) {
                const players = jsonData.slice(1) // Spring header over
                    .map((row) => row[0]) // Tag kun første kolonne
                    .filter((name) => typeof name === "string" && name.trim() !== ""); // Filtrér ugyldige værdier

                setParsedPlayers(players);
            }
        };

        reader.readAsArrayBuffer(file);
    };

    const handleConfirmUpload = () => {
        onPlayersAdded(parsedPlayers);
        setShowPreview(false);
    };

    return (
        <div className="mt-5 flex items-center border border-black rounded-xl p-2">
            <input id="file-upload" type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} className="hidden" />
            <label
                htmlFor="file-upload"
                className="cursor-pointer bg-green-500 text-white px-4 py-2 rounded inline-block"
            >
                {fileName ? `Valgt fil: ${fileName}` : "Vælg en Excel-fil"}
            </label>

            <h1 className="font-semibold ml-5">Spillere skal fremgå i første kolonne af regnearket</h1>

            {parsedPlayers.length > 0 && (
                <button
                    onClick={() => setShowPreview(true)}
                    className="bg-green-500 text-white px-4 py-2 rounded ml-10"
                >
                    Åbn fil
                </button>
            )}

            {showPreview && (
                <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-semibold mb-4">Bekræft spillere</h2>
                        <ul className="max-h-60 overflow-auto border p-2 rounded">
                            {parsedPlayers.map((player, index) => (
                                <li key={index} className="border-b py-2 flex justify-between">
                                    <p>{player}</p>
                                    <XMarkIcon
                                        onClick={() => setParsedPlayers((prev) => prev.filter((_, i) => i !== index))}
                                        className="h-6 w-6 text-red-500 cursor-pointer"
                                    />
                                </li>
                            ))}
                        </ul>
                        <div className="mt-4 flex justify-between">
                            <button onClick={() => setShowPreview(false)} className="bg-red-500 text-white px-4 py-2 rounded">
                                Luk
                            </button>
                            <button onClick={handleConfirmUpload} className="bg-green-500 text-white px-4 py-2 rounded">
                                Bekræft
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExcelUploader;

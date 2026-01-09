/**
 * Excel Viewer Component
 */

import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

interface ExcelViewerProps {
    url: string;
}

export function ExcelViewer({ url }: ExcelViewerProps) {
    const [data, setData] = useState<any[][]>([]);
    const [sheetNames, setSheetNames] = useState<string[]>([]);
    const [activeSheet, setActiveSheet] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!url) return;

        setLoading(true);
        fetch(url)
            .then(res => res.arrayBuffer())
            .then(buffer => {
                const workbook = XLSX.read(buffer);
                setSheetNames(workbook.SheetNames);

                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData: any[][] = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
                setData(jsonData);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error loading Excel:', err);
                setLoading(false);
            });
    }, [url]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500">
                Loading spreadsheet...
            </div>
        );
    }

    if (!data.length) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500">
                No data available
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Sheet Tabs */}
            {sheetNames.length > 1 && (
                <div className="flex gap-2 px-6 py-3 border-b border-white/10 bg-white/5 overflow-x-auto">
                    {sheetNames.map((name, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveSheet(i)}
                            className={`
                                px-4 py-2 rounded-lg text-sm font-medium transition
                                ${activeSheet === i
                                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }
                            `}
                        >
                            {name}
                        </button>
                    ))}
                </div>
            )}

            {/* Table */}
            <div className="flex-1 overflow-auto p-6">
                <table className="w-full text-sm border-collapse">
                    <tbody>
                        {data.map((row, i) => (
                            <tr
                                key={i}
                                className={i === 0 ? 'bg-orange-500/10' : 'hover:bg-white/5'}
                            >
                                {row.map((cell, j) => (
                                    <td
                                        key={j}
                                        className={`
                                            px-4 py-2 border border-white/10
                                            ${i === 0
                                                ? 'font-semibold text-orange-400'
                                                : 'text-gray-300'
                                            }
                                        `}
                                    >
                                        {cell !== null && cell !== undefined ? String(cell) : ''}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

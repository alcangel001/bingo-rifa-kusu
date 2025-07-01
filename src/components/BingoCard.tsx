
import React from 'react';
import { BingoCard as BingoCardType } from '../types';

interface BingoCardProps {
    card: BingoCardType;
    calledNumbers: number[];
}

const BingoCard: React.FC<BingoCardProps> = ({ card, calledNumbers }) => {
    const letters = ['B', 'I', 'N', 'G', 'O'];

    return (
        <div className="bg-slate-800/50 p-4 rounded-xl shadow-lg border border-slate-700 aspect-square">
            <div className="grid grid-cols-5 gap-1 text-center">
                {letters.map(letter => (
                    <div key={letter} className="text-2xl font-black text-cyan-400 pb-2">
                        {letter}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-5 gap-2">
                {card.map((column, colIndex) => (
                    <div key={colIndex} className="grid grid-rows-5 gap-2">
                        {column.map((cell, rowIndex) => {
                            const isCalled = cell.value !== 'FREE' && calledNumbers.includes(cell.value);
                            const isFree = cell.value === 'FREE';

                            let cellClasses = 'w-full aspect-square flex items-center justify-center rounded-full text-lg font-bold transition-all duration-300 ';
                            if (isFree || isCalled) {
                                cellClasses += 'bg-gradient-to-br from-yellow-400 to-orange-500 text-slate-900 scale-105 shadow-lg shadow-yellow-500/20';
                            } else {
                                cellClasses += 'bg-slate-700 text-slate-300';
                            }

                            return (
                                <div key={`${colIndex}-${rowIndex}`} className={cellClasses}>
                                    {cell.value}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BingoCard;
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { Game, GameStatus, UserRole, GameMode, BingoPattern } from '../types';
import { FullHouseIcon, AnyLineIcon, FourCornersIcon, CrossIcon, LetterXIcon, SmallSquareIcon, TopRowIcon, MiddleRowIcon, BottomRowIcon, LeftLIcon, RightLIcon } from './Icon';

interface CreateGameModalProps {
    onClose: () => void;
}

const PATTERNS = [
    { type: BingoPattern.ANY_LINE, icon: AnyLineIcon, name: "Cualquier Línea" },
    { type: BingoPattern.FOUR_CORNERS, icon: FourCornersIcon, name: "4 Esquinas" },
    { type: BingoPattern.CROSS, icon: CrossIcon, name: "Cruz" },
    { type: BingoPattern.LETTER_X, icon: LetterXIcon, name: "Letra X" },
    { type: BingoPattern.SMALL_SQUARE, icon: SmallSquareIcon, name: "Cuadrito" },
    { type: BingoPattern.TOP_ROW, icon: TopRowIcon, name: "Línea Arriba" },
    { type: BingoPattern.MIDDLE_ROW, icon: MiddleRowIcon, name: "Línea Medio" },
    { type: BingoPattern.BOTTOM_ROW, icon: BottomRowIcon, name: "Línea Abajo" },
    { type: BingoPattern.LEFT_L, icon: LeftLIcon, name: "L Izquierda" },
    { type: BingoPattern.RIGHT_L, icon: RightLIcon, name: "L Derecha" },
    { type: BingoPattern.FULL_HOUSE, icon: FullHouseIcon, name: "Cartón Lleno" },
];

const PatternButton: React.FC<{ Icon: React.FC<{className?: string}>, name: string, isSelected: boolean, onClick: () => void }> = ({ Icon, name, isSelected, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg text-center font-semibold transition-all duration-200 border-2 ${isSelected ? 'bg-cyan-500 border-cyan-400 text-white shadow-lg scale-105' : 'bg-slate-700 border-slate-600 hover:bg-slate-600'}`}
    >
        <Icon className="w-8 h-8"/>
        <span className="text-xs font-bold">{name}</span>
    </button>
);


const CreateGameModal: React.FC<CreateGameModalProps> = ({ onClose }) => {
    const { currentUser, updateBalance } = useAuth();
    const { addGame } = useGame();
    const [prize, setPrize] = useState('');
    const [cardPrice, setCardPrice] = useState('');
    const [mode, setMode] = useState<GameMode>(GameMode.AUTOMATIC);
    const [pattern, setPattern] = useState<BingoPattern>(BingoPattern.ANY_LINE);
    const [error, setError] = useState('');

    const handleCreateGame = (e: React.FormEvent) => {
        e.preventDefault();
        const prizeAmount = parseInt(prize, 10);
        const cardPriceAmount = parseInt(cardPrice, 10);

        if (!currentUser || currentUser.role !== UserRole.ORGANIZER) {
            setError('Solo los organizadores pueden crear partidas.');
            return;
        }
        if (isNaN(prizeAmount) || isNaN(cardPriceAmount) || prizeAmount <= 0 || cardPriceAmount <= 0) {
            setError('Por favor, introduce números positivos válidos para el premio y el precio del cartón.');
            return;
        }
        if (prizeAmount > currentUser.balance) {
            setError('El monto del premio no puede exceder tu saldo actual.');
            return;
        }

        const newGame: Game = {
            id: `game-${Date.now()}`,
            organizerId: currentUser.id,
            organizerName: currentUser.name,
            prize: prizeAmount,
            cardPrice: cardPriceAmount,
            status: GameStatus.WAITING,
            players: [],
            calledNumbers: [],
            winners: [],
            createdAt: Date.now(),
            pot: prizeAmount,
            mode,
            pattern,
            payoutComplete: false,
        };

        addGame(newGame);
        updateBalance(currentUser.id, prizeAmount, 'subtract');
        onClose();
    };

    const OptionButton = ({ onClick, isSelected, children }: { onClick: () => void, isSelected: boolean, children: React.ReactNode }) => (
        <button
            type="button"
            onClick={onClick}
            className={`flex-1 p-3 rounded-lg text-center font-semibold transition-all duration-200 border-2 ${isSelected ? 'bg-cyan-500 border-cyan-400 text-white shadow-lg' : 'bg-slate-700 border-slate-600 hover:bg-slate-600'}`}
        >
            {children}
        </button>
    );

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-2xl border border-slate-700 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">&times;</button>
                <h2 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Crear Nueva Partida</h2>
                <form onSubmit={handleCreateGame} className="space-y-6">
                    {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-lg text-sm">{error}</p>}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="prize" className="block text-slate-300 text-sm font-bold mb-2">Monto del Premio</label>
                            <input
                                type="number"
                                id="prize"
                                value={prize}
                                onChange={(e) => setPrize(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                placeholder="ej., 1000"
                                min="1"
                            />
                        </div>
                        <div>
                            <label htmlFor="cardPrice" className="block text-slate-300 text-sm font-bold mb-2">Precio por Cartón</label>
                            <input
                                type="number"
                                id="cardPrice"
                                value={cardPrice}
                                onChange={(e) => setCardPrice(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                placeholder="ej., 50"
                                min="1"
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-slate-300 text-sm font-bold mb-2">Tipo de Bingo</label>
                        <div className="grid grid-cols-4 gap-2">
                           {PATTERNS.map(({type, icon, name}) => (
                                <PatternButton 
                                    key={type}
                                    Icon={icon}
                                    name={name}
                                    isSelected={pattern === type}
                                    onClick={() => setPattern(type)}
                                />
                           ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-slate-300 text-sm font-bold mb-2">Modo de Juego</label>
                        <div className="flex gap-2">
                           <OptionButton isSelected={mode === GameMode.AUTOMATIC} onClick={() => setMode(GameMode.AUTOMATIC)}>{GameMode.AUTOMATIC}</OptionButton>
                           <OptionButton isSelected={mode === GameMode.MANUAL} onClick={() => setMode(GameMode.MANUAL)}>{GameMode.MANUAL}</OptionButton>
                        </div>
                    </div>
                    
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg shadow-cyan-500/20"
                    >
                        Crear Partida y Publicar Premio
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateGameModal;
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { Game, GameStatus, BingoCard as BingoCardType, UserRole, GameMode } from '../types';
import { checkBingoWinner, generateBingoCard } from '../utils/bingo';
import BingoCard from './BingoCard';
import ChatModal from './ChatModal';
import { SoundOnIcon, SoundOffIcon, ChatBubbleLeftRightIcon } from './Icon';

interface GameScreenProps {
    gameId: string;
    onExit: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ gameId, onExit }) => {
    const { games, updateGame } = useGame();
    const { currentUser, updateBalance, users } = useAuth();
    const { getUnreadCountForPartner } = useChat();

    const [game, setGame] = useState<Game | null>(() => games.find(g => g.id === gameId) || null);
    const [manualNumber, setManualNumber] = useState('');
    const [manualError, setManualError] = useState('');
    const [isSoundEnabled, setIsSoundEnabled] = useState(false);
    const [isChatOpen, setChatOpen] = useState(false);

    // Sync global game state to local component state
    useEffect(() => {
        const updatedGameFromGlobal = games.find(g => g.id === gameId);
        if (updatedGameFromGlobal) {
            // Update local state only if it's different to prevent infinite loops
            if (JSON.stringify(updatedGameFromGlobal) !== JSON.stringify(game)) {
                setGame(updatedGameFromGlobal);
            }
        }
    }, [games, gameId, game]);

    const speak = useCallback((text: string, force: boolean = false) => {
        if (!isSoundEnabled && !force) return;
        try {
            // Cancel any previous speech to prevent overlap
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'es-ES';
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        } catch (error) {
            console.error("Speech synthesis not supported or failed.", error);
        }
    }, [isSoundEnabled]);

    const lastCalledNumber = game?.calledNumbers.length > 0 ? game.calledNumbers[game.calledNumbers.length - 1] : null;

    useEffect(() => {
        if(lastCalledNumber) {
            speak(lastCalledNumber.toString());
        }
    }, [lastCalledNumber, speak]);
    
    const playerInfo = useMemo(() => {
        if (!game || !currentUser) return null;
        return game.players.find(p => p.userId === currentUser.id);
    }, [game, currentUser]);


    const processCalledNumber = useCallback((numberToCall: number, currentGame: Game): Game => {
        if (currentGame.calledNumbers.includes(numberToCall)) {
            return currentGame; // Do not process if number is already called
        }
        const newCalledNumbers = [...currentGame.calledNumbers, numberToCall];

        let winners: string[] = [];
        for (const player of currentGame.players) {
            for (const card of player.cards) {
                if (checkBingoWinner(card, newCalledNumbers, currentGame.pattern)) {
                    if (!winners.includes(player.userId)) {
                        winners.push(player.userId);
                    }
                }
            }
        }
        
        if (winners.length > 0) {
            return { ...currentGame, calledNumbers: newCalledNumbers, winners, status: GameStatus.FINISHED };
        }

        return { ...currentGame, calledNumbers: newCalledNumbers };
    }, []);


    // Automatic game engine effect
    useEffect(() => {
        if (!game || game.status !== GameStatus.IN_PROGRESS || game.winners.length > 0 || game.mode !== GameMode.AUTOMATIC) return;

        const allNumbers = Array.from({ length: 75 }, (_, i) => i + 1);

        const interval = setInterval(() => {
            setGame(prevGame => {
                if (!prevGame || prevGame.winners.length > 0 || prevGame.status !== GameStatus.IN_PROGRESS) {
                    clearInterval(interval);
                    return prevGame;
                }
                
                const availableNumbers = allNumbers.filter(n => !prevGame.calledNumbers.includes(n));
                 if (availableNumbers.length === 0) {
                    clearInterval(interval);
                    const finishedGame = { ...prevGame, status: GameStatus.FINISHED };
                    updateGame(finishedGame);
                    return finishedGame;
                }

                const randomIndex = Math.floor(Math.random() * availableNumbers.length);
                const newNumber = availableNumbers[randomIndex];
                const updatedGame = processCalledNumber(newNumber, prevGame);
                updateGame(updatedGame);
                return updatedGame;
            });
        }, 2500);

        return () => clearInterval(interval);
    }, [game?.status, game?.id, game?.mode, game?.winners.length, processCalledNumber, updateGame]);
    
    // Distribute prize money when winners are declared
    useEffect(() => {
        if (game && game.status === GameStatus.FINISHED && game.winners.length > 0 && !game.payoutComplete) {
            const admin = users.find(u => u.role === UserRole.ADMIN);
            const commission = Math.floor(game.pot * 0.05); // 5% commission
            const prizeToDistribute = game.pot - commission;
            const prizePerWinner = game.winners.length > 0 ? Math.floor(prizeToDistribute / game.winners.length) : 0;

            game.winners.forEach(winnerId => {
                updateBalance(winnerId, prizePerWinner, 'add');
            });

            if (admin) {
                updateBalance(admin.id, commission, 'add');
            }
            
            const updatedGame = { ...game, payoutComplete: true };
            setGame(updatedGame);
            updateGame(updatedGame);
        }
    }, [game, users, updateBalance, updateGame]);


    const handleStartGame = () => {
        if (game && currentUser?.id === game.organizerId && game.status === GameStatus.WAITING) {
            const updatedGame = { ...game, status: GameStatus.IN_PROGRESS };
            setGame(updatedGame);
            updateGame(updatedGame);
        }
    };

    const handleManualCall = (e: React.FormEvent) => {
        e.preventDefault();
        setManualError('');
        const num = parseInt(manualNumber, 10);
        if(isNaN(num) || num < 1 || num > 75) {
            setManualError("Introduce un número válido entre 1 y 75.");
            return;
        }
        if(game?.calledNumbers.includes(num)) {
            setManualError("Este número ya ha sido cantado.");
            return;
        }
        
        setGame(prevGame => {
            if (!prevGame) return null;
            const updatedGame = processCalledNumber(num, prevGame);
            updateGame(updatedGame); // Sync change up to global state
            return updatedGame;
        });

        setManualNumber('');
    };
    
    const toggleSound = () => {
        const willBeEnabled = !isSoundEnabled;
        if (willBeEnabled) {
            // This first, user-initiated call is crucial to unlock the speech API
            speak("Sonido activado", true); 
        } else {
            window.speechSynthesis.cancel(); // Stop any ongoing speech
        }
        setIsSoundEnabled(willBeEnabled);
    };

    const handleBuyAnotherCard = () => {
        if (!game || !currentUser || !playerInfo) return;

        if (game.status !== GameStatus.WAITING) {
            alert("No se pueden comprar más cartones, la partida ya ha comenzado.");
            return;
        }

        if (currentUser.balance < game.cardPrice) {
            alert("No tienes suficientes créditos para comprar otro cartón.");
            return;
        }

        updateBalance(currentUser.id, game.cardPrice, 'subtract');
        const newCard = generateBingoCard();
        const updatedPlayers = game.players.map(p => 
            p.userId === currentUser.id ? { ...p, cards: [...p.cards, newCard] } : p
        );

        const updatedGame = {
            ...game,
            players: updatedPlayers,
            pot: game.pot + game.cardPrice,
        };
        
        setGame(updatedGame);
        updateGame(updatedGame);
    };

    if (!game || !currentUser) return <div className="text-center p-8">Cargando partida...</div>;

    const organizer = users.find(u => u.id === game.organizerId);
    const isPlayer = currentUser.id !== game.organizerId;
    const unreadMessagesCount = isPlayer && organizer ? getUnreadCountForPartner(organizer.id) : 0;

    return (
        <>
        <div className="space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold">Sala de Juego ({game.pattern})</h2>
                    <p className="text-slate-400">Pozo de Premios: {game.pot.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                    {isPlayer && organizer && (
                         <button onClick={() => setChatOpen(true)} title="Chatear con el organizador" className="relative bg-sky-600 hover:bg-sky-700 text-white font-bold p-3 rounded-full transition-colors">
                            <ChatBubbleLeftRightIcon className="w-6 h-6" />
                            {unreadMessagesCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                                    {unreadMessagesCount}
                                </span>
                            )}
                        </button>
                    )}
                    <button onClick={toggleSound} title={isSoundEnabled ? "Desactivar sonido" : "Activar sonido"} className="bg-slate-700 hover:bg-slate-600 text-white font-bold p-3 rounded-full transition-colors">
                        {isSoundEnabled ? <SoundOnIcon className="w-6 h-6" /> : <SoundOffIcon className="w-6 h-6" />}
                    </button>
                    <button onClick={onExit} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-5 rounded-full transition-colors">
                        Volver al Lobby
                    </button>
                </div>
            </div>
            
            {game.status === GameStatus.FINISHED && game.winners.length > 0 && (
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-2xl text-center shadow-2xl">
                    <h3 className="text-4xl font-extrabold text-white animate-pulse">¡BINGO!</h3>
                    <p className="text-xl text-white mt-2">
                        Ganador{game.winners.length > 1 ? 'es' : ''}: {game.winners.map(id => users.find(u=>u.id===id)?.name).join(', ')}
                    </p>
                </div>
            )}

            {game.status === GameStatus.WAITING && currentUser.id === game.organizerId && (
                <div className="text-center p-6 bg-slate-800 rounded-2xl">
                    <button onClick={handleStartGame} className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-full text-xl transition-transform transform hover:scale-105">
                        Iniciar Partida ({game.mode})
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-slate-800 p-6 rounded-2xl border border-slate-700 h-fit">
                    <h3 className="text-xl font-bold mb-4 text-cyan-400">Números Cantados</h3>
                    {lastCalledNumber && (
                        <div className="mb-6 text-center">
                            <p className="text-slate-400 text-sm">Último número</p>
                             <div className="w-28 h-28 mx-auto flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-slate-900 font-black text-6xl shadow-lg">
                                {lastCalledNumber}
                            </div>
                        </div>
                    )}
                     {game.status === GameStatus.IN_PROGRESS && game.mode === GameMode.MANUAL && currentUser.id === game.organizerId && game.winners.length === 0 && (
                        <form onSubmit={handleManualCall} className="mb-4 space-y-2">
                            <input
                                type="number"
                                value={manualNumber}
                                onChange={e => setManualNumber(e.target.value)}
                                placeholder="Cantar número..."
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                             {manualError && <p className="text-red-400 text-xs px-1">{manualError}</p>}
                            <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 rounded-lg">Cantar</button>
                        </form>
                    )}
                    <div className="flex flex-wrap gap-2 justify-center max-h-48 overflow-y-auto p-2 bg-slate-900/50 rounded-lg">
                        {[...game.calledNumbers].slice(0, -1).reverse().map(num => (
                             <div key={num} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-700 text-slate-300 font-bold text-sm shrink-0">
                                {num}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">Tus Cartones ({playerInfo?.cards.length || 0})</h3>
                         {isPlayer && game.status === GameStatus.WAITING && (
                            <button
                                onClick={handleBuyAnotherCard}
                                disabled={currentUser.balance < game.cardPrice}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
                                title={currentUser.balance < game.cardPrice ? 'Créditos insuficientes' : `Comprar por ${game.cardPrice}`}
                            >
                                Comprar Otro
                            </button>
                        )}
                    </div>
                    {playerInfo && playerInfo.cards.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {playerInfo.cards.map((card, i) => (
                                <BingoCard key={i} card={card} calledNumbers={game.calledNumbers} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center bg-slate-800 p-8 rounded-lg">
                           <p className="text-slate-400">{currentUser.id === game.organizerId ? 'Como organizador, no puedes comprar cartones en tu propia partida.' : 'No has comprado cartones para esta partida.'}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
        {isChatOpen && organizer && (
            <ChatModal 
                partnerId={organizer.id}
                partnerName={organizer.name}
                partnerAvatar={organizer.avatar}
                onClose={() => setChatOpen(false)}
            />
        )}
        </>
    );
};

export default GameScreen;
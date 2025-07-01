

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { useRaffle } from '../context/RaffleContext';
import { Game, GamePlayer, GameStatus, UserRole, BingoPattern, Raffle, RaffleStatus, RaffleTicketStatus, User } from '../types';
import { generateBingoCard } from '../utils/bingo';
import CreateGameModal from './CreateGameModal';
import CreateRaffleModal from './CreateRaffleModal';
import { CreditIcon, PlusCircleIcon, UsersIcon, TicketIcon, FullHouseIcon, AnyLineIcon, FourCornersIcon, CrossIcon, LetterXIcon, SmallSquareIcon, TopRowIcon, MiddleRowIcon, BottomRowIcon, LeftLIcon, RightLIcon, ChatBubbleLeftRightIcon, SparklesIcon, XCircleIcon } from './Icon';
import AdminDashboard from './AdminDashboard';
import OrganizerDashboard from './OrganizerDashboard';
import { useChat } from '../context/ChatContext';
import ChatModal from './ChatModal';
import AIAssistantModal from './AIAssistantModal';


interface LobbyScreenProps {
    onJoinGame: (gameId: string) => void;
    onJoinRaffle: (raffleId: string) => void;
}

const PatternIconMap: Record<BingoPattern, React.FC<{className?: string}>> = {
    [BingoPattern.FULL_HOUSE]: FullHouseIcon,
    [BingoPattern.ANY_LINE]: AnyLineIcon,
    [BingoPattern.FOUR_CORNERS]: FourCornersIcon,
    [BingoPattern.CROSS]: CrossIcon,
    [BingoPattern.LETTER_X]: LetterXIcon,
    [BingoPattern.SMALL_SQUARE]: SmallSquareIcon,
    [BingoPattern.TOP_ROW]: TopRowIcon,
    [BingoPattern.MIDDLE_ROW]: MiddleRowIcon,
    [BingoPattern.BOTTOM_ROW]: BottomRowIcon,
    [BingoPattern.LEFT_L]: LeftLIcon,
    [BingoPattern.RIGHT_L]: RightLIcon,
};


const GameCard: React.FC<{ game: Game; onJoin: (game: Game) => void; onManage: (gameId: string) => void; currentUser: User; onDelete: (game: Game) => void; }> = ({ game, onJoin, onManage, currentUser, onDelete }) => {
    const statusColor: Record<GameStatus, string> = {
        [GameStatus.WAITING]: 'text-green-400',
        [GameStatus.IN_PROGRESS]: 'text-yellow-400',
        [GameStatus.FINISHED]: 'text-red-400',
    };

    const PatternIcon = PatternIconMap[game.pattern] || FullHouseIcon;
    const isOrganizer = currentUser.id === game.organizerId;
    const isPlayer = game.players.some(p => p.userId === currentUser.id);
    const canAfford = currentUser.balance >= game.cardPrice;

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click event
        if (window.confirm('¿Estás seguro de que quieres eliminar esta partida? Esta acción no se puede deshacer.')) {
            onDelete(game);
        }
    };

    const canDelete = isOrganizer && (game.status === GameStatus.WAITING || game.status === GameStatus.FINISHED);

    return (
        <div className="bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-700 flex flex-col justify-between transition-transform transform hover:-translate-y-1 relative">
            {canDelete && (
                <button 
                    onClick={handleDelete}
                    className="absolute top-3 right-3 text-slate-500 hover:text-red-500 transition-colors z-10 p-1 bg-slate-800 rounded-full"
                    title="Eliminar partida"
                >
                    <XCircleIcon className="w-6 h-6" />
                </button>
            )}
            <div>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-sm text-slate-400">Organizado por {game.organizerName}</p>
                        <h3 className="text-2xl font-bold text-white">Premio: {game.prize.toLocaleString()}</h3>
                    </div>
                    <span className={`text-sm font-semibold px-3 py-1 rounded-full bg-slate-700/50 ${statusColor[game.status]}`}>{game.status}</span>
                </div>
                <div className="space-y-3 text-slate-300">
                    <div className="flex items-center gap-3">
                        <CreditIcon className="w-5 h-5 text-yellow-400" />
                        <span>Precio Cartón: {game.cardPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <UsersIcon className="w-5 h-5 text-cyan-400" />
                        <span>{game.players.length} Jugador{game.players.length !== 1 && 'es'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <PatternIcon className="w-5 h-5 text-purple-400" />
                        <span>Objetivo: {game.pattern}</span>
                    </div>
                </div>
            </div>
             {isOrganizer ? (
                <button
                    onClick={() => onManage(game.id)}
                    className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors"
                >
                    {game.status === GameStatus.WAITING && 'Administrar Partida'}
                    {game.status === GameStatus.IN_PROGRESS && 'Ver Partida'}
                    {game.status === GameStatus.FINISHED && 'Ver Resultados'}
                </button>
            ) : isPlayer ? (
                 <button
                    onClick={() => onJoin(game)}
                    disabled={game.status === GameStatus.FINISHED}
                    className="mt-6 w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors"
                >
                    {game.status === GameStatus.FINISHED ? 'Ver Resultados' : 'Ver Partida'}
                </button>
            ) : (
                <button
                    onClick={() => onJoin(game)}
                    disabled={!canAfford || game.status !== GameStatus.WAITING}
                    className="mt-6 w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors"
                    title={!canAfford ? 'Créditos insuficientes' : ''}
                >
                    {game.status === GameStatus.WAITING ? `Unirse por ${game.cardPrice}` : game.status}
                </button>
            )}
        </div>
    );
};

const RaffleCard: React.FC<{ raffle: Raffle; onJoin: (raffle: Raffle) => void; disabled: boolean }> = ({ raffle, onJoin, disabled }) => {
    const soldTickets = raffle.tickets.filter(t => t.status === RaffleTicketStatus.SOLD).length;
    const totalTickets = raffle.tickets.length;
    const progress = totalTickets > 0 ? (soldTickets / totalTickets) * 100 : 0;
    
    const statusColor: Record<RaffleStatus, string> = {
        [RaffleStatus.WAITING]: 'text-green-400',
        [RaffleStatus.FINISHED]: 'text-red-400',
    };

    return (
        <div className="bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-700 flex flex-col justify-between transition-transform transform hover:-translate-y-1">
            <div>
                <div className="flex justify-between items-start mb-4">
                    <div>
                         <p className="text-sm text-slate-400">Organizado por {raffle.organizerName}</p>
                        <h3 className="text-2xl font-bold text-white">{raffle.name}</h3>
                    </div>
                    <span className={`text-sm font-semibold px-3 py-1 rounded-full bg-slate-700/50 ${statusColor[raffle.status]}`}>{raffle.status}</span>
                </div>
                
                 <div className="space-y-3 text-slate-300 mb-4">
                    <div className="flex items-center gap-3">
                        <CreditIcon className="w-5 h-5 text-yellow-400" />
                        <span>Premio: <span className="font-bold">{raffle.prize.toLocaleString()}</span></span>
                    </div>
                    <div className="flex items-center gap-3">
                        <TicketIcon className="w-5 h-5 text-green-400" />
                        <span>Precio Ticket: <span className="font-bold">{raffle.ticketPrice.toLocaleString()}</span></span>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center text-sm text-slate-400 mb-1">
                        <span>Tickets Vendidos</span>
                        <span>{soldTickets} / {totalTickets}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2.5">
                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            </div>
            <button
                onClick={() => onJoin(raffle)}
                disabled={disabled}
                className="mt-6 w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors"
            >
                {raffle.status === RaffleStatus.WAITING ? 'Ver Rifa' : 'Ver Resultados'}
            </button>
        </div>
    );
};


const LobbyScreen: React.FC<LobbyScreenProps> = ({ onJoinGame, onJoinRaffle }) => {
    const { currentUser, users, updateBalance } = useAuth();
    const { games, updateGame, deleteGame } = useGame();
    const { raffles } = useRaffle();
    const { getUnreadCountForPartner } = useChat();
    
    const [isCreateGameModalOpen, setCreateGameModalOpen] = useState(false);
    const [isCreateRaffleModalOpen, setCreateRaffleModalOpen] = useState(false);
    const [isAIAssistantOpen, setAIAssistantOpen] = useState(false);
    const [mainTab, setMainTab] = useState<'bingo' | 'raffles' | 'dashboard' | 'chats'>('bingo');
    const [chatPartner, setChatPartner] = useState<{ id: string, name: string, avatar: string } | null>(null);
    
    if (!currentUser) return null;

    if (currentUser.role === UserRole.ADMIN) {
        return <AdminDashboard users={users} games={games} raffles={raffles} />;
    }

    const handleGameClick = (game: Game) => {
        if (!currentUser) return;

        const isPlayer = game.players.some(p => p.userId === currentUser.id);

        if (isPlayer) {
            onJoinGame(game.id);
            return;
        }

        if (game.status === GameStatus.WAITING) {
            if (currentUser.balance < game.cardPrice) {
                alert("No tienes suficientes créditos para unirte a esta partida.");
                return;
            }

            updateBalance(currentUser.id, game.cardPrice, 'subtract');
            
            const newCard = generateBingoCard();
            const existingPlayerIndex = game.players.findIndex(p => p.userId === currentUser.id);

            let updatedPlayers: GamePlayer[];
            if (existingPlayerIndex > -1) {
                updatedPlayers = game.players.map((p, index) => 
                    index === existingPlayerIndex ? { ...p, cards: [...p.cards, newCard] } : p
                );
            } else {
                updatedPlayers = [...game.players, { userId: currentUser.id, cards: [newCard] }];
            }

            const updatedGame: Game = {
                ...game,
                players: updatedPlayers,
                pot: game.pot + game.cardPrice
            };
            updateGame(updatedGame);
            onJoinGame(game.id);
        }
    };

    const ChatUserRow: React.FC<{ user: User }> = ({ user }) => {
        const unreadCount = getUnreadCountForPartner(user.id);
        const roleTranslations: Record<UserRole, string> = {
            [UserRole.USER]: 'Jugador',
            [UserRole.ORGANIZER]: 'Organizador',
            [UserRole.ADMIN]: 'Admin',
        };
        
        return (
            <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-lg hover:bg-slate-700/50 transition-colors">
                <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full" />
                <div className="flex-grow">
                    <p className="font-semibold text-white text-lg">{user.name}</p>
                    <p className="text-sm text-slate-400 capitalize">{roleTranslations[user.role]}</p>
                </div>
                <button 
                    onClick={() => setChatPartner({ id: user.id, name: user.name, avatar: user.avatar })}
                    className="relative flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-full transition-colors"
                    title={`Chatear con ${user.name}`}
                >
                    <ChatBubbleLeftRightIcon className="w-5 h-5" />
                    <span className="hidden md:inline">Chatear</span>
                    {unreadCount > 0 && (
                        <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                            {unreadCount}
                        </span>
                    )}
                </button>
            </div>
        );
    };

    const chatPartners = users.filter(user => {
        if (user.id === currentUser.id) return false;
        
        if (currentUser.role === UserRole.USER) {
            return user.role === UserRole.ADMIN || user.role === UserRole.ORGANIZER;
        }
        
        if (currentUser.role === UserRole.ORGANIZER) {
            return user.role === UserRole.ADMIN || user.role === UserRole.USER;
        }
        
        return false;
    }).sort((a, b) => {
        const roleOrder = { [UserRole.ADMIN]: 0, [UserRole.ORGANIZER]: 1, [UserRole.USER]: 2 };
        return roleOrder[a.role] - roleOrder[b.role] || a.name.localeCompare(b.name);
    });

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div className="bg-slate-800 rounded-full p-1 flex border border-slate-700 self-start md:self-center">
                    <button onClick={() => setMainTab('bingo')} className={`px-6 py-2 rounded-full font-bold transition-colors ${mainTab === 'bingo' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                        Bingo
                    </button>
                    <button onClick={() => setMainTab('raffles')} className={`px-6 py-2 rounded-full font-bold transition-colors ${mainTab === 'raffles' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                        Rifas
                    </button>
                    <button onClick={() => setMainTab('chats')} className={`px-6 py-2 rounded-full font-bold transition-colors ${mainTab === 'chats' ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                        Chats
                    </button>
                    {currentUser.role === UserRole.ORGANIZER && (
                        <button onClick={() => setMainTab('dashboard')} className={`px-6 py-2 rounded-full font-bold transition-colors ${mainTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                            Panel
                        </button>
                    )}
                </div>
                 {currentUser.role === UserRole.ORGANIZER && (
                    <button
                        onClick={() => mainTab === 'bingo' ? setCreateGameModalOpen(true) : setCreateRaffleModalOpen(true)}
                        className={`flex items-center gap-2 bg-gradient-to-r ${mainTab === 'bingo' ? 'from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-cyan-500/30' : 'from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 shadow-purple-500/30'} text-white font-bold py-3 px-6 rounded-full transition-all duration-300 shadow-lg`}
                        style={{ display: mainTab === 'dashboard' || mainTab === 'chats' ? 'none' : 'flex' }}
                    >
                        <PlusCircleIcon className="w-6 h-6"/>
                        {mainTab === 'bingo' ? 'Crear Partida' : 'Crear Rifa'}
                    </button>
                )}
            </div>

            {mainTab === 'chats' && (
                <>
                    <h2 className="text-4xl font-bold text-white mb-8">Chats</h2>
                    {chatPartners.length > 0 ? (
                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {chatPartners.map(user => <ChatUserRow key={user.id} user={user} />)}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-slate-800 rounded-2xl border border-slate-700">
                            <h3 className="text-2xl font-bold text-slate-300">No hay nadie con quien chatear</h3>
                            <p className="text-slate-400 mt-2">Parece que estás solo por aquí.</p>
                        </div>
                    )}
                </>
            )}

            {mainTab === 'bingo' && (
                <>
                    <h2 className="text-4xl font-bold text-white mb-8">Lobby de Bingo</h2>
                    {games.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {games.sort((a,b) => b.createdAt - a.createdAt).map(game => (
                                <GameCard 
                                    key={game.id} 
                                    game={game} 
                                    onJoin={handleGameClick} 
                                    onManage={onJoinGame} 
                                    currentUser={currentUser} 
                                    onDelete={deleteGame}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-slate-800 rounded-2xl border border-slate-700">
                            <h3 className="text-2xl font-bold text-slate-300">No Hay Partidas de Bingo Disponibles</h3>
                            <p className="text-slate-400 mt-2">Los organizadores pueden crear una nueva partida.</p>
                        </div>
                    )}
                </>
            )}

            {mainTab === 'raffles' && (
                 <>
                    <h2 className="text-4xl font-bold text-white mb-8">Lobby de Rifas</h2>
                    {raffles.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {raffles.sort((a,b) => b.createdAt - a.createdAt).map(raffle => (
                                <RaffleCard key={raffle.id} raffle={raffle} onJoin={() => onJoinRaffle(raffle.id)} disabled={false} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-slate-800 rounded-2xl border border-slate-700">
                            <h3 className="text-2xl font-bold text-slate-300">No Hay Rifas Disponibles</h3>
                            <p className="text-slate-400 mt-2">Los organizadores pueden crear una nueva rifa.</p>
                        </div>
                    )}
                </>
            )}

            {mainTab === 'dashboard' && currentUser.role === UserRole.ORGANIZER && (
                <OrganizerDashboard users={users} games={games} raffles={raffles} />
            )}

            <button
                onClick={() => setAIAssistantOpen(true)}
                className="fixed bottom-6 right-6 bg-gradient-to-br from-purple-600 to-indigo-700 text-white p-4 rounded-full shadow-2xl shadow-purple-500/50 hover:scale-110 transition-transform duration-300 z-30"
                title="Pregúntale al Asistente AI"
            >
                <SparklesIcon className="w-8 h-8" />
            </button>


            {isCreateGameModalOpen && <CreateGameModal onClose={() => setCreateGameModalOpen(false)} />}
            {isCreateRaffleModalOpen && <CreateRaffleModal onClose={() => setCreateRaffleModalOpen(false)} />}
            {chatPartner && <ChatModal partnerId={chatPartner.id} partnerName={chatPartner.name} partnerAvatar={chatPartner.avatar} onClose={() => setChatPartner(null)} />}
            {isAIAssistantOpen && <AIAssistantModal onClose={() => setAIAssistantOpen(false)} />}
        </div>
    )
};

export default LobbyScreen;
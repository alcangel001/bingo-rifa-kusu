import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRaffle } from '../context/RaffleContext';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { Raffle, RaffleTicket, RaffleStatus, RaffleTicketStatus, UserRole, User, RaffleMode } from '../types';
import PurchaseTicketsModal from './PurchaseTicketsModal';
import ChatModal from './ChatModal';
import { TicketIcon, CheckCircleIcon, XCircleIcon, CreditIcon, ChatBubbleLeftRightIcon } from './Icon';

interface RaffleScreenProps {
    raffleId: string;
    onExit: () => void;
}

const TicketNumber: React.FC<{ ticket: RaffleTicket, isSelected: boolean, onSelect: () => void, isFinished: boolean, isWinner: boolean, currentUser: User, totalTickets: number }> = ({ ticket, isSelected, onSelect, isFinished, isWinner, currentUser, totalTickets }) => {
    const isOwner = ticket.ownerId === currentUser.id;

    const getBackgroundColor = () => {
        if (isWinner) return 'bg-gradient-to-br from-yellow-400 to-orange-500 animate-pulse';
        if (isSelected) return 'bg-blue-500';
        switch (ticket.status) {
            case RaffleTicketStatus.SOLD:
                return isOwner ? 'bg-purple-600' : 'bg-red-800';
            case RaffleTicketStatus.RESERVED:
                return isOwner ? 'bg-yellow-600' : 'bg-yellow-800';
            case RaffleTicketStatus.AVAILABLE:
                return 'bg-green-600 hover:bg-green-500';
            default:
                return 'bg-slate-700';
        }
    };

    const getTooltipText = () => {
        if (isWinner) return `¡GANADOR! - ${ticket.ownerName}`;
        switch (ticket.status) {
            case RaffleTicketStatus.SOLD:
                return `Vendido a ${isOwner ? 'Ti' : ticket.ownerName}`;
            case RaffleTicketStatus.RESERVED:
                 return `Reservado por ${isOwner ? 'Ti' : ticket.ownerName}`;
            default:
                return ticket.status;
        }
    };
    
    const canSelect = ticket.status === RaffleTicketStatus.AVAILABLE && !isFinished;
    const numberStr = ticket.number.toString().padStart(totalTickets > 100 ? 3 : 2, '0');

    return (
        <div className="relative group">
            <button
                onClick={canSelect ? onSelect : undefined}
                disabled={!canSelect}
                className={`w-full aspect-square flex items-center justify-center rounded-lg text-lg font-bold transition-all duration-200 text-white shadow-md
                    ${getBackgroundColor()}
                    ${isSelected ? 'ring-2 ring-white scale-110' : ''}
                    ${canSelect ? 'cursor-pointer' : 'cursor-default'}
                `}
            >
                {numberStr}
            </button>
            <div className="absolute bottom-full mb-2 w-max px-2 py-1 bg-slate-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {getTooltipText()}
            </div>
        </div>
    );
};

const RaffleScreen: React.FC<RaffleScreenProps> = ({ raffleId, onExit }) => {
    const { raffles, updateRaffle } = useRaffle();
    const { currentUser, updateBalance, users } = useAuth();
    const { getUnreadCountForPartner } = useChat();

    const [raffle, setRaffle] = useState<Raffle | null>(() => raffles.find(r => r.id === raffleId) || null);
    const [selectedNumbers, setSelectedNumbers] = useState<Set<number>>(new Set());
    const [isPurchaseModalOpen, setPurchaseModalOpen] = useState(false);
    const [isChatOpen, setChatOpen] = useState(false);

    const [drawing, setDrawing] = useState(false);
    const [displayNumber, setDisplayNumber] = useState<number | null>(null);
    const [manualWinnerNumber, setManualWinnerNumber] = useState('');
    const [manualError, setManualError] = useState('');

    // Sync global state to local component state
    useEffect(() => {
        const updatedRaffle = raffles.find(r => r.id === raffleId);
        if (updatedRaffle) {
            setRaffle(updatedRaffle);
        }
    }, [raffles, raffleId]);
    
    // Distribute prize money when a winner is declared
    useEffect(() => {
        if (raffle && raffle.status === RaffleStatus.FINISHED && raffle.winnerId && !raffle.payoutComplete) {
            const admin = users.find(u => u.role === UserRole.ADMIN);
            const prizeAmount = raffle.prize;
            const commission = Math.floor(prizeAmount * 0.05); // 5% commission for admin
            const prizeToWinner = prizeAmount - commission;

            updateBalance(raffle.winnerId, prizeToWinner, 'add');
            if (admin) {
                updateBalance(admin.id, commission, 'add');
            }
            
            const updatedRaffle = { ...raffle, payoutComplete: true };
            // Using a timeout to ensure the state update doesn't conflict with rendering
            setTimeout(() => {
                setRaffle(updatedRaffle);
                updateRaffle(updatedRaffle);
            }, 0);
        }
    }, [raffle, users, updateBalance, updateRaffle]);

    const handleSelectNumber = (number: number) => {
        setSelectedNumbers(prev => {
            const newSet = new Set(prev);
            if (newSet.has(number)) {
                newSet.delete(number);
            } else {
                newSet.add(number);
            }
            return newSet;
        });
    };
    
    const handleUpdateRaffle = (updatedRaffle: Raffle) => {
        setRaffle(updatedRaffle);
        updateRaffle(updatedRaffle);
    };

    const handleStartDraw = () => {
        const soldTickets = raffle?.tickets.filter(t => t.status === RaffleTicketStatus.SOLD);
        if (!soldTickets || soldTickets.length === 0) {
            alert("No se puede iniciar el sorteo. No hay tickets vendidos.");
            return;
        }

        setDrawing(true);
        let counter = 0;
        const interval = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * soldTickets.length);
            setDisplayNumber(soldTickets[randomIndex].number);
            counter++;
            if (counter > 20) { // Simulate ~3 seconds of drawing
                clearInterval(interval);
                const winningTicket = soldTickets[Math.floor(Math.random() * soldTickets.length)];
                setDisplayNumber(winningTicket.number);
                
                setTimeout(() => {
                    if (raffle) {
                        const finalRaffle: Raffle = {
                            ...raffle,
                            status: RaffleStatus.FINISHED,
                            winnerTicket: winningTicket.number,
                            winnerId: winningTicket.ownerId,
                        };
                        handleUpdateRaffle(finalRaffle);
                    }
                    setDrawing(false);
                }, 2000); // Hold the winning number for 2 seconds
            }
        }, 150);
    };
    
    const handleDeclareWinner = (e: React.FormEvent) => {
        e.preventDefault();
        setManualError('');
        if (!raffle) return;

        const ticketNumber = parseInt(manualWinnerNumber, 10);
        const maxTicket = raffle.tickets.length - 1;
        if (isNaN(ticketNumber) || ticketNumber < 0 || ticketNumber > maxTicket) {
            setManualError(`Número inválido. Debe estar entre 00 y ${maxTicket.toString().padStart(2, '0')}.`);
            return;
        }

        const winningTicket = raffle.tickets.find(t => t.number === ticketNumber);
        if (!winningTicket || winningTicket.status !== RaffleTicketStatus.SOLD) {
            setManualError('Este ticket no fue vendido. No se puede declarar un ganador.');
            return;
        }

        const finalRaffle: Raffle = {
            ...raffle,
            status: RaffleStatus.FINISHED,
            winnerTicket: winningTicket.number,
            winnerId: winningTicket.ownerId,
        };
        handleUpdateRaffle(finalRaffle);
        setManualWinnerNumber('');
    };

    const reservedTickets = useMemo(() => {
        return raffle?.tickets.filter(t => t.status === RaffleTicketStatus.RESERVED) || [];
    }, [raffle]);

    const handleApproval = (ticketNumber: number, decision: 'approve' | 'reject') => {
        if (!raffle || !currentUser) return;

        const updatedTickets = raffle.tickets.map(t => {
            if (t.number === ticketNumber) {
                if (decision === 'approve') {
                     // As an organizer, you are funding this. No balance check here assuming proof was valid.
                    return { ...t, status: RaffleTicketStatus.SOLD };
                } else { // reject
                    return { ...t, status: RaffleTicketStatus.AVAILABLE, ownerId: undefined, ownerName: undefined, paymentProofUrl: undefined };
                }
            }
            return t;
        });

        handleUpdateRaffle({ ...raffle, tickets: updatedTickets });
    };

    if (!raffle || !currentUser) return <div className="text-center p-8">Cargando rifa...</div>;

    const organizer = users.find(u => u.id === raffle.organizerId);
    const isOrganizer = currentUser.id === raffle.organizerId;
    const isPlayer = !isOrganizer;
    const isFinished = raffle.status === RaffleStatus.FINISHED;
    const unreadMessagesCount = isPlayer && organizer ? getUnreadCountForPartner(organizer.id) : 0;

    return (
        <>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold">{raffle.name}</h2>
                        <p className="text-slate-400">Premio Total: <span className="font-bold text-yellow-400">{raffle.prize.toLocaleString()}</span> créditos</p>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4 self-start md:self-center">
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
                        <button onClick={onExit} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-5 rounded-full transition-colors">
                            Volver al Lobby
                        </button>
                    </div>
                </div>

                {isFinished && raffle.winnerTicket !== undefined && (
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 rounded-2xl text-center shadow-2xl">
                        <h3 className="text-4xl font-extrabold text-white">¡Rifa Finalizada!</h3>
                        <p className="text-xl text-white mt-2">
                           Número Ganador: <span className="text-yellow-300 font-black text-3xl">{raffle.winnerTicket.toString().padStart(raffle.tickets.length > 100 ? 3 : 2, '0')}</span>
                        </p>
                         <p className="text-lg text-white mt-1">
                           Ganador: <span className="font-bold">{users.find(u => u.id === raffle.winnerId)?.name || 'N/A'}</span>
                        </p>
                    </div>
                )}
                
                {isOrganizer && !isFinished && (
                     <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-4">
                        <h3 className="text-xl font-bold text-white">Panel de Organizador</h3>
                         {reservedTickets.length > 0 && (
                            <div>
                                <h4 className="font-semibold mb-2 text-purple-300">Aprobaciones Pendientes</h4>
                                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                {reservedTickets.map(ticket => (
                                    <div key={ticket.number} className="flex items-center justify-between bg-slate-700 p-2 rounded-lg">
                                        <div>
                                            <span className="font-bold">{ticket.ownerName}</span> reservó el <span className="font-bold text-yellow-400">{ticket.number.toString().padStart(raffle.tickets.length > 100 ? 3 : 2, '0')}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            {ticket.paymentProofUrl && <a href={ticket.paymentProofUrl} target="_blank" rel="noopener noreferrer" className="bg-sky-500 text-white px-2 py-1 text-xs rounded">Ver Prueba</a>}
                                            <button onClick={() => handleApproval(ticket.number, 'approve')} className="bg-green-500 text-white p-1 rounded-full"><CheckCircleIcon className="w-5 h-5"/></button>
                                            <button onClick={() => handleApproval(ticket.number, 'reject')} className="bg-red-500 text-white p-1 rounded-full"><XCircleIcon className="w-5 h-5"/></button>
                                        </div>
                                    </div>
                                ))}
                                </div>
                            </div>
                        )}
                        
                        {raffle.mode === RaffleMode.AUTOMATIC && (
                            <button
                                onClick={handleStartDraw}
                                disabled={drawing}
                                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white font-bold py-3 rounded-lg"
                            >
                                {drawing ? 'Sorteando...' : 'Iniciar Sorteo'}
                            </button>
                        )}
                        
                        {raffle.mode === RaffleMode.MANUAL && (
                            <form onSubmit={handleDeclareWinner} className="space-y-2">
                                <h4 className="font-semibold text-purple-300">Declarar Ganador Manualmente</h4>
                                <input
                                    type="number"
                                    value={manualWinnerNumber}
                                    onChange={(e) => setManualWinnerNumber(e.target.value)}
                                    placeholder={`Número ganador (00-${raffle.tickets.length - 1})`}
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                {manualError && <p className="text-red-400 text-xs px-1">{manualError}</p>}
                                <button
                                    type="submit"
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg"
                                >
                                    Declarar Ganador
                                </button>
                            </form>
                        )}
                    </div>
                )}

                 {(drawing || displayNumber !== null) && (
                     <div className="flex justify-center items-center my-4">
                        <div className="w-40 h-40 flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-slate-900 font-black text-7xl shadow-lg">
                            {displayNumber?.toString().padStart(raffle.tickets.length > 100 ? 3 : 2, '0')}
                        </div>
                    </div>
                 )}

                <div className="grid grid-cols-10 gap-2">
                    {raffle.tickets.map(ticket => (
                        <TicketNumber
                            key={ticket.number}
                            ticket={ticket}
                            isSelected={selectedNumbers.has(ticket.number)}
                            onSelect={() => handleSelectNumber(ticket.number)}
                            isFinished={isFinished}
                            isWinner={ticket.number === raffle.winnerTicket}
                            currentUser={currentUser}
                            totalTickets={raffle.tickets.length}
                        />
                    ))}
                </div>
            </div>

            {selectedNumbers.size > 0 && !isFinished && (
                <div className="sticky bottom-4 mt-4 w-full bg-slate-800/80 backdrop-blur-sm border border-slate-700 p-4 rounded-2xl shadow-lg flex items-center justify-between">
                    <div>
                        <p className="font-bold text-lg text-white">{selectedNumbers.size} ticket(s) seleccionado(s)</p>
                        <p className="text-yellow-400 flex items-center gap-2">
                            <CreditIcon className="w-5 h-5" />
                            Costo Total: {(selectedNumbers.size * raffle.ticketPrice).toLocaleString()}
                        </p>
                    </div>
                    <button onClick={() => setPurchaseModalOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg">
                        Comprar Tickets
                    </button>
                </div>
            )}
            
            {isPurchaseModalOpen && (
                <PurchaseTicketsModal
                    raffle={raffle}
                    selectedNumbers={Array.from(selectedNumbers)}
                    onClose={() => setPurchaseModalOpen(false)}
                    onConfirm={handleUpdateRaffle}
                    onClearSelection={() => setSelectedNumbers(new Set())}
                />
            )}
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

export default RaffleScreen;
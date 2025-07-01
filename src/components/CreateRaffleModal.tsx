import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRaffle } from '../context/RaffleContext';
import { Raffle, RaffleStatus, UserRole, RaffleTicket, RaffleTicketStatus, RaffleMode } from '../types';

interface CreateRaffleModalProps {
    onClose: () => void;
}

const CreateRaffleModal: React.FC<CreateRaffleModalProps> = ({ onClose }) => {
    const { currentUser, updateBalance } = useAuth();
    const { addRaffle } = useRaffle();
    const [name, setName] = useState('');
    const [prize, setPrize] = useState('');
    const [ticketPrice, setTicketPrice] = useState('');
    const [totalTickets, setTotalTickets] = useState('100');
    const [mode, setMode] = useState<RaffleMode>(RaffleMode.AUTOMATIC);
    const [error, setError] = useState('');

    const handleCreateRaffle = (e: React.FormEvent) => {
        e.preventDefault();
        const prizeAmount = parseInt(prize, 10);
        const ticketPriceAmount = parseInt(ticketPrice, 10);
        const totalTicketsAmount = parseInt(totalTickets, 10);

        if (!currentUser || currentUser.role !== UserRole.ORGANIZER) {
            setError('Solo los organizadores pueden crear rifas.');
            return;
        }
        if (!name.trim()) {
            setError('La rifa debe tener un nombre.');
            return;
        }
        if (isNaN(prizeAmount) || isNaN(ticketPriceAmount) || isNaN(totalTicketsAmount) || prizeAmount <= 0 || ticketPriceAmount <= 0 || totalTicketsAmount <= 1) {
            setError('Por favor, introduce números positivos válidos para todos los campos.');
            return;
        }
        if (prizeAmount > currentUser.balance) {
            setError('El monto del premio no puede exceder tu saldo actual.');
            return;
        }

        const tickets: RaffleTicket[] = Array.from({ length: totalTicketsAmount }, (_, i) => ({
            number: i,
            status: RaffleTicketStatus.AVAILABLE,
        }));

        const newRaffle: Raffle = {
            id: `raffle-${Date.now()}`,
            organizerId: currentUser.id,
            organizerName: currentUser.name,
            name,
            prize: prizeAmount,
            ticketPrice: ticketPriceAmount,
            status: RaffleStatus.WAITING,
            tickets: tickets,
            createdAt: Date.now(),
            payoutComplete: false,
            mode,
        };

        addRaffle(newRaffle);
        updateBalance(currentUser.id, prizeAmount, 'subtract');
        onClose();
    };
    
    const OptionButton = ({ onClick, isSelected, children }: { onClick: () => void, isSelected: boolean, children: React.ReactNode }) => (
        <button
            type="button"
            onClick={onClick}
            className={`flex-1 p-3 rounded-lg text-center font-semibold transition-all duration-200 border-2 ${isSelected ? 'bg-purple-500 border-purple-400 text-white shadow-lg' : 'bg-slate-700 border-slate-600 hover:bg-slate-600'}`}
        >
            {children}
        </button>
    );

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-lg border border-slate-700 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">&times;</button>
                <h2 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">Crear Nueva Rifa</h2>
                <form onSubmit={handleCreateRaffle} className="space-y-6">
                    {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-lg text-sm">{error}</p>}
                    
                     <div>
                        <label htmlFor="name" className="block text-slate-300 text-sm font-bold mb-2">Nombre de la Rifa</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="ej., Rifa Semanal"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="prize" className="block text-slate-300 text-sm font-bold mb-2">Monto del Premio</label>
                            <input
                                type="number"
                                id="prize"
                                value={prize}
                                onChange={(e) => setPrize(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="ej., 1000"
                                min="1"
                            />
                        </div>
                        <div>
                            <label htmlFor="ticketPrice" className="block text-slate-300 text-sm font-bold mb-2">Precio por Ticket</label>
                            <input
                                type="number"
                                id="ticketPrice"
                                value={ticketPrice}
                                onChange={(e) => setTicketPrice(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="ej., 50"
                                min="1"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="totalTickets" className="block text-slate-300 text-sm font-bold mb-2">Cantidad de Tickets (ej. 100 para 00-99)</label>
                        <input
                            type="number"
                            id="totalTickets"
                            value={totalTickets}
                            onChange={(e) => setTotalTickets(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="ej., 100"
                            min="2"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-slate-300 text-sm font-bold mb-2">Modo de Sorteo</label>
                        <div className="flex gap-2">
                           <OptionButton isSelected={mode === RaffleMode.AUTOMATIC} onClick={() => setMode(RaffleMode.AUTOMATIC)}>{RaffleMode.AUTOMATIC}</OptionButton>
                           <OptionButton isSelected={mode === RaffleMode.MANUAL} onClick={() => setMode(RaffleMode.MANUAL)}>{RaffleMode.MANUAL}</OptionButton>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg shadow-purple-500/20"
                    >
                        Crear Rifa y Publicar Premio
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateRaffleModal;
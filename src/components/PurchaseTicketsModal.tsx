import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Raffle, RaffleTicketStatus } from '../types';
import { UploadIcon } from './Icon';

interface PurchaseTicketsModalProps {
    onClose: () => void;
    raffle: Raffle;
    selectedNumbers: number[];
    onConfirm: (updatedRaffle: Raffle) => void;
    onClearSelection: () => void;
}

const PurchaseTicketsModal: React.FC<PurchaseTicketsModalProps> = ({ onClose, raffle, selectedNumbers, onConfirm, onClearSelection }) => {
    const { currentUser, updateBalance } = useAuth();
    const [paymentProof, setPaymentProof] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const totalCost = selectedNumbers.length * raffle.ticketPrice;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPaymentProof(reader.result as string);
                setError('');
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePurchase = (method: 'credits' | 'proof') => {
        if (!currentUser) return;
        setIsProcessing(true);
        setError('');

        if (method === 'credits') {
            if (currentUser.balance < totalCost) {
                setError('No tienes suficientes créditos para esta compra.');
                setIsProcessing(false);
                return;
            }
            updateBalance(currentUser.id, totalCost, 'subtract');
        } else { // proof
            if (!paymentProof) {
                setError('Debes adjuntar un comprobante de pago para reservar.');
                setIsProcessing(false);
                return;
            }
        }
        
        const updatedTickets = raffle.tickets.map(ticket => {
            if (selectedNumbers.includes(ticket.number)) {
                return {
                    ...ticket,
                    status: method === 'credits' ? RaffleTicketStatus.SOLD : RaffleTicketStatus.RESERVED,
                    ownerId: currentUser.id,
                    ownerName: currentUser.name,
                    paymentProofUrl: method === 'proof' ? paymentProof! : undefined,
                };
            }
            return ticket;
        });

        const updatedRaffle = { ...raffle, tickets: updatedTickets };
        onConfirm(updatedRaffle);
        onClearSelection();
        setIsProcessing(false);
        onClose();
    };


    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-slate-700 relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white text-3xl leading-none">&times;</button>
                <h2 className="text-3xl font-bold mb-2 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">Confirmar Compra</h2>
                <p className="text-center text-slate-400 mb-6">Estás comprando {selectedNumbers.length} ticket(s) por un total de <span className="font-bold text-yellow-400">{totalCost.toLocaleString()}</span> créditos.</p>

                <div className="space-y-4">
                     {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-lg text-sm text-center">{error}</p>}
                    
                    <button
                        onClick={() => handlePurchase('credits')}
                        disabled={isProcessing}
                        className="w-full bg-gradient-to-r from-green-500 to-cyan-600 hover:from-green-600 hover:to-cyan-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg shadow-green-500/20"
                    >
                        Pagar con Créditos ({currentUser?.balance.toLocaleString()})
                    </button>
                    
                    <div className="text-center text-slate-500">o</div>
                    
                    <div>
                        <label htmlFor="file-upload-modal" className="w-full flex items-center justify-center gap-2 bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-300 hover:bg-slate-700 cursor-pointer">
                            <UploadIcon className="w-5 h-5" />
                            <span>{paymentProof ? "Cambiar comprobante" : "Adjuntar comprobante"}</span>
                        </label>
                        <input id="file-upload-modal" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                        {paymentProof && (
                            <div className="mt-2 p-2 bg-slate-900/50 rounded-lg">
                                <img src={paymentProof} alt="Vista previa del comprobante" className="max-h-20 rounded-md mx-auto" />
                            </div>
                        )}
                    </div>
                     <button
                        onClick={() => handlePurchase('proof')}
                        disabled={isProcessing || !paymentProof}
                        className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg shadow-yellow-500/20"
                    >
                        Reservar con Comprobante
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PurchaseTicketsModal;
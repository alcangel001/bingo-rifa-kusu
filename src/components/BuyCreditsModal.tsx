import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole, CreditRequestStatus } from '../types';
import { UploadIcon } from './Icon';

interface RequestCreditsModalProps {
    onClose: () => void;
}

const RequestCreditsModal: React.FC<RequestCreditsModalProps> = ({ onClose }) => {
    const { currentUser, users, addRequest } = useAuth();
    const [amount, setAmount] = useState('');
    const [recipientId, setRecipientId] = useState('');
    const [paymentProof, setPaymentProof] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const isOrganizer = currentUser?.role === UserRole.ORGANIZER;
    const isUser = currentUser?.role === UserRole.USER;

    const recipients = useMemo(() => {
        if (isUser) {
            return users.filter(u => u.role === UserRole.ORGANIZER);
        }
        if (isOrganizer) {
            return users.filter(u => u.role === UserRole.ADMIN);
        }
        return [];
    }, [users, isUser, isOrganizer]);

    useEffect(() => {
        if (recipients.length === 1) {
            setRecipientId(recipients[0].id);
        }
    }, [recipients]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPaymentProof(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!currentUser) return;
        
        const requestAmount = parseInt(amount, 10);

        if (!recipientId || !requestAmount) {
            setError('Todos los campos son obligatorios.');
            return;
        }

        if (isNaN(requestAmount) || requestAmount <= 0) {
            setError('Por favor, introduce una cantidad positiva válida.');
            return;
        }

        const recipient = users.find(u => u.id === recipientId);
        if (!recipient) {
            setError('Destinatario no válido.');
            return;
        }

        addRequest({
            fromUserId: currentUser.id,
            fromUserName: currentUser.name,
            toUserId: recipientId,
            amount: requestAmount,
            status: CreditRequestStatus.PENDING,
            paymentProofUrl: paymentProof || undefined,
        });

        setSuccess(`¡Solicitud de ${requestAmount.toLocaleString()} créditos enviada a ${recipient.name} para su aprobación!`);
        setAmount('');
        setPaymentProof(null);
        if (recipients.length > 1) {
             setRecipientId('');
        }

        setTimeout(() => onClose(), 2500);
    };

    if (!isUser && !isOrganizer) return null;

    const targetRoleText = isUser ? 'un Organizador' : 'un Administrador';

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-slate-700 relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white text-3xl leading-none">&times;</button>
                <h2 className="text-3xl font-bold mb-2 text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-500">Solicitar Créditos</h2>
                <p className="text-center text-slate-400 mb-8">Pide créditos a {targetRoleText}.</p>

                 {success ? (
                    <div className="text-green-400 bg-green-900/50 p-4 rounded-lg text-center font-semibold">
                        {success}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-lg text-sm">{error}</p>}
                        
                        {recipients.length > 1 && (
                            <div>
                                <label htmlFor="recipient" className="block text-slate-300 text-sm font-bold mb-2">Solicitar a</label>
                                <select
                                    id="recipient"
                                    value={recipientId}
                                    onChange={(e) => setRecipientId(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="" disabled>Selecciona un destinatario...</option>
                                    {recipients.map(r => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        
                        <div>
                            <label htmlFor="amount" className="block text-slate-300 text-sm font-bold mb-2">Cantidad a Solicitar</label>
                            <input
                                type="number"
                                id="amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="ej., 500"
                                min="1"
                            />
                        </div>

                        <div>
                            <label className="block text-slate-300 text-sm font-bold mb-2">Comprobante de Pago (Opcional)</label>
                            <label htmlFor="file-upload" className="w-full flex items-center justify-center gap-2 bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-300 hover:bg-slate-700 cursor-pointer">
                                <UploadIcon className="w-5 h-5" />
                                <span>{paymentProof ? "Cambiar comprobante" : "Adjuntar comprobante"}</span>
                            </label>
                            <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                            {paymentProof && (
                                <div className="mt-4 p-2 bg-slate-900/50 rounded-lg">
                                    <img src={paymentProof} alt="Vista previa del comprobante" className="max-h-40 rounded-md mx-auto" />
                                </div>
                            )}
                        </div>
                        
                        <button
                            type="submit"
                            disabled={!amount || !recipientId}
                            className="w-full bg-gradient-to-r from-green-500 to-cyan-600 hover:from-green-600 hover:to-cyan-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg shadow-green-500/20"
                        >
                            Enviar Solicitud
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default RequestCreditsModal;
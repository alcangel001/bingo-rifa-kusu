import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CreditRequest, CreditRequestStatus, UserRole } from '../types';

const ProofViewerModal: React.FC<{ imageUrl: string; onClose: () => void }> = ({ imageUrl, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4" onClick={onClose}>
            <div className="max-w-3xl max-h-[80vh] bg-slate-900 p-4 rounded-lg" onClick={e => e.stopPropagation()}>
                <img src={imageUrl} alt="Comprobante de pago" className="max-w-full max-h-[75vh] object-contain" />
                 <button onClick={onClose} className="w-full mt-4 bg-red-500 text-white py-2 rounded-lg">Cerrar</button>
            </div>
        </div>
    );
};

interface ApprovalDashboardModalProps {
    onClose: () => void;
}

const ApprovalDashboardModal: React.FC<ApprovalDashboardModalProps> = ({ onClose }) => {
    const { currentUser, updateBalance, creditRequests, updateRequest } = useAuth();
    const [error, setError] = useState<Record<string, string>>({});
    const [viewingProofUrl, setViewingProofUrl] = useState<string | null>(null);

    const pendingRequests = useMemo(() => {
        return creditRequests
            .filter(r => r.toUserId === currentUser?.id && r.status === CreditRequestStatus.PENDING)
            .sort((a,b) => b.createdAt - a.createdAt);
    }, [creditRequests, currentUser]);

    const handleApproval = (request: CreditRequest, decision: 'approve' | 'reject') => {
        setError(prev => ({...prev, [request.id]: ''}));

        if (!currentUser) return;

        if (decision === 'approve') {
            if (currentUser.role !== UserRole.ADMIN && currentUser.balance < request.amount) {
                 setError(prev => ({...prev, [request.id]: 'Saldo insuficiente para aprobar.'}));
                return;
            }
            updateBalance(request.fromUserId, request.amount, 'add');
            updateBalance(currentUser.id, request.amount, 'subtract'); // Admin balance doesn't actually decrease due to App.tsx logic
            updateRequest(request.id, CreditRequestStatus.APPROVED);
        } else {
            updateRequest(request.id, CreditRequestStatus.REJECTED);
        }
    };
    
    return (
        <>
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
                <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-2xl border border-slate-700 relative" onClick={e => e.stopPropagation()}>
                    <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white text-3xl leading-none">&times;</button>
                    <h2 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">Panel de Aprobación</h2>
                    
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        {pendingRequests.length > 0 ? (
                            pendingRequests.map(request => (
                                <div key={request.id} className="bg-slate-900/70 p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="flex-grow">
                                        <p className="font-bold text-white">{request.fromUserName}</p>
                                        <p className="text-sm text-slate-300">Solicita <span className="font-bold text-yellow-400">{request.amount.toLocaleString()}</span> créditos</p>
                                        {error[request.id] && <p className="text-xs text-red-400 mt-1">{error[request.id]}</p>}
                                    </div>
                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        {request.paymentProofUrl && (
                                            <button 
                                                onClick={() => setViewingProofUrl(request.paymentProofUrl!)}
                                                className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm w-1/2 sm:w-auto"
                                            >
                                                Ver Comprobante
                                            </button>
                                        )}
                                        <div className="flex gap-2 w-full sm:w-auto">
                                            <button
                                                onClick={() => handleApproval(request, 'approve')}
                                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors flex-1"
                                            >
                                                Aprobar
                                            </button>
                                            <button
                                                onClick={() => handleApproval(request, 'reject')}
                                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors flex-1"
                                            >
                                                Rechazar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-slate-400 py-8">No hay solicitudes pendientes.</p>
                        )}
                    </div>
                </div>
            </div>
            {viewingProofUrl && <ProofViewerModal imageUrl={viewingProofUrl} onClose={() => setViewingProofUrl(null)} />}
        </>
    );
};

export default ApprovalDashboardModal;
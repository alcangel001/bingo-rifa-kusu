import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { CreditIcon, InboxIcon, ShoppingCartIcon, ChatBubbleLeftRightIcon } from './Icon';
import { UserRole, CreditRequestStatus } from '../types';
import RequestCreditsModal from './BuyCreditsModal';
import ApprovalDashboardModal from './TransferCreditsModal';
import ChatModal from './ChatModal';

const roleTranslations: Record<UserRole, string> = {
    [UserRole.USER]: 'Usuario',
    [UserRole.ORGANIZER]: 'Organizador',
    [UserRole.ADMIN]: 'Admin',
};

const Header: React.FC = () => {
    const { currentUser, logout, creditRequests, users } = useAuth();
    const { getUnreadCountForPartner } = useChat();
    const [isRequestModalOpen, setRequestModalOpen] = useState(false);
    const [isApprovalModalOpen, setApprovalModalOpen] = useState(false);
    const [chatPartner, setChatPartner] = useState<{ id: string, name: string, avatar: string } | null>(null);

    const admin = useMemo(() => users.find(u => u.role === UserRole.ADMIN), [users]);

    if (!currentUser) return null;

    const isAdmin = currentUser.role === UserRole.ADMIN;
    const isOrganizer = currentUser.role === UserRole.ORGANIZER;
    const canApprove = isAdmin || isOrganizer;
    const canRequest = isOrganizer || currentUser.role === UserRole.USER;

    const pendingRequestsCount = creditRequests.filter(
        r => r.toUserId === currentUser.id && r.status === CreditRequestStatus.PENDING
    ).length;

    const adminChatUnreadCount = admin ? getUnreadCountForPartner(admin.id) : 0;
    
    const handleOpenAdminChat = () => {
        if (admin) {
            setChatPartner({ id: admin.id, name: admin.name, avatar: admin.avatar });
        }
    };

    return (
        <>
            <header className="bg-slate-800/50 backdrop-blur-sm sticky top-0 z-20 border-b border-slate-700">
                <div className="container mx-auto flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                        <img src={currentUser.avatar} alt={currentUser.name} className="w-12 h-12 rounded-full border-2 border-cyan-400" />
                        <div>
                            <h1 className="text-xl font-bold text-white">{currentUser.name}</h1>
                            <p className="text-sm text-slate-400 capitalize">{roleTranslations[currentUser.role]}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4">
                         <div className="flex items-center gap-2 text-lg font-semibold bg-slate-700/50 px-4 py-2 rounded-full">
                            <CreditIcon className="w-6 h-6 text-yellow-400" />
                            <span className="text-yellow-300">{isAdmin ? '∞' : currentUser.balance.toLocaleString()}</span>
                        </div>
                        
                        {canRequest && (
                            <button
                                onClick={() => setRequestModalOpen(true)}
                                className="relative flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-3 md:px-4 rounded-full transition-colors duration-200"
                                title="Solicitar Créditos"
                            >
                                <ShoppingCartIcon className="w-5 h-5"/>
                                <span className="hidden md:inline">Solicitar</span>
                            </button>
                        )}
                        
                        {canApprove && (
                             <button
                                onClick={() => setApprovalModalOpen(true)}
                                className="relative flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-3 md:px-4 rounded-full transition-colors duration-200"
                                title="Aprobar Solicitudes"
                            >
                                <InboxIcon className="w-5 h-5"/>
                                {pendingRequestsCount > 0 && (
                                    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                                        {pendingRequestsCount}
                                    </span>
                                )}
                                <span className="hidden md:inline">Aprobar</span>
                            </button>
                        )}
                        
                        {isOrganizer && admin && (
                            <button
                                onClick={handleOpenAdminChat}
                                className="relative flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-3 md:px-4 rounded-full transition-colors duration-200"
                                title="Chatear con Admin"
                            >
                                <ChatBubbleLeftRightIcon className="w-5 h-5"/>
                                 {adminChatUnreadCount > 0 && (
                                    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                                        {adminChatUnreadCount}
                                    </span>
                                )}
                                <span className="hidden md:inline">Admin</span>
                            </button>
                        )}

                        <button
                            onClick={logout}
                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-3 md:px-4 rounded-full transition-colors duration-200"
                        >
                            <span className="hidden md:inline">Cerrar Sesión</span>
                             <span className="md:hidden">Salir</span>
                        </button>
                    </div>
                </div>
            </header>
            
            {isRequestModalOpen && <RequestCreditsModal onClose={() => setRequestModalOpen(false)} />}
            {isApprovalModalOpen && <ApprovalDashboardModal onClose={() => setApprovalModalOpen(false)} />}
            {chatPartner && <ChatModal partnerId={chatPartner.id} partnerName={chatPartner.name} partnerAvatar={chatPartner.avatar} onClose={() => setChatPartner(null)} />}
        </>
    );
};

export default Header;
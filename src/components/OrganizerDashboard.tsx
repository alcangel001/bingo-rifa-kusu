import React, { useState } from 'react';
import { User, UserRole, Game, Raffle } from '../types';
import { CreditIcon, UserGroupIcon, TicketIcon, ChartBarIcon, ChatBubbleLeftRightIcon } from './Icon';
import { useChat } from '../context/ChatContext';
import ChatModal from './ChatModal';

interface OrganizerDashboardProps {
    users: User[];
    games: Game[];
    raffles: Raffle[];
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex items-center gap-4 transition-transform transform hover:-translate-y-1">
        <div className="bg-slate-700/50 p-4 rounded-full">{icon}</div>
        <div>
            <p className="text-slate-400 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const UserRow: React.FC<{ user: User, onChat: () => void }> = ({ user, onChat }) => {
    const { getUnreadCountForPartner } = useChat();
    const unreadCount = getUnreadCountForPartner(user.id);
    
    return (
        <div className="flex items-center gap-4 p-3 bg-slate-900/50 rounded-lg hover:bg-slate-700/50 transition-colors">
            <div className="relative">
                <img src={user.avatar} alt={user.name} className="w-11 h-11 rounded-full" />
                <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 border-2 border-slate-800" title="En línea"></span>
            </div>
            <p className="font-semibold text-white flex-grow">{user.name}</p>
            <div className="flex items-center gap-2 text-yellow-400">
                <CreditIcon className="w-5 h-5" />
                <span className="font-bold">{user.balance.toLocaleString()}</span>
            </div>
            <button onClick={onChat} className="relative bg-sky-500 hover:bg-sky-600 text-white font-bold p-2 rounded-full transition-colors" title={`Chatear con ${user.name}`}>
                <ChatBubbleLeftRightIcon className="w-5 h-5" />
                {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                        {unreadCount}
                    </span>
                )}
            </button>
        </div>
    );
};


const OrganizerDashboard: React.FC<OrganizerDashboardProps> = ({ users, games, raffles }) => {
    const [chatPartner, setChatPartner] = useState<{ id: string, name: string, avatar: string } | null>(null);
    const players = users.filter(u => u.role === UserRole.USER);
    const totalPlayers = players.length;
    const totalGames = games.length;
    const totalRaffles = raffles.length;
    
    const handleChat = (user: User) => {
        setChatPartner({id: user.id, name: user.name, avatar: user.avatar });
    };

    return (
        <>
            <div>
                <h2 className="text-4xl font-bold text-white mb-8">Panel de Organizador</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard 
                        title="Total de Jugadores" 
                        value={totalPlayers}
                        icon={<UserGroupIcon className="w-7 h-7 text-cyan-400" />}
                    />
                    <StatCard 
                        title="Partidas de Bingo" 
                        value={totalGames}
                        icon={<ChartBarIcon className="w-7 h-7 text-green-400" />}
                    />
                    <StatCard 
                        title="Rifas Creadas" 
                        value={totalRaffles}
                        icon={<TicketIcon className="w-7 h-7 text-purple-400" />}
                    />
                </div>

                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                    <h3 className="text-2xl font-bold text-white mb-4">Chats con Jugadores</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {players.length > 0 ? players.map(user => <UserRow key={user.id} user={user} onChat={() => handleChat(user)} />) : <p className="text-slate-400 text-center py-4">No hay jugadores registrados.</p>}
                    </div>
                </div>
            </div>
            {chatPartner && <ChatModal partnerId={chatPartner.id} partnerName={chatPartner.name} partnerAvatar={chatPartner.avatar} onClose={() => setChatPartner(null)} />}
        </>
    );
};

export default OrganizerDashboard;
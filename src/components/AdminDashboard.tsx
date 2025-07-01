import React, { useState } from 'react';
import { User, Game, UserRole, GameStatus, Raffle, RaffleStatus } from '../types';
import { CreditIcon, ChartBarIcon, UserGroupIcon, TicketIcon, ChatBubbleLeftRightIcon } from './Icon';
import { useChat } from '../context/ChatContext';
import ChatModal from './ChatModal';

interface AdminDashboardProps {
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
                <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 border-2 border-slate-800"></span>
            </div>
            <div className="flex-grow">
                <p className="font-semibold text-white">{user.name}</p>
                <p className="text-xs text-slate-400 capitalize">{user.role}</p>
            </div>
            <div className="flex items-center gap-2 text-yellow-400">
                <CreditIcon className="w-5 h-5" />
                <span className="font-bold">{user.balance.toLocaleString()}</span>
            </div>
            {user.role === UserRole.ORGANIZER && (
                <button onClick={onChat} className="relative bg-sky-500 hover:bg-sky-600 text-white font-bold p-2 rounded-full transition-colors" title={`Chatear con ${user.name}`}>
                    <ChatBubbleLeftRightIcon className="w-5 h-5" />
                    {unreadCount > 0 && (
                         <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                            {unreadCount}
                        </span>
                    )}
                </button>
            )}
        </div>
    );
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ users, games, raffles }) => {
    const [chatPartner, setChatPartner] = useState<{ id: string, name: string, avatar: string } | null>(null);
    const organizers = users.filter(u => u.role === UserRole.ORGANIZER);
    const players = users.filter(u => u.role === UserRole.USER);
    
    const totalBingoEarnings = games
        .filter(g => g.status === GameStatus.FINISHED && g.payoutComplete)
        .reduce((acc, game) => acc + Math.floor(game.pot * 0.05), 0);
    
    const totalRaffleEarnings = raffles
        .filter(r => r.status === RaffleStatus.FINISHED && r.payoutComplete)
        .reduce((acc, raffle) => acc + Math.floor(raffle.prize * 0.05), 0);
    
    const totalEarnings = totalBingoEarnings + totalRaffleEarnings;

    const activeRaffles = raffles.filter(r => r.status === RaffleStatus.WAITING).length;

    const handleChat = (user: User) => {
        setChatPartner({id: user.id, name: user.name, avatar: user.avatar });
    };

    return (
        <>
        <div>
            <h2 className="text-4xl font-bold text-white mb-8">Panel de Administración</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                    title="Ganancias Totales" 
                    value={totalEarnings.toLocaleString()}
                    icon={<ChartBarIcon className="w-7 h-7 text-green-400" />}
                />
                <StatCard 
                    title="Rifas Activas" 
                    value={activeRaffles}
                    icon={<TicketIcon className="w-7 h-7 text-purple-400" />}
                />
                <StatCard 
                    title="Organizadores" 
                    value={organizers.length}
                    icon={<UserGroupIcon className="w-7 h-7 text-cyan-400" />}
                />
                 <StatCard 
                    title="Jugadores" 
                    value={players.length}
                    icon={<UserGroupIcon className="w-7 h-7 text-cyan-400" />}
                />
            </div>

            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                <h3 className="text-2xl font-bold text-white mb-4">Todos los Usuarios</h3>
                 <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {users.filter(u => u.role !== UserRole.ADMIN).sort((a,b) => b.balance-a.balance).map(user => 
                        <UserRow key={user.id} user={user} onChat={() => handleChat(user)} />
                    )}
                </div>
            </div>
        </div>
        {chatPartner && <ChatModal partnerId={chatPartner.id} partnerName={chatPartner.name} partnerAvatar={chatPartner.avatar} onClose={() => setChatPartner(null)} />}
        </>
    );
};

export default AdminDashboard;
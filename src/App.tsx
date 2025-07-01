import React, { useState, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GameProvider, useGame } from './context/GameContext';
import { RaffleProvider, useRaffle } from './context/RaffleContext';
import { ChatProvider, useChat } from './context/ChatContext';
import LoginScreen from './components/LoginScreen';
import LobbyScreen from './components/LobbyScreen';
import GameScreen from './components/GameScreen';
import RaffleScreen from './components/RaffleScreen';
import { User, Game, CreditRequest, CreditRequestStatus, UserRole, Raffle, ChatMessage, GameStatus } from './types';
import { MOCK_USERS, MOCK_GAMES, MOCK_CREDIT_REQUESTS, MOCK_RAFFLES, MOCK_CHAT_MESSAGES } from './data/mock';
import Header from './components/Header';
import { AddUserResult } from './context/AuthContext';

const AppContent: React.FC = () => {
    const { currentUser } = useAuth();
    const { activeGameId, setActiveGameId } = useGame();
    const { activeRaffleId, setActiveRaffleId } = useRaffle();

    if (!currentUser) {
        return <LoginScreen />;
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans">
            <Header />
            <main className="container mx-auto p-4 md:p-8">
                {activeGameId ? (
                    <GameScreen gameId={activeGameId} onExit={() => setActiveGameId(null)} />
                ) : activeRaffleId ? (
                    <RaffleScreen raffleId={activeRaffleId} onExit={() => setActiveRaffleId(null)} />
                ) : (
                    <LobbyScreen 
                        onJoinGame={(id) => setActiveGameId(id)} 
                        onJoinRaffle={(id) => setActiveRaffleId(id)}
                    />
                )}
            </main>
        </div>
    );
};

const App: React.FC = () => {
    const [users, setUsers] = useState<User[]>(MOCK_USERS);
    const [games, setGames] = useState<Game[]>(MOCK_GAMES);
    const [raffles, setRaffles] = useState<Raffle[]>(MOCK_RAFFLES);
    const [creditRequests, setCreditRequests] = useState<CreditRequest[]>(MOCK_CREDIT_REQUESTS);
    const [messages, setMessages] = useState<ChatMessage[]>(MOCK_CHAT_MESSAGES);

    const updateBalance = useCallback((userId: string, amount: number, operation: 'add' | 'subtract') => {
        setUsers(prevUsers => {
            const userToUpdate = prevUsers.find(u => u.id === userId);
            // Admin has infinite balance, so their balance doesn't decrease on subtractions (approvals)
            if (userToUpdate?.role === UserRole.ADMIN && operation === 'subtract') {
                return prevUsers;
            }

            return prevUsers.map(u => {
                if (u.id === userId) {
                    const newBalance = operation === 'add' ? u.balance + amount : u.balance - amount;
                    return { ...u, balance: Math.max(0, newBalance) };
                }
                return u;
            });
        });
    }, []);

    const addUser = useCallback((newUser: Pick<User, 'username' | 'password' | 'name' | 'role' | 'email' | 'avatar'>): AddUserResult => {
        if (users.some(u => u.username.toLowerCase() === newUser.username.toLowerCase())) {
            return { success: false, error: 'USERNAME_TAKEN' };
        }
        if (newUser.email && users.some(u => u.email && u.email.toLowerCase() === newUser.email!.toLowerCase())) {
            return { success: false, error: 'EMAIL_TAKEN' };
        }
        
        const fullUser: User = {
            ...newUser,
            id: `user-${Date.now()}`,
            balance: 0,
        };
        setUsers(prev => [...prev, fullUser]);
        return { success: true, user: fullUser };
    }, [users]);

    const addRequest = useCallback((request: Omit<CreditRequest, 'id' | 'createdAt'>) => {
        const newRequest: CreditRequest = {
            ...request,
            id: `req-${Date.now()}`,
            createdAt: Date.now(),
        };
        setCreditRequests(prev => [...prev, newRequest]);
    }, []);

    const updateRequest = useCallback((requestId: string, status: CreditRequestStatus) => {
        setCreditRequests(prev => prev.map(r => r.id === requestId ? { ...r, status } : r));
    }, []);

    const addGame = useCallback((game: Game) => {
        setGames(prev => [...prev, game]);
    }, []);
    
    const updateGame = useCallback((updatedGame: Game) => {
        setGames(prevGames => prevGames.map(g => g.id === updatedGame.id ? updatedGame : g));
    }, []);

    const deleteGame = useCallback((gameToDelete: Game) => {
        if (!gameToDelete) {
            console.error("Attempted to delete a null/undefined game.");
            return;
        }
    
        // Perform the refund action first, before updating the games list.
        if (gameToDelete.status === GameStatus.WAITING) {
            updateBalance(gameToDelete.organizerId, gameToDelete.prize, 'add');
        }
    
        // Now, update the games list. This is a separate state update.
        setGames(prevGames => prevGames.filter(g => g.id !== gameToDelete.id));
    }, [updateBalance]);

    const addRaffle = useCallback((raffle: Raffle) => {
        setRaffles(prev => [...prev, raffle]);
    }, []);
    
    const updateRaffle = useCallback((updatedRaffle: Raffle) => {
        setRaffles(prevRaffles => prevRaffles.map(r => r.id === updatedRaffle.id ? updatedRaffle : r));
    }, []);

    const addMessage = useCallback((message: ChatMessage) => {
        setMessages(prev => [...prev, message]);
    }, []);

    const updateMessages = useCallback((updatedMessages: ChatMessage[]) => {
        setMessages(updatedMessages);
    }, []);


    return (
        <AuthProvider 
            users={users} 
            onUpdateBalance={updateBalance}
            creditRequests={creditRequests}
            onAddRequest={addRequest}
            onUpdateRequest={updateRequest}
            onAddUser={addUser}
        >
            <GameProvider games={games} onAddGame={addGame} onUpdateGame={updateGame} onDeleteGame={deleteGame}>
                <RaffleProvider raffles={raffles} onAddRaffle={addRaffle} onUpdateRaffle={updateRaffle}>
                    <ChatProvider messages={messages} onAddMessage={addMessage} onUpdateMessages={updateMessages}>
                        <AppContent />
                    </ChatProvider>
                </RaffleProvider>
            </GameProvider>
        </AuthProvider>
    );
};

export default App;
import { User, Game, UserRole, GameStatus, GameMode, BingoPattern, CreditRequest, Raffle, RaffleStatus, RaffleTicketStatus, RaffleTicket, ChatMessage, RaffleMode } from '../types';
import { generateBingoCard } from '../utils/bingo';

export const MOCK_USERS: User[] = [
    { id: 'user-1', username: 'miaceleste', password: 'celeste123', name: 'Mia Celeste', role: UserRole.USER, balance: 500, avatar: 'https://xsgames.co/randomusers/assets/avatars/female/70.jpg', email: 'mia.celeste@example.com' },
    { id: 'user-2', username: 'kusu', password: 'kusu123', name: 'Kusu', role: UserRole.ORGANIZER, balance: 2000, avatar: 'https://xsgames.co/randomusers/assets/avatars/female/33.jpg', email: 'kusu.organizer@example.com' },
    { id: 'user-3', username: '100%maracucho', password: '12', name: 'Angel', role: UserRole.ADMIN, balance: 999999999, avatar: 'https://xsgames.co/randomusers/assets/avatars/male/42.jpg', email: 'angel.admin@example.com' },
    { id: 'user-4', username: 'david', password: 'david123', name: 'Jugador David', role: UserRole.USER, balance: 150, avatar: 'https://xsgames.co/randomusers/assets/avatars/male/12.jpg', email: 'david.player@example.com' },
];

export const MOCK_CREDIT_REQUESTS: CreditRequest[] = [];

export const MOCK_GAMES: Game[] = [
    {
        id: 'game-1',
        organizerId: 'user-2',
        organizerName: 'Kusu',
        prize: 1000,
        cardPrice: 50,
        status: GameStatus.WAITING,
        players: [
            { userId: 'user-4', cards: [generateBingoCard()] }
        ],
        calledNumbers: [],
        winners: [],
        createdAt: Date.now() - 1000 * 60 * 5, // 5 minutes ago
        pot: 1000 + 50, // prize + cards sold
        mode: GameMode.AUTOMATIC,
        pattern: BingoPattern.ANY_LINE,
        payoutComplete: false,
    }
];

const initialTickets: RaffleTicket[] = Array.from({ length: 100 }, (_, i) => ({
    number: i,
    status: RaffleTicketStatus.AVAILABLE,
}));

// Pre-populate some tickets for demonstration
initialTickets[5] = { number: 5, status: RaffleTicketStatus.SOLD, ownerId: 'user-1', ownerName: 'Mia Celeste' };
initialTickets[10] = { number: 10, status: RaffleTicketStatus.RESERVED, ownerId: 'user-4', ownerName: 'Jugador David', paymentProofUrl: 'https://via.placeholder.com/150' };
initialTickets[22] = { number: 22, status: RaffleTicketStatus.SOLD, ownerId: 'user-1', ownerName: 'Mia Celeste' };
initialTickets[45] = { number: 45, status: RaffleTicketStatus.SOLD, ownerId: 'user-4', ownerName: 'Jugador David' };
initialTickets[88] = { number: 88, status: RaffleTicketStatus.SOLD, ownerId: 'user-4', ownerName: 'Jugador David' };


export const MOCK_RAFFLES: Raffle[] = [
    {
        id: 'raffle-1',
        organizerId: 'user-2',
        organizerName: 'Kusu',
        name: 'Gran Rifa de Verano',
        prize: 5000,
        ticketPrice: 100,
        status: RaffleStatus.WAITING,
        tickets: initialTickets,
        createdAt: Date.now(),
        mode: RaffleMode.AUTOMATIC,
    },
    {
        id: 'raffle-2',
        organizerId: 'user-2',
        organizerName: 'Kusu',
        name: 'Rifa Rápida',
        prize: 200,
        ticketPrice: 20,
        status: RaffleStatus.FINISHED,
        tickets: Array.from({ length: 50 }, (_, i) => ({
            number: i,
            status: i === 23 ? RaffleTicketStatus.SOLD : RaffleTicketStatus.AVAILABLE,
            ownerId: i === 23 ? 'user-1' : undefined,
            ownerName: i === 23 ? 'Mia Celeste' : undefined,
        })),
        createdAt: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
        winnerTicket: 23,
        winnerId: 'user-1',
        payoutComplete: true,
        mode: RaffleMode.AUTOMATIC,
    }
];

export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
    { id: 'msg-1', senderId: 'user-1', senderName: 'Mia Celeste', receiverId: 'user-2', text: 'Hola Kusu! Tengo una pregunta sobre la rifa.', timestamp: Date.now() - 1000 * 60 * 5, read: true },
    { id: 'msg-2', senderId: 'user-2', senderName: 'Kusu', receiverId: 'user-1', text: 'Hola Mia! Claro, dime.', timestamp: Date.now() - 1000 * 60 * 4, read: true },
    { id: 'msg-3', senderId: 'user-1', senderName: 'Mia Celeste', receiverId: 'user-2', text: 'Si gano, ¿el premio se acredita automáticamente?', timestamp: Date.now() - 1000 * 60 * 3, read: false },
    { id: 'msg-4', senderId: 'user-2', senderName: 'Kusu', receiverId: 'user-3', text: 'Hola Angel, necesito ayuda con una transferencia.', timestamp: Date.now() - 1000 * 60 * 10, read: false },
];
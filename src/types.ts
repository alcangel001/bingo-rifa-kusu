export enum UserRole {
    USER = 'user',
    ORGANIZER = 'organizer',
    ADMIN = 'admin',
}

export interface User {
    id: string;
    username: string;
    password?: string; // Made optional for potential future integrations
    name:string;
    email?: string;
    role: UserRole;
    balance: number;
    avatar: string;
}

export interface BingoNumber {
    value: number;
    marked: boolean;
}

export type BingoCard = (BingoNumber | { value: 'FREE'; marked: true })[][];

export interface GamePlayer {
    userId: string;
    cards: BingoCard[];
}

export enum GameStatus {
    WAITING = 'Esperando Jugadores',
    IN_PROGRESS = 'En Progreso',
    FINISHED = 'Finalizado',
}

export enum GameMode {
    AUTOMATIC = 'Automático',
    MANUAL = 'Manual',
}

export enum BingoPattern {
    FULL_HOUSE = 'Cartón Lleno',
    ANY_LINE = 'Cualquier Línea',
    FOUR_CORNERS = '4 Esquinas',
    CROSS = 'Cruz',
    LETTER_X = 'Letra X',
    SMALL_SQUARE = 'Cuadrito',
    TOP_ROW = 'Línea Arriba',
    MIDDLE_ROW = 'Línea Medio',
    BOTTOM_ROW = 'Línea Abajo',
    LEFT_L = 'L Izquierda',
    RIGHT_L = 'L Derecha',
}


export enum CreditRequestStatus {
    PENDING = 'Pendiente',
    APPROVED = 'Aprobado',
    REJECTED = 'Rechazado',
}

export interface CreditRequest {
    id: string;
    fromUserId: string;
    fromUserName: string;
    toUserId: string;
    amount: number;
    status: CreditRequestStatus;
    createdAt: number;
    paymentProofUrl?: string;
}

export interface Game {
    id: string;
    organizerId: string;
    organizerName: string;
    prize: number;
    cardPrice: number;
    status: GameStatus;
    players: GamePlayer[];
    calledNumbers: number[];
    winners: string[]; // User IDs
    createdAt: number;
    pot: number;
    mode: GameMode;
    pattern: BingoPattern;
    payoutComplete?: boolean;
}

// --- New Types for Raffles ---

export enum RaffleStatus {
    WAITING = 'Abierta',
    FINISHED = 'Finalizada',
}

export enum RaffleTicketStatus {
    AVAILABLE = 'Disponible',
    RESERVED = 'Reservado', // Pending payment approval
    SOLD = 'Vendido',
}

export enum RaffleMode {
    AUTOMATIC = 'Automático',
    MANUAL = 'Manual',
}

export interface RaffleTicket {
    number: number;
    status: RaffleTicketStatus;
    ownerId?: string;
    ownerName?: string;
    paymentProofUrl?: string; // For reserved tickets
}

export interface Raffle {
    id: string;
    organizerId: string;
    organizerName: string;
    name: string;
    prize: number;
    ticketPrice: number;
    status: RaffleStatus;
    tickets: RaffleTicket[];
    createdAt: number;
    mode: RaffleMode;
    winnerTicket?: number;
    winnerId?: string;
    payoutComplete?: boolean;
}

// --- New Types for Chat ---

export interface ChatMessage {
    id: string;
    senderId: string;
    senderName: string;
    receiverId: string;
    text: string;
    timestamp: number;
    read: boolean;
}
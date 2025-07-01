import React, { createContext, useState, useContext, useMemo } from 'react';
import { Raffle } from '../types';

interface RaffleContextType {
    raffles: Raffle[];
    addRaffle: (raffle: Raffle) => void;
    updateRaffle: (raffle: Raffle) => void;
    activeRaffleId: string | null;
    setActiveRaffleId: (id: string | null) => void;
}

const RaffleContext = createContext<RaffleContextType | undefined>(undefined);

interface RaffleProviderProps {
    children: React.ReactNode;
    raffles: Raffle[];
    onAddRaffle: (raffle: Raffle) => void;
    onUpdateRaffle: (raffle: Raffle) => void;
}

export const RaffleProvider: React.FC<RaffleProviderProps> = ({ children, raffles, onAddRaffle, onUpdateRaffle }) => {
    const [activeRaffleId, setActiveRaffleId] = useState<string | null>(null);

    const value = useMemo(() => ({
        raffles,
        addRaffle: onAddRaffle,
        updateRaffle: onUpdateRaffle,
        activeRaffleId,
        setActiveRaffleId,
    }), [raffles, onAddRaffle, onUpdateRaffle, activeRaffleId]);

    return <RaffleContext.Provider value={value}>{children}</RaffleContext.Provider>;
};

export const useRaffle = () => {
    const context = useContext(RaffleContext);
    if (context === undefined) {
        throw new Error('useRaffle must be used within a RaffleProvider');
    }
    return context;
};


import React, { createContext, useState, useContext, useMemo } from 'react';
import { Game } from '../types';

interface GameContextType {
    games: Game[];
    addGame: (game: Game) => void;
    updateGame: (game: Game) => void;
    deleteGame: (game: Game) => void;
    activeGameId: string | null;
    setActiveGameId: (id: string | null) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

interface GameProviderProps {
    children: React.ReactNode;
    games: Game[];
    onAddGame: (game: Game) => void;
    onUpdateGame: (game: Game) => void;
    onDeleteGame: (game: Game) => void;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children, games, onAddGame, onUpdateGame, onDeleteGame }) => {
    const [activeGameId, setActiveGameId] = useState<string | null>(null);

    const value = useMemo(() => ({
        games,
        addGame: onAddGame,
        updateGame: onUpdateGame,
        deleteGame: onDeleteGame,
        activeGameId,
        setActiveGameId,
    }), [games, onAddGame, onUpdateGame, onDeleteGame, activeGameId]);

    return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => {
    const context = useContext(GameContext);
    if (context === undefined) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};
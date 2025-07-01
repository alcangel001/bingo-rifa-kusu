import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { ChatMessage, User } from '../types';
import { useAuth } from './AuthContext';

interface ChatContextType {
    messages: ChatMessage[];
    sendMessage: (text: string, receiverId: string) => void;
    markMessagesAsRead: (partnerId: string) => void;
    getUnreadCountForPartner: (partnerId: string) => number;
    getConversationPartners: () => User[];
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
    children: React.ReactNode;
    messages: ChatMessage[];
    onAddMessage: (message: ChatMessage) => void;
    onUpdateMessages: (messages: ChatMessage[]) => void;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children, messages, onAddMessage, onUpdateMessages }) => {
    const { currentUser, users } = useAuth();

    const sendMessage = useCallback((text: string, receiverId: string) => {
        if (!currentUser) return;
        const newMessage: ChatMessage = {
            id: `msg-${Date.now()}`,
            senderId: currentUser.id,
            senderName: currentUser.name,
            receiverId,
            text,
            timestamp: Date.now(),
            read: false,
        };
        onAddMessage(newMessage);
    }, [currentUser, onAddMessage]);

    const markMessagesAsRead = useCallback((partnerId: string) => {
        if (!currentUser) return;
        const updatedMessages = messages.map(msg => 
            (msg.senderId === partnerId && msg.receiverId === currentUser.id && !msg.read) 
                ? { ...msg, read: true } 
                : msg
        );
        // Only update state if there was an actual change
        if (JSON.stringify(updatedMessages) !== JSON.stringify(messages)) {
            onUpdateMessages(updatedMessages);
        }
    }, [currentUser, messages, onUpdateMessages]);

    const getUnreadCountForPartner = useCallback((partnerId: string): number => {
        if (!currentUser) return 0;
        return messages.filter(msg => msg.senderId === partnerId && msg.receiverId === currentUser.id && !msg.read).length;
    }, [currentUser, messages]);
    
    const getConversationPartners = useCallback((): User[] => {
        if (!currentUser) return [];
        const partnerIds = new Set<string>();
        messages.forEach(msg => {
            if (msg.senderId === currentUser.id) partnerIds.add(msg.receiverId);
            if (msg.receiverId === currentUser.id) partnerIds.add(msg.senderId);
        });
        return users.filter(u => partnerIds.has(u.id));
    }, [currentUser, messages, users]);

    const value = useMemo(() => ({
        messages,
        sendMessage,
        markMessagesAsRead,
        getUnreadCountForPartner,
        getConversationPartners,
    }), [messages, sendMessage, markMessagesAsRead, getUnreadCountForPartner, getConversationPartners]);

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};
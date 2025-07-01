import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { ChatMessage } from '../types';

interface ChatModalProps {
    partnerId: string;
    partnerName: string;
    partnerAvatar: string;
    onClose: () => void;
}

const ChatModal: React.FC<ChatModalProps> = ({ partnerId, partnerName, partnerAvatar, onClose }) => {
    const { currentUser } = useAuth();
    const { messages, sendMessage, markMessagesAsRead } = useChat();
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        markMessagesAsRead(partnerId);
    }, [partnerId, markMessagesAsRead, messages]);
    
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const conversationMessages = useMemo(() => {
        if (!currentUser) return [];
        return messages
            .filter(msg =>
                (msg.senderId === currentUser.id && msg.receiverId === partnerId) ||
                (msg.senderId === partnerId && msg.receiverId === currentUser.id)
            )
            .sort((a, b) => a.timestamp - b.timestamp);
    }, [messages, currentUser, partnerId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            sendMessage(newMessage, partnerId);
            setNewMessage('');
        }
    };
    
    if (!currentUser) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg h-[70vh] border border-slate-700 flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center gap-4 p-4 border-b border-slate-700 bg-slate-900/50 rounded-t-2xl">
                    <img src={partnerAvatar} alt={partnerName} className="w-10 h-10 rounded-full" />
                    <h2 className="text-xl font-bold text-white flex-grow">{partnerName}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white text-3xl leading-none">&times;</button>
                </header>

                <main className="flex-grow p-4 space-y-4 overflow-y-auto">
                    {conversationMessages.map(msg => (
                        <div
                            key={msg.id}
                            className={`flex items-end gap-2 ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.senderId === currentUser.id ? 'bg-cyan-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                                <p>{msg.text}</p>
                                <p className="text-xs opacity-70 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </main>

                <footer className="p-4 border-t border-slate-700">
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Escribe un mensaje..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            autoComplete="off"
                        />
                        <button
                            type="submit"
                            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-5 rounded-lg transition-colors"
                        >
                            Enviar
                        </button>
                    </form>
                </footer>
            </div>
        </div>
    );
};

export default ChatModal;
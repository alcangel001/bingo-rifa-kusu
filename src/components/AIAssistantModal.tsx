
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { SparklesIcon } from './Icon';

const API_KEY = import.meta.env.VITE_API_KEY;

interface Message {
    role: 'user' | 'model';
    text: string;
}

interface AIAssistantModalProps {
    onClose: () => void;
}

const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ onClose }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);

    const chatSession = useMemo<Chat | null>(() => {
        if (!API_KEY) {
            console.error("API_KEY no está configurada.");
            setError("La clave de API no está configurada. El asistente de IA no puede funcionar.");
            return null;
        }
        try {
            const ai = new GoogleGenAI({ apiKey: API_KEY });
            return ai.chats.create({
                model: 'gemini-2.5-flash-preview-04-17',
                config: {
                    systemInstruction: "Eres 'Kusu-Bot', un asistente de IA amigable y servicial para la aplicación web 'Bingo Kusu'. Tu propósito es ayudar a los usuarios a comprender cómo jugar al bingo y a las rifas, cómo administrar créditos y responder cualquier pregunta que tengan sobre la funcionalidad de la aplicación. Sé conciso, claro y alentador. Nunca inventes funciones que no existen. El juego es creado por 'Kusu', el administrador es 'Angel'. Los usuarios pueden ser 'Jugador' (Player) u 'Organizador' (Organizer). La aplicación tiene juegos de Bingo y Rifas.",
                }
            });
        } catch(e) {
            console.error("Error creating chat session:", e);
            setError("Hubo un error al inicializar el asistente de IA. Verifica la configuración.");
            return null;
        }
    }, []);

    useEffect(() => {
        if (chatSession) {
            setMessages([{ role: 'model', text: "¡Hola! Soy Kusu-Bot, tu asistente de IA. ¿En qué puedo ayudarte hoy?" }]);
        } else {
            setMessages([{ role: 'model', text: "Lo siento, el Asistente de IA no está disponible. La clave de API no está configurada correctamente." }]);
        }
    }, [chatSession]);


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, isLoading]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !chatSession) return;

        const userMessage: Message = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        const textToSend = input;
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            const response: GenerateContentResponse = await chatSession.sendMessage({ message: textToSend });
            const aiMessage: Message = { role: 'model', text: response.text };
            setMessages(prev => [...prev, aiMessage]);
        } catch (err) {
            console.error("Error sending message:", err);
            const errorMessage = "Lo siento, no pude procesar tu solicitud en este momento. Por favor, intenta de nuevo más tarde.";
            setError(errorMessage);
            setMessages(prev => [...prev, { role: 'model', text: errorMessage }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg h-[70vh] border border-slate-700 flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center gap-4 p-4 border-b border-slate-700 bg-slate-900/50 rounded-t-2xl">
                    <div className="relative">
                        <img src="https://xsgames.co/randomusers/assets/avatars/female/33.jpg" className="w-10 h-10 rounded-full" alt="Kusu-Bot" />
                        <div className="absolute -bottom-1 -right-1 p-1 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-full border-2 border-slate-800">
                             <SparklesIcon className="w-3 h-3 text-white"/>
                        </div>
                    </div>
                    <h2 className="text-xl font-bold text-white flex-grow">Asistente Kusu-Bot</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white text-3xl leading-none">&times;</button>
                </header>

                <main className="flex-grow p-4 space-y-4 overflow-y-auto">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                             {msg.role === 'model' && <img src="https://xsgames.co/randomusers/assets/avatars/female/33.jpg" className="w-8 h-8 rounded-full self-start flex-shrink-0" alt="Kusu-Bot" />}
                            <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.role === 'user' ? 'bg-cyan-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex items-start gap-3 justify-start">
                             <img src="https://xsgames.co/randomusers/assets/avatars/female/33.jpg" className="w-8 h-8 rounded-full flex-shrink-0" alt="Kusu-Bot" />
                             <div className="max-w-xs md:max-w-md p-3 rounded-2xl bg-slate-700 text-slate-200 rounded-bl-none">
                                <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 bg-cyan-400 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                                    <span className="h-2 w-2 bg-cyan-400 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                                    <span className="h-2 w-2 bg-cyan-400 rounded-full animate-pulse"></span>
                                </div>
                            </div>
                         </div>
                    )}
                    <div ref={messagesEndRef} />
                </main>

                <footer className="p-4 border-t border-slate-700">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={error ? error : "Pregúntale algo a Kusu-Bot..."}
                            className={`w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500 placeholder:text-red-500/70' : 'focus:ring-cyan-500'}`}
                            autoComplete="off"
                            disabled={isLoading || !chatSession}
                        />
                        <button
                            type="submit"
                            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-5 rounded-lg transition-colors disabled:bg-slate-600"
                            disabled={isLoading || !input.trim() || !chatSession}
                        >
                            Enviar
                        </button>
                    </form>
                </footer>
            </div>
        </div>
    );
};

export default AIAssistantModal;

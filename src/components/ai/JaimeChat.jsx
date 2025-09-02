import React, { useState, useEffect, useRef } from 'react';
import { Bot, User, Send, Loader2, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getWeather } from "@/api/functions";
import { useTranslation } from "@/components/utils/i18n";
import { getIconForCategory } from '@/components/utils/iconMap';

const initialSuggestions = [
    { question: "¿Cómo publico mi propiedad?" },
    { question: "Qué hacer hoy según el clima" },
    { question: "Ruta al Volcán Osorno" },
    { question: "Restaurantes recomendados" }
];

export default function JaimeChat({ isModal = false, onClose }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [weather, setWeather] = useState(null);
    const chatEndRef = useRef(null);
    const inputRef = useRef(null);
    const { t } = useTranslation();

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const weatherData = await getWeather();
                if (weatherData && weatherData.data) {
                    setWeather(weatherData.data);
                }
            } catch (error) {
                console.error("Error fetching weather:", error);
            }
        };
        fetchWeather();
        inputRef.current?.focus();
    }, []);

    const handleInitialQuestion = (question) => {
        setInput(question);
        // Automatically send the message
        handleSend(question);
    };

    const handleSend = async (messageToSend = input) => {
        if (!messageToSend.trim()) return;

        const userMessage = { role: 'user', content: messageToSend };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        // Placeholder for AI response
        setTimeout(() => {
            const botResponse = {
                role: 'bot',
                content: `Recibí tu pregunta: "${messageToSend}". Estoy buscando la mejor respuesta para ti...`
            };
            setMessages(prev => [...prev, botResponse]);
            setIsLoading(false);
            scrollToBottom();
        }, 1500);
    };
    
    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            <style>{`
              /* JaimeChat specific neumorphic styles */
              .jaime-neuro-suggestions .neuro-button {
                padding: 0.5rem 0.8rem !important; /* Smaller padding for suggestion chips */
                font-size: 0.8rem !important;
                font-weight: 500 !important;
              }
      
              .jaime-neuro-input-wrapper {
                position: relative;
                background: var(--neu-bg);
                border-radius: 12px;
                box-shadow: inset 4px 4px 8px var(--neu-dark), inset -4px -4px 8px var(--neu-light);
                padding: 0.25rem;
                display: flex;
                align-items: center;
              }
      
              .jaime-neuro-input-wrapper textarea {
                background: transparent;
                border: none;
                resize: none;
                outline: none;
                width: 100%;
                padding: 0.75rem;
                color: var(--neu-text);
              }
              .jaime-neuro-input-wrapper textarea::placeholder {
                color: var(--neu-text-light);
              }
      
              .jaime-send-button {
                background: var(--neu-bg) !important;
                color: var(--neu-text) !important;
                border: none !important;
                border-radius: 50% !important; /* Circular button */
                box-shadow: 3px 3px 6px var(--neu-dark), -3px -3px 6px var(--neu-light) !important;
                transition: all 0.2s ease-in-out !important;
                width: 36px;
                height: 36px;
                min-width: 36px;
                padding: 0;
                margin-right: 4px;
              }
              .jaime-send-button:hover {
                transform: translateY(-1px);
              }
              .jaime-send-button:active {
                box-shadow: inset 2px 2px 4px var(--neu-dark), inset -2px -2px 4px var(--neu-light) !important;
                color: var(--neu-accent) !important;
              }
            `}</style>
            <div className="h-full flex flex-col bg-[#e0e0e0] text-slate-800">
                {/* Header */}
                <div className="flex-shrink-0 p-4 border-b border-slate-300/70">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-lg font-bold">Asistente Jaime - Soporte y Turismo</h2>
                        {isModal && <button onClick={onClose} className="text-slate-500 hover:text-slate-800"><X className="w-5 h-5" /></button>}
                    </div>
                    {weather && (
                        <div className="text-xs text-slate-600">
                            <p><span className="font-semibold">Puerto Varas:</span> {weather.description}, {weather.temp}°C - Día ({weather.day_hours})</p>
                            <p>Pronóstico 27-08-2025: {weather.forecast_max}° / {weather.forecast_min}°</p>
                            <p className="text-slate-500">Datos de windy.com (via backend) - Actualizado hace {weather.updated_ago}</p>
                        </div>
                    )}
                </div>

                {/* Chat Area */}
                <div className="flex-grow p-4 overflow-y-auto space-y-4">
                    <div className="flex gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <div className="bg-white rounded-xl p-3 text-sm">
                                <p>¡Hola! Soy Jaime, tu asistente virtual para Arriendos Puerto Varas. Puedo ayudarte con dudas del sitio web y darte recomendaciones turísticas personalizadas según el clima actual de Puerto Varas. ¿En qué puedo asistirte?</p>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3 jaime-neuro-suggestions">
                                {initialSuggestions.map((q) => (
                                    <Button
                                        key={q.question}
                                        onClick={() => handleInitialQuestion(q.question)}
                                        className="neuro-button"
                                    >
                                        {q.question}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* Placeholder for future messages */}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className="flex-shrink-0 p-4 border-t border-slate-300/70">
                    <div className="jaime-neuro-input-wrapper">
                        <Textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Escribe tu pregunta sobre el sitio o pide recomendaciones turísticas..."
                            rows={1}
                            disabled={isLoading}
                        />
                        <Button
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            size="icon"
                            className="jaime-send-button"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </Button>
                    </div>
                    <p className="text-xs text-center text-slate-500 mt-2">Jaime usa datos en tiempo real del clima para darte las mejores recomendaciones.</p>
                </div>
            </div>
        </>
    );
}
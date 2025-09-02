import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Bot, User, Send, Loader2 } from 'lucide-react';
import { InvokeLLM } from '@/api/integrations';
import { knowledgeBase } from './knowledgeBase';

export default function AIOperativeCopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hola, soy tu copiloto de IA. ¿En qué puedo ayudarte hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const prompt = `
        ${knowledgeBase}

        Eres "IA Operativa", un asistente experto para administradores de arriendospuertovaras.cl. 
        Tu tono es profesional, conciso y útil.
        Basándote en la base de conocimiento, responde la siguiente consulta del administrador.
        La consulta es: "${input}"
      `;

      const response = await InvokeLLM({ prompt });
      const assistantMessage = { role: 'assistant', content: response };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      const errorMessage = { role: 'assistant', content: 'Lo siento, tuve un problema al procesar tu solicitud.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="default"
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 flex items-center justify-center bg-blue-600 hover:bg-blue-700"
          >
            <Sparkles className="h-7 w-7 text-white" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px] h-[70vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              IA Operativa
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 px-6">
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'assistant' && <Bot className="h-6 w-6 text-blue-600 flex-shrink-0" />}
                  <div className={`p-3 rounded-lg max-w-[80%] ${msg.role === 'user' ? 'bg-blue-100 text-blue-900' : 'bg-slate-100 text-slate-800'}`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                   {msg.role === 'user' && <User className="h-6 w-6 text-slate-600 flex-shrink-0" />}
                </div>
              ))}
              {isLoading && (
                 <div className="flex items-start gap-3">
                   <Bot className="h-6 w-6 text-blue-600 flex-shrink-0" />
                   <div className="p-3 rounded-lg bg-slate-100">
                     <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
                   </div>
                 </div>
              )}
            </div>
          </ScrollArea>
          <DialogFooter className="p-4 border-t">
            <form onSubmit={handleSendMessage} className="flex w-full gap-2">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Pregunta sobre la plataforma..."
                autoFocus
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
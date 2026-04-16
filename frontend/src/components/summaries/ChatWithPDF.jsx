import React, { useState, useRef, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, Bot, User, Loader2, Sparkles, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ChatWithPDF({
    pdfUrl,
    fileName
}) {
    const storageKey = `chat_history_${pdfUrl}`;

    const [messages, setMessages] = useState([]);

    // Load history on mount
    useEffect(() => {
        const savedHistory = localStorage.getItem(storageKey);
        if (savedHistory) {
            try {
                setMessages(JSON.parse(savedHistory));
            } catch (e) {
                console.error("Failed to parse chat history", e);
            }
        } else {
            setMessages([
                { role: 'ai', content: `Hi! I'm your PDF Intelligence Assistant. Ask me anything specifically about "${fileName}".` }
            ]);
        }
    }, [storageKey, fileName]);

    // Save history when messages change
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem(storageKey, JSON.stringify(messages));
        }
    }, [messages, storageKey]);

    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef(null);

    const clearHistory = () => {
        const initial = [{ role: 'ai', content: `Hi! I'm your PDF Intelligence Assistant. Ask me anything specifically about "${fileName}".` }];
        setMessages(initial);
        localStorage.setItem(storageKey, JSON.stringify(initial));
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            // Connect to Go Backend
            const response = await fetch('http://localhost:8081/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    pdfUrl: pdfUrl,
                    question: userMessage,
                }),
            });

            const data = await response.json();

            if (data.error) {
                setMessages(prev => [...prev, { role: 'ai', content: `Error: ${data.error}` }]);
            } else {
                setMessages(prev => [...prev, { role: 'ai', content: data.answer }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'ai', content: "I'm having trouble connecting to my brain. Is the Go backend running?" }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-semibold group">
                    <MessageSquare size={16} className="group-hover:scale-110 transition-transform" />
                    Chat with PDF
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col p-0 overflow-hidden bg-white/95 backdrop-blur-xl border-rose-100 shadow-2xl">
                <DialogHeader className="p-6 pb-4 bg-gradient-to-br from-rose-50/50 to-white border-b border-rose-50 flex flex-row items-center justify-between">
                    <div className="flex flex-col flex-1 min-w-0">
                        <DialogTitle className="flex items-center gap-2 text-rose-600">
                            <Sparkles className="w-5 h-5" />
                            PDF Intelligence
                            <span className="text-[10px] bg-rose-100 px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">Go Powered</span>
                        </DialogTitle>
                        <p className="text-xs text-slate-500 truncate mt-1">Analyzing: {fileName}</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        title="Clear History"
                        onClick={clearHistory}
                        className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                    >
                        <Trash2 size={16} />
                    </Button>
                </DialogHeader>

                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30"
                >
                    {messages.map((m, i) => (
                        <div
                            key={i}
                            className={cn(
                                "flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
                                m.role === 'user' ? "flex-row-reverse" : "flex-row"
                            )}
                        >
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
                                m.role === 'user' ? "bg-slate-900 border-slate-700" : "bg-rose-100 border-rose-200"
                            )}>
                                {m.role === 'user' ? <User size={14} className="text-white" /> : <Bot size={14} className="text-rose-600" />}
                            </div>
                            <div className={cn(
                                "max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm",
                                m.role === 'user'
                                    ? "bg-slate-900 text-slate-100 rounded-tr-none"
                                    : "bg-white border border-rose-50 text-slate-700 rounded-tl-none"
                            )}>
                                {m.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center animate-pulse">
                                <Bot size={14} className="text-rose-600" />
                            </div>
                            <div className="bg-white border border-rose-50 px-4 py-2 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2 text-slate-400 text-sm">
                                <Loader2 size={14} className="animate-spin" />
                                Processing PDF text...
                            </div>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-rose-50 flex gap-2 items-center">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask anything about the document..."
                        className="flex-1 bg-slate-50 border-rose-50 focus-visible:ring-rose-500 h-11 rounded-xl"
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={isLoading || !input.trim()}
                        className="h-11 w-11 rounded-xl bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-200/50 transition-all active:scale-95"
                    >
                        <Send size={18} />
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

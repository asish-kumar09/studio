
"use client"

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Loader2, MessageSquare, User, Plus, History, Trash2, Bot } from 'lucide-react';
import { studentChatbotAssistance } from '@/ai/flows/student-chatbot-assistance';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

type ChatMessage = {
  id: string;
  senderType: 'user' | 'assistant';
  content: string;
  timestamp: any;
};

type ChatSession = {
  id: string;
  title: string;
  startTime: any;
};

export default function ChatbotPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const sessionsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, 'userProfiles', user.uid, 'chatSessions'),
      orderBy('startTime', 'desc')
    );
  }, [db, user]);

  const { data: sessions, isLoading: isSessionsLoading } = useCollection<ChatSession>(sessionsQuery);

  const messagesQuery = useMemoFirebase(() => {
    if (!user || !activeSessionId) return null;
    return query(
      collection(db, 'userProfiles', user.uid, 'chatSessions', activeSessionId, 'chatMessages'),
      orderBy('timestamp', 'asc')
    );
  }, [db, user, activeSessionId]);

  const { data: messages, isLoading: isMessagesLoading } = useCollection<ChatMessage>(messagesQuery);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isGenerating]);

  const handleStartNewChat = () => {
    setActiveSessionId(null);
    setInput('');
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    const sessionRef = doc(db, 'userProfiles', user.uid, 'chatSessions', sessionId);
    deleteDocumentNonBlocking(sessionRef);
    if (activeSessionId === sessionId) {
      setActiveSessionId(null);
    }
    toast({ title: "Session deleted" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user || isGenerating) return;

    const userQuery = input.trim();
    setInput('');
    setIsGenerating(true);

    let currentSessionId = activeSessionId;

    try {
      if (!currentSessionId) {
        const newSessionRef = doc(collection(db, 'userProfiles', user.uid, 'chatSessions'));
        currentSessionId = newSessionRef.id;
        await setDoc(newSessionRef, {
          id: currentSessionId,
          userId: user.uid,
          title: userQuery.slice(0, 30) + (userQuery.length > 30 ? '...' : ''),
          startTime: serverTimestamp(),
        });
        setActiveSessionId(currentSessionId);
      }

      const messagesRef = collection(db, 'userProfiles', user.uid, 'chatSessions', currentSessionId, 'chatMessages');
      addDocumentNonBlocking(messagesRef, {
        senderType: 'user',
        content: userQuery,
        timestamp: serverTimestamp(),
        sessionId: currentSessionId,
      });

      const history = messages?.map(msg => ({
        role: msg.senderType === 'user' ? 'user' : 'assistant' as 'user' | 'assistant',
        content: msg.content
      })) || [];

      const result = await studentChatbotAssistance({ 
        query: userQuery,
        studentId: user.uid, // PASSING STUDENT ID FOR TOOL CALLING
        history: history.slice(-5)
      });

      addDocumentNonBlocking(messagesRef, {
        senderType: 'assistant',
        content: result.answer,
        timestamp: serverTimestamp(),
        sessionId: currentSessionId,
      });

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Chat Error",
        description: "Failed to process your request. Please try again."
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-headline text-primary">Intelligent Assistant</h1>
        <p className="text-muted-foreground">Ask about university life, policies, or check your leave status.</p>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        <Card className="w-64 flex flex-col hidden md:flex">
          <CardHeader className="py-4 border-b">
            <Button onClick={handleStartNewChat} className="w-full justify-start gap-2" variant={activeSessionId ? "outline" : "default"}>
              <Plus className="h-4 w-4" /> New Chat
            </Button>
          </CardHeader>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground flex items-center gap-2">
                <History className="h-3 w-3" /> Recent Chats
              </div>
              {isSessionsLoading ? (
                <div className="p-4 flex justify-center"><Loader2 className="h-4 w-4 animate-spin" /></div>
              ) : sessions?.length ? (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => setActiveSessionId(session.id)}
                    className={cn(
                      "group flex items-center justify-between px-3 py-2 rounded-md text-sm cursor-pointer transition-colors",
                      activeSessionId === session.id 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-muted text-foreground"
                    )}
                  >
                    <span className="truncate flex-1">{session.title}</span>
                    <button 
                      onClick={(e) => handleDeleteSession(session.id, e)}
                      className={cn(
                        "opacity-0 group-hover:opacity-100 p-1 hover:text-destructive",
                        activeSessionId === session.id && "group-hover:text-white"
                      )}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-4 text-xs text-center text-muted-foreground italic">No previous chats</div>
              )}
            </div>
          </ScrollArea>
        </Card>

        <Card className="flex-1 flex flex-col shadow-lg border-primary/10">
          <CardHeader className="border-b py-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className={cn("h-2 w-2 rounded-full", isGenerating ? "bg-orange-500 animate-pulse" : "bg-green-500")} />
              {activeSessionId ? (sessions?.find(s => s.id === activeSessionId)?.title || "Current Chat") : "New Session"}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 p-0 overflow-hidden bg-muted/30">
            <ScrollArea className="h-full p-4" ref={scrollRef}>
              <div className="space-y-4 max-w-4xl mx-auto">
                {!activeSessionId && !messages?.length && !isGenerating && (
                  <div className="flex flex-col items-center justify-center h-[400px] text-center space-y-4">
                    <div className="bg-primary/10 p-4 rounded-full">
                      <Bot className="h-12 w-12 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">How can I help you today?</h3>
                      <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                        Try asking "What is the status of my recent leave requests?" or "How do I build a professional resume?"
                      </p>
                    </div>
                  </div>
                )}
                
                {messages?.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 ${message.senderType === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <Avatar className="h-8 w-8 mt-1 border shadow-sm">
                      {message.senderType === 'assistant' ? (
                        <>
                          <AvatarImage src="https://picsum.photos/seed/bot-ai/150/150" />
                          <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
                        </>
                      ) : (
                        <>
                          <AvatarImage src={`https://picsum.photos/seed/${user?.uid}/150/150`} />
                          <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                        </>
                      )}
                    </Avatar>
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-2.5 max-w-[80%] text-sm shadow-sm transition-all",
                        message.senderType === 'user'
                          ? 'bg-primary text-primary-foreground rounded-tr-none'
                          : 'bg-white text-foreground rounded-tl-none border border-primary/5'
                      )}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                
                {isGenerating && (
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8 mt-1 border shadow-sm">
                      <AvatarImage src="https://picsum.photos/seed/bot-ai/150/150" />
                      <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                    <div className="bg-white rounded-2xl px-4 py-2.5 flex items-center gap-1 shadow-sm border border-primary/5 rounded-tl-none">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-bounce" />
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-bounce delay-150" />
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-bounce delay-300" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>

          <CardFooter className="border-t p-4 bg-background">
            <form onSubmit={handleSubmit} className="flex w-full gap-2 max-w-4xl mx-auto">
              <Input
                placeholder="Ask me anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1"
                disabled={isGenerating}
              />
              <Button type="submit" disabled={isGenerating || !input.trim()}>
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

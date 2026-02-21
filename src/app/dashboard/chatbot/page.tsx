
"use client"

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Loader2, MessageSquare, User } from 'lucide-react';
import { studentChatbotAssistance } from '@/ai/flows/student-chatbot-assistance';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am StudentHub AI. How can I assist you with your academics or student life today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const result = await studentChatbotAssistance({ query: userMessage });
      setMessages(prev => [...prev, { role: 'assistant', content: result.answer }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-3xl font-bold font-headline text-primary">AI Student Assistant</h1>
        <p className="text-muted-foreground">Your intelligent companion for all university queries.</p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden shadow-lg border-primary/10">
        <CardHeader className="border-b py-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            AI Online
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-hidden">
          <ScrollArea className="h-full p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <Avatar className="h-8 w-8 mt-1">
                    {message.role === 'assistant' ? (
                      <>
                        <AvatarImage src="https://picsum.photos/seed/bot/150/150" />
                        <AvatarFallback><MessageSquare className="h-4 w-4" /></AvatarFallback>
                      </>
                    ) : (
                      <>
                        <AvatarImage src="https://picsum.photos/seed/user/150/150" />
                        <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                      </>
                    )}
                  </Avatar>
                  <div
                    className={`rounded-2xl px-4 py-2 max-w-[80%] text-sm shadow-sm ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                        : 'bg-muted text-foreground rounded-tl-none border'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarImage src="https://picsum.photos/seed/bot/150/150" />
                    <AvatarFallback><MessageSquare className="h-4 w-4" /></AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-2xl px-4 py-2 flex items-center gap-1 shadow-sm border rounded-tl-none">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" />
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce delay-150" />
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce delay-300" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex w-full gap-2">
            <Input
              placeholder="Ask about leave policies, exam schedules, or resume tips..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-background"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}

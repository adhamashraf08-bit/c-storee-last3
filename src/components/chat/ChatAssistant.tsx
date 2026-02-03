import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageSquare, Send, X, Loader2, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChatMessage, DashboardSummary, SalesRecord } from '@/types/sales';
import { supabase } from '@/integrations/supabase/client';

interface ChatAssistantProps {
  summary: DashboardSummary | null;
  salesData: SalesRecord[];
}

export function ChatAssistant({ summary, salesData }: ChatAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'مرحباً! أنا C Store Assistant 👋\n\nأقدر أساعدك تعرف أي معلومات عن المبيعات والتارجت. اسألني بالعربي، English، أو Franco!\n\nExamples:\n• "مبيعات فرع المعادي النهارده كام؟"\n• "Which branch has highest sales?"\n• "el target beta3 Talabat ad eh?"',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const contextData = {
        summary: summary ? {
          totalSales: summary.totalSales,
          totalOrders: summary.totalOrders,
          totalTarget: summary.totalTarget,
          overallAchievement: summary.overallAchievement,
          branches: summary.branchMetrics.map(b => ({
            name: b.branchName,
            sales: b.totalSales,
            orders: b.totalOrders,
            target: b.totalTarget,
            achievement: b.achievementPercentage,
            channels: b.channels.map(c => ({
              name: c.channelName,
              sales: c.sales,
              orders: c.orders,
              target: c.target,
              achievement: c.achievementPercentage,
            })),
          })),
        } : null,
        recentRecords: salesData.slice(0, 50),
      };

      const { data, error } = await supabase.functions.invoke('chat-assistant', {
        body: {
          message: input.trim(),
          context: contextData,
          conversationHistory: messages.slice(-6).map(m => ({
            role: m.role,
            content: m.content,
          })),
        },
      });

      if (error) throw error;

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'عذراً، حصل مشكلة. جرب تاني.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      console.error('Chat error:', err);
      const errMsg = err && typeof err === 'object' && 'message' in err ? String((err as Error).message) : '';
      const isNotFound =
        errMsg.includes('404') ||
        errMsg.includes('Function not found') ||
        (err && typeof err === 'object' && 'context' in err && (err as { context?: { status?: number } }).context?.status === 404);
      const content = isNotFound
        ? 'C Store Assistant isn’t set up on this project yet. Deploy the "chat-assistant" Edge Function to your Supabase project (see supabase/functions/DEPLOY_CHAT_ASSISTANT.md).'
        : 'عذراً، حصل خطأ في الاتصال. جرب تاني بعد شوية. 🙏';
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-300',
          'bg-primary text-primary-foreground hover:scale-110',
          isOpen && 'scale-0 opacity-0'
        )}
      >
        <img src="/cstore-logo.png" alt="C Store" className="h-8 w-8" />
      </button>

      {/* Chat Panel */}
      <div
        className={cn(
          'fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] rounded-2xl shadow-2xl transition-all duration-300 overflow-hidden',
          'bg-card border border-border',
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
        )}
      >
        {/* Header */}
        <div className="gradient-animated p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <img src="/cstore-logo.png" alt="C Store" className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">C Store Assistant</h3>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="h-80 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-2 animate-fade-in',
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              <div
                className={cn(
                  'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-accent text-accent-foreground'
                )}
              >
                {message.role === 'user' ? (
                  <User className="h-4 w-4" />
                ) : (
                  <img src="/cstore-logo.png" alt="C Store" className="h-4 w-4" />
                )}
              </div>
              <div
                className={cn(
                  'max-w-[80%]',
                  message.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2 animate-fade-in">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
                <img src="/cstore-logo.png" alt="C Store" className="h-4 w-4" />
              </div>
              <div className="chat-bubble-assistant">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="اكتب سؤالك هنا..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-muted border-0 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              disabled={isLoading}
            />
            <Button
              size="icon"
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="rounded-xl"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

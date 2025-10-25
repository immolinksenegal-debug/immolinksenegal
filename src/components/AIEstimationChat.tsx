import { useState, useEffect, useRef } from "react";
import { Bot, Send, X, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const AIEstimationChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Start conversation automatically
      streamChat([]);
    }
  }, [isOpen]);

  const streamChat = async (userMessages: Message[]) => {
    try {
      setIsLoading(true);
      
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-estimation`;
      
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: userMessages }),
      });

      if (response.status === 429) {
        toast({
          title: "Limite atteinte",
          description: "Trop de requêtes. Veuillez réessayer dans quelques instants.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (response.status === 402) {
        toast({
          title: "Service indisponible",
          description: "Le service est temporairement indisponible.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (!response.ok || !response.body) {
        throw new Error("Erreur de communication");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantMessage = "";

      const updateAssistantMessage = (chunk: string) => {
        assistantMessage += chunk;
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage?.role === "assistant") {
            return [...prev.slice(0, -1), { role: "assistant", content: assistantMessage }];
          }
          return [...prev, { role: "assistant", content: assistantMessage }];
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") continue;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) updateAssistantMessage(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de communiquer avec l'assistant IA",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: inputMessage,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage("");

    await streamChat(newMessages);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating AI Button - Positioned on right side at middle height */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-gradient-to-r from-secondary to-accent hover:from-secondary-glow hover:to-accent shadow-2xl z-50 p-0 group transition-all duration-500 hover:scale-125"
          style={{
            animation: "pulse-glow 2s ease-in-out infinite, float-right 3s ease-in-out infinite"
          }}
          aria-label="Estimation IA gratuite"
        >
          <div className="relative">
            <Bot className="h-7 w-7 sm:h-8 sm:w-8 text-white transition-transform duration-300 group-hover:rotate-12" />
            <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-white animate-pulse" />
          </div>
        </Button>
      )}

      <style>{`
        @keyframes float-right {
          0%, 100% {
            transform: translateY(-50%) translateX(0);
          }
          50% {
            transform: translateY(-50%) translateX(-8px);
          }
        }
      `}</style>

      {/* AI Chat Window - Positioned on right side */}
      {isOpen && (
        <Card className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 mt-20 sm:mt-24 w-[calc(100vw-2rem)] sm:w-[420px] h-[550px] sm:h-[650px] z-50 shadow-2xl border-2 border-secondary/30 flex flex-col animate-scale-in">
          <CardHeader className="bg-gradient-to-r from-secondary via-accent to-secondary text-white rounded-t-xl p-3 sm:p-4 flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <Avatar className="h-9 w-9 sm:h-11 sm:w-11 border-2 border-white bg-white/20 animate-pulse">
                <AvatarFallback className="bg-secondary text-white">
                  <Bot className="h-5 w-5 sm:h-6 sm:w-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  Assistant IA
                </CardTitle>
                <p className="text-xs opacity-90">Estimation gratuite instantanée</p>
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="h-7 w-7 sm:h-8 sm:w-8 text-white hover:bg-white/20 rounded-full transition-all hover:rotate-90"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
            <ScrollArea className="flex-1 p-3 sm:p-4" ref={scrollAreaRef}>
              <div className="space-y-3 sm:space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    } animate-fade-in-up`}
                  >
                    {message.role === "assistant" && (
                      <Avatar className="h-7 w-7 sm:h-8 sm:w-8 mr-2 border border-secondary/30">
                        <AvatarFallback className="bg-gradient-to-br from-secondary to-accent text-white">
                          <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[80%] sm:max-w-[85%] rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 ${
                        message.role === "user"
                          ? "bg-gradient-to-r from-secondary to-accent text-white"
                          : "bg-card border border-border text-foreground shadow-sm"
                      }`}
                    >
                      <p className="text-xs sm:text-sm leading-relaxed break-words whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>
                    {message.role === "user" && (
                      <Avatar className="h-7 w-7 sm:h-8 sm:w-8 ml-2 border border-primary/30">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <User className="h-4 w-4 sm:h-5 sm:w-5" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start animate-fade-in">
                    <Avatar className="h-7 w-7 sm:h-8 sm:w-8 mr-2 border border-secondary/30">
                      <AvatarFallback className="bg-gradient-to-br from-secondary to-accent text-white">
                        <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-card border border-border rounded-2xl px-4 py-3 shadow-sm">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                        <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="border-t border-border p-2 sm:p-3">
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Décrivez votre bien..."
                  disabled={isLoading}
                  className="flex-1 text-xs sm:text-sm rounded-xl border-2 focus:border-secondary"
                />
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-gradient-to-r from-secondary to-accent hover:from-secondary-glow hover:to-accent text-white rounded-xl h-9 w-9 sm:h-10 sm:w-10 shrink-0 shadow-md"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 text-center">
                💡 Estimation gratuite et instantanée par IA
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default AIEstimationChat;

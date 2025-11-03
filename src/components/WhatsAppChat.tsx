import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface WhatsAppChatProps {
  phoneNumber: string;
  propertyTitle?: string;
  propertyId?: string;
}

interface Message {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
}

const WhatsAppChat = ({ phoneNumber, propertyTitle, propertyId }: WhatsAppChatProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [position, setPosition] = useState<{ x: number | null; y: number | null }>({ x: null, y: null });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Message d'accueil automatique
      setMessages([
        {
          id: "welcome",
          text: `Bonjour! Bienvenue sur notre chat WhatsApp${propertyTitle ? ` pour ${propertyTitle}` : ""}. Comment puis-je vous aider?`,
          sender: "assistant",
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, messages.length, propertyTitle]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInputMessage("");

    // Simuler une réponse automatique
    setTimeout(() => {
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Merci pour votre message! Pour continuer la conversation, cliquez sur 'Ouvrir WhatsApp' ci-dessous pour discuter directement avec le propriétaire.",
        sender: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, responseMessage]);
    }, 1000);
  };

  const openWhatsApp = () => {
    const cleanPhone = phoneNumber.replace(/\s/g, "");
    let defaultMessage = `Bonjour, je suis intéressé(e) par votre bien`;
    
    if (propertyTitle) {
      defaultMessage += `: ${propertyTitle}`;
    }
    
    if (propertyId) {
      defaultMessage += ` (Réf: ${propertyId})`;
    }

    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(defaultMessage)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  useEffect(() => {
    if (isDragging) {
      const handleMove = (e: MouseEvent | TouchEvent) => {
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        
        setPosition({
          x: clientX - dragStart.x,
          y: clientY - dragStart.y,
        });
      };

      const handleUp = () => {
        setIsDragging(false);
      };

      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleUp);
      document.addEventListener('touchmove', handleMove);
      document.addEventListener('touchend', handleUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleUp);
        document.removeEventListener('touchmove', handleMove);
        document.removeEventListener('touchend', handleUp);
      };
    }
  }, [isDragging, dragStart]);

  return (
    <>
      {/* Bouton flottant WhatsApp - Repositionné à gauche au milieu avec animations */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed left-4 sm:left-6 top-1/2 -translate-y-1/2 h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-[#25D366] hover:bg-[#20BA5A] shadow-2xl z-50 p-0 group transition-all duration-500 hover:scale-125 animate-pulse-glow"
          style={{
            animation: "pulse-glow 2s ease-in-out infinite, float 3s ease-in-out infinite"
          }}
          aria-label="Ouvrir le chat WhatsApp"
        >
          <MessageCircle className="h-7 w-7 sm:h-8 sm:w-8 text-white transition-transform duration-300 group-hover:rotate-12" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-accent rounded-full animate-ping"></span>
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-accent rounded-full"></span>
        </Button>
      )}

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(-50%) translateX(0);
          }
          50% {
            transform: translateY(-50%) translateX(8px);
          }
        }
      `}</style>

      {/* Fenêtre de chat - Repositionnée à gauche */}
      {isOpen && (
        <Card 
          ref={chatRef}
          onMouseDown={handleMouseDown}
          onTouchStart={(e) => {
            const touch = e.touches[0];
            if ((e.target as HTMLElement).closest('.drag-handle')) {
              setIsDragging(true);
              setDragStart({
                x: touch.clientX - (position.x || 0),
                y: touch.clientY - (position.y || 0),
              });
            }
          }}
          className="fixed w-[calc(100vw-2rem)] sm:w-96 h-[500px] sm:h-[600px] z-50 shadow-2xl border-2 border-[#25D366]/30 flex flex-col animate-scale-in"
          style={{
            left: position.x === null ? '50%' : `${position.x}px`,
            top: position.y === null ? '50%' : `${position.y}px`,
            transform: position.x === null && position.y === null ? 'translate(-50%, -50%)' : 'none',
            cursor: isDragging ? 'grabbing' : 'default',
          }}
        >
          <CardHeader className="drag-handle bg-gradient-to-r from-[#075E54] to-[#128C7E] text-white rounded-t-xl p-3 sm:p-4 flex-row items-center justify-between space-y-0 cursor-grab active:cursor-grabbing">
            <div className="flex items-center gap-2 sm:gap-3">
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border-2 border-white bg-white/20 animate-pulse">
                <AvatarFallback className="bg-[#128C7E] text-white">
                  <User className="h-4 w-4 sm:h-5 sm:w-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-sm sm:text-base font-semibold">Chat WhatsApp</CardTitle>
                <p className="text-xs opacity-90 flex items-center gap-1">
                  <span className="inline-block h-2 w-2 bg-green-400 rounded-full animate-pulse"></span>
                  En ligne
                </p>
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
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === "user" ? "justify-end" : "justify-start"
                    } animate-fade-in-up`}
                  >
                    <div
                      className={`max-w-[80%] sm:max-w-[85%] rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 ${
                        message.sender === "user"
                          ? "bg-[#DCF8C6] text-gray-900"
                          : "bg-white border border-border text-gray-900"
                      }`}
                    >
                      <p className="text-xs sm:text-sm leading-relaxed break-words">{message.text}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                        {message.timestamp.toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t border-border p-2 sm:p-3 space-y-2">
              <Button
                onClick={openWhatsApp}
                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white text-xs sm:text-sm py-2 sm:py-2.5 rounded-xl"
              >
                <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                Ouvrir WhatsApp
              </Button>
              
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Écrivez votre message..."
                  className="flex-1 text-xs sm:text-sm rounded-xl"
                />
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl h-9 w-9 sm:h-10 sm:w-10 shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default WhatsAppChat;

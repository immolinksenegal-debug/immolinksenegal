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
  const scrollAreaRef = useRef<HTMLDivElement>(null);

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

  return (
    <>
      {/* Bouton flottant WhatsApp */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-[#25D366] hover:bg-[#128C7E] shadow-glow-secondary z-50 p-0 hover-scale"
          aria-label="Ouvrir le chat WhatsApp"
        >
          <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
        </Button>
      )}

      {/* Fenêtre de chat */}
      {isOpen && (
        <Card className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 h-[500px] sm:h-[600px] z-50 shadow-elegant flex flex-col animate-scale-in">
          <CardHeader className="bg-[#25D366] text-white rounded-t-xl p-3 sm:p-4 flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border-2 border-white">
                <AvatarFallback className="bg-[#128C7E] text-white">
                  <User className="h-4 w-4 sm:h-5 sm:w-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-sm sm:text-base font-semibold">Chat WhatsApp</CardTitle>
                <p className="text-xs opacity-90">En ligne</p>
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="h-7 w-7 sm:h-8 sm:w-8 text-white hover:bg-white/20 rounded-full"
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

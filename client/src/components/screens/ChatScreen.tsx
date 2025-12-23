import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface ChatScreenProps {
  onBack: () => void;
  currentUserId: string;
  otherUserId: string;
  otherUserName: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  read: string;
  createdAt: string;
}

export default function ChatScreen({ onBack, currentUserId, otherUserId, otherUserName }: ChatScreenProps) {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initials = otherUserName.split(' ').map(n => n[0]).join('');

  const { data: messages = [], refetch } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat/messages", currentUserId, otherUserId],
    refetchInterval: 3000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await apiRequest("POST", "/api/chat/messages", {
        senderId: currentUserId,
        receiverId: otherUserId,
        message,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages", currentUserId, otherUserId] });
      setNewMessage("");
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async () => {
      // Mark messages FROM other user TO current user as read
      await apiRequest("POST", `/api/chat/read/${otherUserId}/${currentUserId}`, {});
    },
  });

  useEffect(() => {
    markAsReadMutation.mutate();
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    sendMessageMutation.mutate(newMessage.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const groupMessagesByDate = (msgs: ChatMessage[]) => {
    const groups: { date: string; messages: ChatMessage[] }[] = [];
    let currentDate = "";

    msgs.forEach((msg) => {
      const msgDate = formatDate(msg.createdAt);
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ date: msgDate, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    });

    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="h-full flex flex-col animate-fadeIn" data-testid="screen-chat">
      <div className="flex items-center gap-3 p-4 border-b border-theme-accent/20 bg-theme-card/30">
        <Button
          size="icon"
          variant="ghost"
          onClick={onBack}
          className="text-theme-accent"
          data-testid="button-chat-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="w-10 h-10 rounded-full border-2 border-theme-highlight bg-theme-surface flex items-center justify-center font-display text-lg text-theme-highlight">
          {initials}
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-theme-highlight" data-testid="text-chat-name">
            {otherUserName}
          </h2>
          <p className="text-xs text-theme-text-muted">Connected</p>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messageGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full border-2 border-theme-accent/30 bg-theme-surface mb-4 flex items-center justify-center font-display text-2xl text-theme-accent">
              {initials}
            </div>
            <p className="text-theme-text-muted">Start a conversation with {otherUserName}</p>
          </div>
        ) : (
          messageGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              <div className="flex justify-center mb-3">
                <span className="text-xs text-theme-text-muted bg-theme-surface/50 px-3 py-1 rounded-full">
                  {group.date}
                </span>
              </div>
              <div className="space-y-2">
                {group.messages.map((msg) => {
                  const isOwn = msg.senderId === currentUserId;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                      data-testid={`chat-message-${msg.id}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                          isOwn
                            ? "bg-theme-accent text-theme-surface rounded-br-sm"
                            : "bg-theme-card border border-theme-accent/20 text-theme-text rounded-bl-sm"
                        }`}
                      >
                        <p className="text-sm break-words">{msg.message}</p>
                        <p
                          className={`text-[10px] mt-1 ${
                            isOwn ? "text-theme-surface/70" : "text-theme-text-muted"
                          }`}
                        >
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-theme-accent/20 bg-theme-card/30">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-grow bg-theme-surface border-theme-accent/30 text-theme-text"
            data-testid="input-chat-message"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!newMessage.trim() || sendMessageMutation.isPending}
            className="bg-theme-accent text-theme-surface border-theme-accent"
            data-testid="button-send-message"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

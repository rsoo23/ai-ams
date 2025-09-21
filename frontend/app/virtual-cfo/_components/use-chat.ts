import { useState, useRef, useCallback } from "react";
import { Message } from "./message-bubble";

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const messageIdCounter = useRef(0);

  const addMessage = useCallback((content: string, role: "user" | "assistant", options?: { isError?: boolean; isStreaming?: boolean }) => {
    messageIdCounter.current += 1;
    const newMessage: Message = {
      id: `msg-${messageIdCounter.current}`,
      content,
      role,
      timestamp: new Date(),
      isError: options?.isError || false,
      isStreaming: options?.isStreaming || false,
    };
    
    setMessages(prev => [...prev, newMessage]);
    return newMessage.id;
  }, []);

  const updateMessage = useCallback((id: string, updates: Partial<Message>) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === id ? { ...msg, ...updates } : msg
      )
    );
  }, []);

  const completeStreaming = useCallback((messageId: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId ? { ...msg, isStreaming: false } : msg
      )
    );
  }, []);

  return {
    messages,
    addMessage,
    updateMessage,
    completeStreaming,
  };
}
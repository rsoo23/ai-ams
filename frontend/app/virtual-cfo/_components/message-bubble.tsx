import { Bot, User, AlertCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StreamingText } from "./streaming-text";

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  isError?: boolean;
  isStreaming?: boolean;
}

interface MessageBubbleProps {
  message: Message;
  onStreamingComplete: (messageId: string) => void;
}

export function MessageBubble({ message, onStreamingComplete }: MessageBubbleProps) {
  return (
    <div
      className={`flex gap-3 ${
        message.role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      {message.role === "assistant" && (
        <Avatar className={`h-8 w-8 ${message.isError ? "bg-red-100 border border-red-200" : ""}`}>
          <AvatarFallback className={message.isError ? "bg-red-100 text-red-600" : ""}>
            {message.isError ? <AlertCircle className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div
        className={`max-w-[70%] rounded-lg px-3 py-2 ${
          message.role === "user"
            ? "bg-primary text-primary-foreground ml-12"
            : message.isError
            ? "bg-red-100 border border-red-200 text-red-800 mr-12"
            : "bg-muted mr-12"
        }`}
      >
        <div className="text-sm">
          {message.role === "assistant" && message.isStreaming ? (
            <StreamingText 
              text={message.content} 
              onComplete={() => onStreamingComplete(message.id)}
            />
          ) : (
            message.content
          )}
        </div>
        <p className={`text-xs mt-1 opacity-70 ${
          message.isError ? "text-red-600" : ""
        }`}>
          {message.timestamp.toLocaleTimeString()}
        </p>
      </div>

      {message.role === "user" && (
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
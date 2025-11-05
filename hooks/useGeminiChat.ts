import { useState, useCallback } from 'react';
import { geminiService, NutritionAnalysis } from '@/lib/gemini';
import { createLogger } from '@/lib/logger';

const logger = createLogger('useGeminiChat');

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  analysis?: NutritionAnalysis;
}

export const useGeminiChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim()) return;

    setLoading(true);
    setError(null);

    // Add user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);

    try {
      // Get AI response
      const analysis = await geminiService.analyzeNutrition(userMessage);

      // Add assistant message
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: analysis.summary,
        timestamp: new Date(),
        analysis,
      };

      setMessages(prev => [...prev, assistantMsg]);
      
      return assistantMsg;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao processar mensagem';
      setError(errorMessage);

      // Add error message as assistant response
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ ${errorMessage}`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const getLastAssistantMessage = useCallback((): ChatMessage | undefined => {
    return messages
      .filter(msg => msg.role === 'assistant')
      .pop();
  }, [messages]);

  return {
    messages,
    loading,
    error,
    sendMessage,
    clearChat,
    getLastAssistantMessage,
    isConfigured: geminiService.isConfigured(),
  };
};


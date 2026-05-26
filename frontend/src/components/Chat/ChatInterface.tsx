import React, { useState, useEffect, useRef } from 'react';
import { Send, Zap, Loader2, ChevronRight } from 'lucide-react';
import MessageBubble from './MessageBubble';
import { sendMessage, generateXDM, askCopilot } from '../../api/client';
import type { Message, Session, XDMOutput } from '../../types';

interface ChatInterfaceProps {
  session: Session;
  onSessionUpdate: (session: Session) => void;
  onXDMGenerated: (output: XDMOutput) => void;
}

const COPILOT_QUESTIONS = [
  "What fields am I missing?",
  "What identities should I use?",
  "Should loyalty be profile enabled?",
  "Can this support personalization?",
];

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: "Hello! I'm your Adobe XDM Design Consultant. I'll help you design the perfect data schema for Adobe Experience Platform based on your business needs.\n\nLet's start with the basics — could you tell me your company name and what kind of business you run? For example: \"We're a fashion retailer that sells online and in physical stores.\""
};

export default function ChatInterface({ session, onSessionUpdate, onXDMGenerated }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendMessage(session.id, userMsg.content);
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message
      };
      setMessages(prev => [...prev, assistantMsg]);
      onSessionUpdate({
        ...session,
        status: response.session_status as Session['status'],
        business_context: response.business_context
      });
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I apologize, I encountered an error. Please try again."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateXDM = async () => {
    setIsGenerating(true);
    try {
      const output = await generateXDM(session.id);
      onXDMGenerated(output);
      onSessionUpdate({ ...session, status: 'complete' });
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Your XDM schema design is ready! I've generated ${output.xdm_design.totalSchemas} schemas with a quality score of ${output.quality_score.overall}/100. Review the output panel on the right to explore your schemas, relationships, and JSON export.\n\nFeel free to ask me any questions about the design!`
        }
      ]);
    } catch (err) {
      console.error('Failed to generate XDM', err);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: "I encountered an error generating the XDM design. Please try again."
        }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopilot = async (question: string) => {
    setIsLoading(true);
    try {
      const result = await askCopilot(session.id, question);
      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), role: 'user', content: question },
        { id: (Date.now() + 1).toString(), role: 'assistant', content: result.answer }
      ]);
    } catch (err) {
      console.error('Copilot error', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isComplete = session.status === 'complete';
  const isReady = session.status === 'ready';

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="px-4 py-3 border-b border-gray-100 bg-white flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          <span className="text-sm font-medium text-gray-700">AI Consultant</span>
          <span className="text-xs text-gray-400 ml-auto">Retail Industry</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-adobe-navy flex items-center justify-center flex-shrink-0">
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            </div>
            <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1 items-center h-5">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Generate XDM button / Co-Pilot chips */}
      {(isReady || isComplete) && (
        <div className="px-4 py-2 bg-orange-50 border-t border-orange-100 flex-shrink-0">
          {!isComplete ? (
            <button
              onClick={handleGenerateXDM}
              disabled={isGenerating}
              className="w-full bg-adobe-red hover:bg-red-700 text-white py-2.5 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              {isGenerating ? 'Generating XDM Schemas...' : 'Generate XDM Design'}
            </button>
          ) : (
            <div>
              <p className="text-xs text-gray-500 mb-2 font-medium">AI Co-Pilot</p>
              <div className="flex flex-wrap gap-2">
                {COPILOT_QUESTIONS.map(q => (
                  <button
                    key={q}
                    onClick={() => handleCopilot(q)}
                    disabled={isLoading}
                    className="text-xs bg-white border border-gray-200 hover:border-adobe-blue hover:text-adobe-blue text-gray-600 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 disabled:opacity-50"
                  >
                    <ChevronRight className="w-3 h-3" />
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input area */}
      <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your business..."
            rows={2}
            className="flex-1 resize-none border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-adobe-blue transition-colors"
            disabled={isLoading || isGenerating}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading || isGenerating}
            className="bg-adobe-navy hover:bg-adobe-dark text-white p-2.5 rounded-xl transition-all disabled:opacity-40 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1.5">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}

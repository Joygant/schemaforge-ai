import React, { useState } from 'react';
import Header from './components/Layout/Header';
import ChatInterface from './components/Chat/ChatInterface';
import OutputPanel from './components/Output/OutputPanel';
import { createSession } from './api/client';
import type { Session, XDMOutput } from './types';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [xdmOutput, setXdmOutput] = useState<XDMOutput | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const handleStart = async () => {
    setIsStarting(true);
    try {
      const newSession = await createSession();
      setSession(newSession);
    } catch (err) {
      console.error('Failed to create session', err);
    } finally {
      setIsStarting(false);
    }
  };

  const handleXDMGenerated = (output: XDMOutput) => {
    setXdmOutput(output);
  };

  const handleNewSession = () => {
    setSession(null);
    setXdmOutput(null);
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-adobe-navy to-adobe-dark flex flex-col">
        <Header onNewSession={null} />
        <div className="flex-1 flex items-center justify-center px-8">
          <div className="max-w-2xl text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-adobe-red/20 rounded-full p-4">
                <Sparkles className="w-12 h-12 text-adobe-red" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Conversational XDM Designer
            </h1>
            <p className="text-xl text-gray-300 mb-3">
              for Adobe Experience Platform
            </p>
            <p className="text-gray-400 mb-10 text-lg leading-relaxed">
              Describe your business in plain language. Our AI consultant will design your
              complete XDM schema architecture — no technical knowledge required.
            </p>
            <div className="grid grid-cols-3 gap-4 mb-10">
              {[
                { label: 'Discovery Chat', desc: 'AI-guided business interview' },
                { label: 'XDM Design', desc: 'Auto-generated schemas' },
                { label: 'JSON Export', desc: 'Deployment-ready output' },
              ].map((item) => (
                <div key={item.label} className="bg-white/10 rounded-xl p-4 text-left">
                  <div className="text-white font-semibold mb-1">{item.label}</div>
                  <div className="text-gray-400 text-sm">{item.desc}</div>
                </div>
              ))}
            </div>
            <button
              onClick={handleStart}
              disabled={isStarting}
              className="bg-adobe-red hover:bg-red-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all flex items-center gap-3 mx-auto disabled:opacity-50"
            >
              {isStarting ? 'Starting...' : 'Start Discovery Session'}
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-gray-500 text-sm mt-6">
              Retail industry · Powered by Claude AI
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header onNewSession={handleNewSession} sessionStatus={session.status} />
      <div className="flex-1 flex overflow-hidden">
        <div className="w-2/5 border-r border-gray-200 flex flex-col bg-white">
          <ChatInterface
            session={session}
            onSessionUpdate={setSession}
            onXDMGenerated={handleXDMGenerated}
          />
        </div>
        <div className="w-3/5 flex flex-col overflow-hidden">
          <OutputPanel xdmOutput={xdmOutput} session={session} />
        </div>
      </div>
    </div>
  );
}

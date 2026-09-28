import React, { useState, useRef, useEffect } from 'react';
import { useProjects } from '../context/ProjectContext';
import type { AssistantQueryResponse } from '../services/apiService';
import { ApiService } from '../services/apiService';
import type { Project } from '../types/paimana';
import { Bot, Send, User, ExternalLink, ShieldCheck } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  matchedProjects?: Project[];
  isGrounded?: boolean;
  timestamp: string;
}

export const AssistantPage: React.FC = () => {
  const { selectedProject, openProjectDetails } = useProjects();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: "Hello! I am the **InfraGuard AI Project Intelligence Assistant**. I answer questions strictly grounded in the official **April 2026 PAIMANA Flash Report** dataset and calculated risk indicators.\n\nTry clicking one of the suggested sample questions below, or type your own query regarding central infrastructure projects.",
      isGrounded: true,
      timestamp: 'Just now',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageCounterRef = useRef<number>(1);

  const sampleQuestions = [
    "How many projects are in Gujarat?",
    "Show high-risk projects.",
    "Which projects have revised completion dates?",
    "Which projects have the highest cost change?",
    "Show projects with physical progress below 25%.",
    "Why was this project flagged?",
    "Show projects with missing data.",
    "Compare this project with projects in the same sector.",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (queryText?: string) => {
    const q = (queryText || inputValue).trim();
    if (!q) return;

    const nextId = messageCounterRef.current++;
    const userMsg: ChatMessage = {
      id: `user-${nextId}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInputValue('');
    setIsLoading(true);

    try {
      const response: AssistantQueryResponse = await ApiService.queryAssistant({
        query: q,
        selectedProjectCode: selectedProject?.projectCode,
      });

      const nextAssistId = messageCounterRef.current++;
      const assistantMsg: ChatMessage = {
        id: `assist-${nextAssistId}`,
        sender: 'assistant',
        text: response.answer,
        matchedProjects: response.matchedProjects,
        isGrounded: response.isGroundedInReport,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `assist-${Date.now()}`,
          sender: 'assistant',
          text: "An error occurred while evaluating the query against the loaded PAIMANA dataset.",
          isGrounded: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Project Intelligence Assistant
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Deterministic, Zero-Hallucination Assistant operating strictly on PAIMANA April 2026 data.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Grounded in Official Report Data</span>
        </div>
      </div>

      {/* Suggested Prompt Chips */}
      <div>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
          Demonstration Prompts (Click to Execute):
        </span>
        <div className="flex flex-wrap gap-2">
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-xs bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 px-3 py-1.5 rounded-lg shadow-2xs transition-colors cursor-pointer text-left"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Display Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs h-[500px] flex flex-col overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-xs'
                    : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-tl-xs shadow-2xs'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>

                {/* Embedded Project Cards for relevant answers */}
                {msg.matchedProjects && msg.matchedProjects.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Associated Projects in Report:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.matchedProjects.slice(0, 4).map(p => (
                        <div
                          key={p.projectCode}
                          className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between gap-2"
                        >
                          <div className="truncate">
                            <span className="font-bold text-slate-900 block truncate text-[11px]">
                              {p.projectName}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">
                              {p.agency} • ₹{p.revisedCost.toLocaleString('en-IN')} Cr
                            </span>
                          </div>
                          <button
                            onClick={() => openProjectDetails(p)}
                            className="p-1 text-blue-600 hover:text-blue-800 cursor-pointer shrink-0"
                            title="Open Project Details"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div
                  className={`mt-2 flex items-center justify-between text-[10px] ${
                    msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {msg.sender === 'assistant' && msg.isGrounded && (
                    <span className="font-mono text-emerald-600">● Grounded in PAIMANA Flash Report</span>
                  )}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-slate-700 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                <span>Evaluating PAIMANA report metrics...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-50 border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask a question about PAIMANA projects, costs, progress, schedule shifts, or risk flags..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Ask</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>Query engine strictly constrained to official PAIMANA April 2026 data.</span>
            <span>SIH26103 Prototype</span>
          </div>
        </div>
      </div>
    </div>
  );
};

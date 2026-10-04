import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Menu, MessageSquare, Phone, AlertCircle, X } from 'lucide-react';
import { NavjeevanLogo } from '@/components/assistant/NavjeevanLogo';
import { AssistantSidebar } from '@/components/assistant/AssistantSidebar';
import { ChatPanel } from '@/components/assistant/ChatPanel';
import { ChatComposer } from '@/components/assistant/ChatComposer';
import { VoiceCall } from '@/components/assistant/VoiceCall';
import { useAssistantChat } from '@/hooks/useAssistantChat';

type Mode = 'chat' | 'voice';

// Mounted at "/assistant" by the top-level App router — a dedicated,
// full-screen AI assistant page with persisted conversation history,
// separate from the floating VoiceChatBot widget shown on the public site.
export default function AssistantApp() {
  const {
    conversations,
    activeId,
    messages,
    status,
    loadingHistory,
    error,
    send,
    newConversation,
    removeConversation,
    selectConversation,
    clearError,
  } = useAssistantChat();

  const [mode, setMode] = useState<Mode>('chat');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSend = useCallback(
    (text: string) => {
      void send(text);
    },
    [send]
  );

  const thinking = status.kind === 'thinking';

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900">
      <AssistantSidebar
        conversations={conversations}
        activeId={activeId}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelect={(id) => {
          selectConversation(id);
          setSidebarOpen(false);
        }}
        onNew={() => {
          void newConversation();
          setSidebarOpen(false);
        }}
        onDelete={(id) => void removeConversation(id)}
      />

      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="z-20 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Open conversations"
            >
              <Menu size={20} />
            </button>
            <Link
              to="/"
              className="hidden items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 sm:flex"
              title="Back to Navjeevan Clinic"
            >
              <ArrowLeft size={16} />
            </Link>
            <div className="flex items-center gap-2.5">
              <NavjeevanLogo size={40} className="flex-shrink-0" />
              <div className="leading-tight">
                <h1 className="text-sm font-semibold text-slate-800 sm:text-base">
                  Navjeevan AI Health Assistant
                </h1>
                <p className="hidden text-xs text-slate-500 sm:block">
                  Women's health · Pregnancy · PCOS · Fertility
                </p>
              </div>
            </div>
          </div>

          {/* Mode toggle */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1">
            <button
              onClick={() => setMode('chat')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                mode === 'chat'
                  ? 'bg-white text-pink-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <MessageSquare size={16} />
              <span className="hidden sm:inline">Chat</span>
            </button>
            <button
              onClick={() => setMode('voice')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                mode === 'voice'
                  ? 'bg-white text-pink-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Phone size={16} />
              <span className="hidden sm:inline">Voice call</span>
            </button>
          </div>
        </header>

        {error && (
          <div className="flex items-center gap-2 border-b border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700 sm:px-6">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span className="flex-1">{error}</span>
            <button onClick={clearError} className="rounded p-0.5 hover:bg-rose-100">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Main area */}
        {mode === 'chat' ? (
          <main className="flex flex-1 flex-col overflow-hidden bg-slate-50">
            {loadingHistory ? (
              <div className="flex flex-1 items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-slate-400">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-pink-500" />
                  <span className="text-sm">Loading your conversations…</span>
                </div>
              </div>
            ) : (
              <ChatPanel
                messages={messages}
                status={thinking ? 'thinking' : 'idle'}
                onSuggestionClick={handleSend}
              />
            )}
            <ChatComposer onSend={handleSend} disabled={thinking} />
          </main>
        ) : (
          <main className="flex flex-1 flex-col overflow-hidden">
            <VoiceCall onSend={send} />
          </main>
        )}
      </div>
    </div>
  );
}

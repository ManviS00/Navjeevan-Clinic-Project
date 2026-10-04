import { useEffect, useMemo, useRef, useState } from 'react';
import {
  type Conversation,
  addMessage,
  createConversation,
  deleteConversation as deleteConv,
  getSessionId,
  loadConversations,
  loadMessages,
  touchConversation,
} from '@/lib/assistant/chatStore';

async function callAI(
  history: { role: 'user' | 'assistant'; content: string }[]
): Promise<string> {
  const base = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000/api';
  const res = await fetch(`${base}/assistant/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: history, mode: 'text' }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || `AI error ${res.status}`);
  return data.text as string;
}

export function useAssistantChat() {
  const sessionId = useMemo(() => getSessionId(), []);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ConversationStatus>({ kind: 'idle' });
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const activeIdRef = useRef<string | null>(null);
  activeIdRef.current = activeId;
  const messagesRef = useRef<ChatMessage[]>([]);
  messagesRef.current = messages;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const convs = await loadConversations(sessionId);
        if (cancelled) return;
        setConversations(convs);
        if (convs.length > 0) {
          setActiveId(convs[0].id);
        }
      } catch {
        if (!cancelled) setError('Could not load your conversations.');
      } finally {
        if (!cancelled) setLoadingHistory(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  // Load messages whenever active conversation changes.
  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const stored = await loadMessages(activeId);
        if (cancelled) return;
        setMessages(
          stored.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            matchedEntryId: m.matched_entry_id,
            createdAt: new Date(m.created_at).getTime(),
          }))
        );
      } catch {
        if (!cancelled) setError('Could not load messages for this conversation.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeId]);

  async function ensureConversation(firstMessage: string): Promise<string> {
    if (activeIdRef.current) return activeIdRef.current;
    const title = firstMessage.length > 40 ? firstMessage.slice(0, 40) + '…' : firstMessage;
    const conv = await createConversation(sessionId, title);
    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
    return conv.id;
  }

  async function send(text: string): Promise<ChatMessage | null> {
    const clean = text.trim();
    if (!clean) return null;
    setError(null);

    const userMsg: ChatMessage = {
      id: `tmp-${Date.now()}-u`,
      role: 'user',
      content: clean,
      matchedEntryId: null,
      createdAt: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setStatus({ kind: 'thinking' });

    const history = [
      ...messagesRef.current.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content: clean },
    ];

    let replyText: string;
    try {
      replyText = await callAI(history);
    } catch {
      setError('Something went wrong reaching the AI assistant. Please try again.');
      setStatus({ kind: 'idle' });
      return null;
    }

    const convId = await ensureConversation(clean).catch((e) => {
      setError('Could not save your conversation.');
      throw e;
    });

    try {
      await addMessage(convId, 'user', clean, null);
    } catch {
      // persistence failure shouldn't block the reply
    }

    const assistantMsg: ChatMessage = {
      id: `tmp-${Date.now()}-a`,
      role: 'assistant',
      content: replyText,
      matchedEntryId: null,
      createdAt: Date.now(),
    };
    setMessages((prev) => [...prev, assistantMsg]);
    setStatus({ kind: 'idle' });

    try {
      const stored = await addMessage(convId, 'assistant', replyText, null);
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantMsg.id ? { ...m, id: stored.id } : m))
      );
      void touchConversation(convId);
    } catch {
      // non-fatal
    }

    return assistantMsg;
  }

  async function newConversation(): Promise<void> {
    setActiveId(null);
    setMessages([]);
    setStatus({ kind: 'idle' });
  }

  async function removeConversation(id: string): Promise<void> {
    try {
      await deleteConv(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeIdRef.current === id) {
        setActiveId(null);
        setMessages([]);
      }
    } catch {
      setError('Could not delete the conversation.');
    }
  }

  function clearError() {
    setError(null);
  }

  return {
    conversations,
    activeId,
    messages,
    status,
    loadingHistory,
    error,
    setStatus,
    send,
    newConversation,
    removeConversation,
    selectConversation: setActiveId,
    clearError,
  };
}

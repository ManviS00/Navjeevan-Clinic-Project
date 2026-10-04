import { backendRequest } from '@/lib/backendApi';

export interface StoredMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  matched_entry_id: string | null;
  created_at: string;
}
export interface Conversation {
  id: string;
  session_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}
const SESSION_KEY = 'navjeevan_session_id';

export function getSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}
export async function loadConversations(sessionId: string) {
  const r = await backendRequest<any>(`/assistant/conversations?sessionId=${encodeURIComponent(sessionId)}`);
  return (r.data ?? []) as Conversation[];
}
export async function loadMessages(conversationId: string) {
  const r = await backendRequest<any>(`/assistant/conversations/${conversationId}/messages`);
  return (r.data ?? []) as StoredMessage[];
}
export async function createConversation(sessionId: string, title: string) {
  const r = await backendRequest<any>('/assistant/conversations', { method:'POST', body:JSON.stringify({sessionId,title}) });
  return r.data as Conversation;
}
export async function addMessage(conversationId: string, role: 'user'|'assistant', content: string, matchedEntryId: string|null) {
  const r = await backendRequest<any>(`/assistant/conversations/${conversationId}/messages`, { method:'POST', body:JSON.stringify({role,content,matchedEntryId}) });
  return r.data as StoredMessage;
}
export async function touchConversation(conversationId: string) {
  await backendRequest(`/assistant/conversations/${conversationId}`, { method:'PATCH', body:JSON.stringify({}) });
}
export async function deleteConversation(conversationId: string) {
  await backendRequest(`/assistant/conversations/${conversationId}`, { method:'DELETE' });
}

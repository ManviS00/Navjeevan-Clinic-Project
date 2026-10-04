import { MessageSquare, Plus, Trash2, X } from 'lucide-react';
import { NavjeevanLogo } from '@/components/assistant/NavjeevanLogo';
import type { Conversation } from '@/lib/assistant/chatStore';

interface AssistantSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  open: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}

function formatRelative(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = (now.getTime() - d.getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString([], { day: 'numeric', month: 'short' });
}

export function AssistantSidebar({
  conversations,
  activeId,
  open,
  onClose,
  onSelect,
  onNew,
  onDelete,
}: AssistantSidebarProps) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed left-0 top-0 z-40 flex h-full w-72 flex-col border-r border-slate-200 bg-white transition-transform lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
          <div className="flex items-center gap-2.5">
            <NavjeevanLogo size={36} className="flex-shrink-0" />
            <span className="font-semibold text-slate-800">Navjeevan</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-3 pt-3">
          <button
            onClick={onNew}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-pink-300 hover:bg-pink-50 active:scale-[0.98]"
          >
            <Plus size={16} />
            New conversation
          </button>
        </div>

        <div className="mt-4 flex-1 overflow-y-auto px-2">
          <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Recent
          </p>
          {conversations.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-slate-400">
              No conversations yet.
            </p>
          ) : (
            <ul className="flex flex-col gap-1">
              {conversations.map((c) => (
                <li key={c.id}>
                  <div
                    className={`group flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm transition ${
                      c.id === activeId
                        ? 'bg-pink-50 text-pink-800'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                    onClick={() => onSelect(c.id)}
                  >
                    <MessageSquare
                      size={15}
                      className={c.id === activeId ? 'text-pink-500' : 'text-slate-400'}
                    />
                    <span className="flex-1 truncate">{c.title || 'Conversation'}</span>
                    <span className="hidden text-[10px] text-slate-400 group-hover:hidden sm:block">
                      {formatRelative(c.updated_at)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(c.id);
                      }}
                      className="rounded p-1 text-slate-400 opacity-0 transition hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100"
                      aria-label="Delete conversation"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-slate-100 px-4 py-3">
          <p className="text-[11px] leading-relaxed text-slate-400">
            For medical emergencies, call <span className="font-semibold text-rose-600">7428926418</span> immediately.
          </p>
        </div>
      </aside>
    </>
  );
}

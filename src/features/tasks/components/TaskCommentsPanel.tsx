'use client';

import { useState } from 'react';
import { Loader2, MessageSquare, Send, Trash2 } from 'lucide-react';
import { useComments } from '@/hooks/useComments';
import { useAppSelector } from '@/store/hooks';
import { cn } from '@/utils/cn';

interface TaskCommentsPanelProps {
  taskId: string;
  taskTitle: string;
}

function formatCommentTime(value: string) {
  return new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function TaskCommentsPanel({
  taskId,
  taskTitle,
}: TaskCommentsPanelProps) {
  const {
    comments,
    isLoading,
    error,
    currentUserId,
    refetch,
    addComment,
    removeComment,
  } = useComments('TASK', taskId);
  const userRole = useAppSelector((state) => state.auth.user?.role);

  const [draft, setDraft] = useState('');
  const [actionError, setActionError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = draft.trim();
    if (!content) return;

    setActionError('');
    setIsSubmitting(true);

    try {
      await addComment(content);
      setDraft('');
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Failed to add comment.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    setActionError('');
    setDeletingId(commentId);

    try {
      await removeComment(commentId);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Failed to delete comment.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MessageSquare size={18} className="text-primary" />
          <div>
            <p className="text-sm font-black text-text-primary uppercase tracking-tight">
              Task Comments
            </p>
            <p className="text-xs text-text-secondary mt-0.5">{taskTitle}</p>
          </div>
        </div>
        <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-widest">
          {comments.length}
        </span>
      </div>

      {(error || actionError) && (
        <div className="rounded-sm bg-error/10 border border-error/20 px-4 py-3 text-sm font-medium text-error flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span>{error || actionError}</span>
          {error && (
            <button
              type="button"
              onClick={() => refetch()}
              className="text-xs font-bold uppercase tracking-widest hover:underline shrink-0"
            >
              Retry
            </button>
          )}
        </div>
      )}

      <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-text-secondary py-4">
            <Loader2 size={16} className="animate-spin" />
            Loading comments...
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => {
            const initials = comment.author.fullName
              .split(' ')
              .map((part) => part[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();

            const canDelete =
              currentUserId === comment.author.id || userRole === 'ADMIN';

            return (
              <div
                key={comment.id}
                className="flex items-start gap-3 p-4 rounded-sm bg-surface-variant/50 border border-border/50"
              >
                <div className="w-10 h-10 rounded-sm bg-primary/10 text-primary flex items-center justify-center font-black text-xs shrink-0">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-text-primary truncate">
                      {comment.author.fullName}
                    </p>
                    <span className="text-label font-bold text-muted shrink-0">
                      {formatCommentTime(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-2 whitespace-pre-wrap break-words">
                    {comment.content}
                  </p>
                </div>
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => handleDelete(comment.id)}
                    disabled={deletingId === comment.id}
                    className="p-2 rounded-sm text-text-secondary hover:text-error hover:bg-error/10 transition-all disabled:opacity-60 shrink-0"
                    title="Delete comment"
                  >
                    {deletingId === comment.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                )}
              </div>
            );
          })
        ) : (
          <div className="rounded-sm border border-dashed border-border px-4 py-6 text-center">
            <p className="text-sm font-bold text-text-secondary">
              No comments yet. Start the discussion below.
            </p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          placeholder="Write a comment for this task..."
          className="w-full px-4 py-3 bg-surface-variant rounded-sm outline-none focus:ring-2 focus:ring-primary/50 text-text-primary font-medium resize-none"
        />
        <button
          type="submit"
          disabled={isSubmitting || !draft.trim()}
          className={cn(
            'w-full py-3 rounded-sm bg-primary text-white font-bold uppercase tracking-widest text-xs',
            'shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-70',
            'flex items-center justify-center gap-2'
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Posting...
            </>
          ) : (
            <>
              <Send size={16} />
              Post Comment
            </>
          )}
        </button>
      </form>
    </div>
  );
}

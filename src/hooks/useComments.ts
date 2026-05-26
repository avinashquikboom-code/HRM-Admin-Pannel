'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import {
  createComment,
  deleteComment,
  fetchComments,
  type Comment,
} from '@/services/commentService';

export function useComments(entityType: string | null, entityId: string | null) {
  const token = useAppSelector((state) => state.auth.token);
  const userId = useAppSelector((state) => state.auth.user?.id);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadComments = useCallback(async () => {
    if (!token || !entityType || !entityId) {
      setComments([]);
      setError('');
      setIsLoading(false);
      return [];
    }

    setIsLoading(true);
    setError('');

    try {
      const data = await fetchComments(entityType, entityId);
      setComments(data);
      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load comments';
      setError(message);
      setComments([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [entityId, entityType, token]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const addComment = useCallback(
    async (content: string) => {
      if (!entityType || !entityId) {
        throw new Error('Select an item before commenting.');
      }

      const result = await createComment({ entityType, entityId, content });
      setComments((prev) => [...prev, result.comment]);
      return result;
    },
    [entityId, entityType]
  );

  const removeComment = useCallback(
    async (commentId: number) => {
      const result = await deleteComment(commentId);
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
      return result;
    },
    []
  );

  return {
    comments,
    isLoading,
    error,
    currentUserId: userId ? Number(userId) : null,
    refetch: loadComments,
    addComment,
    removeComment,
  };
}

import { api, getApiErrorMessage } from '@/lib/api';
import { isDevAuthSession } from '@/lib/devAuth';

export interface CommentAuthor {
  id: number;
  email: string;
  fullName: string;
  avatarUrl: string | null;
}

export interface Comment {
  id: number;
  entityType: string;
  entityId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: CommentAuthor;
}

interface CommentsResponse {
  count: number;
  comments: Comment[];
}

interface CreateCommentResponse {
  message: string;
  comment: Comment;
}

export interface CreateCommentRequest {
  entityType: string;
  entityId: string;
  content: string;
}

export async function fetchComments(
  entityType: string,
  entityId: string
): Promise<Comment[]> {
  try {
    const { data } = await api.get<CommentsResponse>('/api/admin/comments', {
      params: { entityType, entityId },
    });
    return data.comments;
  } catch (error) {
    if (isDevAuthSession()) {
      return [];
    }
    throw new Error(
      getApiErrorMessage(error, 'Failed to load comments. Please try again.')
    );
  }
}

export async function createComment(
  payload: CreateCommentRequest
): Promise<{ message: string; comment: Comment }> {
  try {
    const { data } = await api.post<CreateCommentResponse>(
      '/api/admin/comments',
      payload
    );

    return {
      message: data.message,
      comment: data.comment,
    };
  } catch (error) {
    if (isDevAuthSession()) {
      throw new Error('Comments are unavailable in offline demo mode.');
    }
    throw new Error(
      getApiErrorMessage(error, 'Failed to add comment. Please try again.')
    );
  }
}

export async function deleteComment(id: number): Promise<{ message: string }> {
  try {
    const { data } = await api.delete<{ message: string }>(
      `/api/admin/comments/${id}`
    );

    return { message: data.message };
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to delete comment. Please try again.')
    );
  }
}

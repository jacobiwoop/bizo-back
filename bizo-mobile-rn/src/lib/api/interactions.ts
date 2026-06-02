import { api } from "@/src/lib/api/client";
import { ApiResourceResponse, ListingResource, PaginatedApiResponse } from "@/src/lib/api/types";

export type FavoriteResource = {
  id: string;
  user_id: string;
  listing_id: string;
  listing_title: string;
  listing_photo: string | null;
  listing_price: number | null;
  listing_type: string;
  created_at: string;
  listing?: ListingResource | null;
};

export type ConversationResource = {
  id: string;
  listing_id: string;
  listing_owner_id?: string | null;
  current_user_role?: "seller" | "buyer" | null;
  listing_title: string | null;
  listing_photo: string | null;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
  other_user: {
    id: string;
    display_name: string;
    photo_url: string | null;
    last_seen_at: string | null;
  } | null;
  created_at: string;
};

export type MessageResource = {
  id: string;
  conv_id: string;
  sender_id: string;
  type: "text" | "image" | "troc_proposal";
  text: string | null;
  image_url: string | null;
  proposal: {
    offered_listing_id: string | null;
    offered_listing_title: string | null;
    offered_listing_photo: string | null;
    cash_amount: number | null;
    status: string | null;
    refusal_reason: string | null;
  } | null;
  is_read: boolean;
  created_at: string;
};

export async function getFavorites(): Promise<FavoriteResource[]> {
  const response = await api.get<PaginatedApiResponse<FavoriteResource>>("/favorites", {
    params: { per_page: 100 },
  });

  return response.data.data;
}

export async function getConversations(): Promise<ConversationResource[]> {
  const response = await api.get<PaginatedApiResponse<ConversationResource>>("/conversations", {
    params: { per_page: 50 },
  });

  return response.data.data;
}

export async function getConversation(id: string): Promise<ConversationResource> {
  const response = await api.get<ApiResourceResponse<ConversationResource>>(`/conversations/${id}`);
  return response.data.data;
}

export async function getConversationMessages(id: string): Promise<MessageResource[]> {
  const response = await api.get<PaginatedApiResponse<MessageResource>>(`/conversations/${id}/messages`, {
    params: { per_page: 100 },
  });

  return response.data.data;
}

export async function sendTextMessage(conversationId: string, text: string): Promise<MessageResource> {
  const response = await api.post<ApiResourceResponse<MessageResource>>(`/conversations/${conversationId}/messages`, {
    type: "text",
    text,
  });

  return response.data.data;
}

export async function markConversationRead(id: string): Promise<void> {
  await api.post(`/conversations/${id}/read`);
}

export async function addFavorite(listingId: string): Promise<FavoriteResource> {
  const response = await api.post<ApiResourceResponse<FavoriteResource>>(`/favorites/${listingId}`);
  return response.data.data;
}

export async function removeFavorite(listingId: string): Promise<void> {
  await api.delete(`/favorites/${listingId}`);
}

export async function createConversation(listingId: string, message: string): Promise<ConversationResource> {
  const response = await api.post<ApiResourceResponse<ConversationResource>>("/conversations", {
    listing_id: listingId,
    message,
  });

  return response.data.data;
}

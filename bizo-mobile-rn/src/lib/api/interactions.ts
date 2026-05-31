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

export async function getFavorites(): Promise<FavoriteResource[]> {
  const response = await api.get<PaginatedApiResponse<FavoriteResource>>("/favorites", {
    params: { per_page: 100 },
  });

  return response.data.data;
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

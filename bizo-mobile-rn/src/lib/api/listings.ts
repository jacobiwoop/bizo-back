import { api } from "@/src/lib/api/client";
import { ApiResourceResponse, ListingAttributes, ListingResource, ListingType, PaginatedApiResponse } from "@/src/lib/api/types";

export type ListingsQueryParams = {
  per_page?: number;
  category?: string;
  type?: "VENTE" | "TROC" | "TROC_CASH";
  condition?: string;
  country?: string;
  city?: string;
  min_price?: number;
  max_price?: number;
};

export type ListingPhotoUpload = {
  uri: string;
  name: string;
  type: string;
};

export type CreateListingPayload = {
  title: string;
  description: string;
  type: ListingType;
  price?: number | null;
  cash_complement?: number | null;
  exchange_for?: string | null;
  category: string;
  attributes?: ListingAttributes;
  condition: string;
  delivery_mode: string;
  country: string;
  city: string;
  neighborhood?: string | null;
  location_id?: string | null;
  place_id?: string | null;
  display_lat?: number | null;
  display_lng?: number | null;
  location_accuracy?: "exact" | "district" | "city" | null;
  tags?: string[];
  photos: ListingPhotoUpload[];
};

export async function getListings(params: ListingsQueryParams = {}): Promise<PaginatedApiResponse<ListingResource>> {
  const response = await api.get<PaginatedApiResponse<ListingResource>>("/listings", { params });
  return response.data;
}

export async function getListing(id: string): Promise<ListingResource> {
  const response = await api.get<ApiResourceResponse<ListingResource>>(`/listings/${id}`);
  return response.data.data;
}

export async function createListing(payload: CreateListingPayload): Promise<ListingResource> {
  const formData = new FormData();

  formData.append("title", payload.title);
  formData.append("description", payload.description);
  formData.append("type", payload.type);
  formData.append("category", payload.category);
  formData.append("condition", payload.condition);
  formData.append("delivery_mode", payload.delivery_mode);
  formData.append("country", payload.country);
  formData.append("city", payload.city);
  formData.append("attributes", JSON.stringify(payload.attributes ?? {}));

  if (payload.price !== undefined && payload.price !== null) {
    formData.append("price", String(payload.price));
  }

  if (payload.cash_complement !== undefined && payload.cash_complement !== null) {
    formData.append("cash_complement", String(payload.cash_complement));
  }

  if (payload.exchange_for) {
    formData.append("exchange_for", payload.exchange_for);
  }

  if (payload.neighborhood) {
    formData.append("neighborhood", payload.neighborhood);
  }

  if (payload.location_id) {
    formData.append("location_id", payload.location_id);
  }

  if (payload.place_id) {
    formData.append("place_id", payload.place_id);
  }

  if (payload.display_lat !== undefined && payload.display_lat !== null) {
    formData.append("display_lat", String(payload.display_lat));
  }

  if (payload.display_lng !== undefined && payload.display_lng !== null) {
    formData.append("display_lng", String(payload.display_lng));
  }

  if (payload.location_accuracy) {
    formData.append("location_accuracy", payload.location_accuracy);
  }

  payload.tags?.forEach((tag) => {
    formData.append("tags[]", tag);
  });

  payload.photos.forEach((photo) => {
    formData.append("photos[]", photo as unknown as Blob);
  });

  const response = await api.post<ApiResourceResponse<ListingResource>>("/listings", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.data;
}

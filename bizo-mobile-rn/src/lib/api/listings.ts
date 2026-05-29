import { api } from "@/src/lib/api/client";
import { ApiResourceResponse, ListingResource, PaginatedApiResponse } from "@/src/lib/api/types";

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

export async function getListings(params: ListingsQueryParams = {}): Promise<PaginatedApiResponse<ListingResource>> {
  const response = await api.get<PaginatedApiResponse<ListingResource>>("/listings", { params });
  return response.data;
}

export async function getListing(id: string): Promise<ListingResource> {
  const response = await api.get<ApiResourceResponse<ListingResource>>(`/listings/${id}`);
  return response.data.data;
}

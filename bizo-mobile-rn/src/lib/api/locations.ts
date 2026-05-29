import { api } from "@/src/lib/api/client";

export type LocationResource = {
  id: string;
  name: string;
  type: "country" | "city" | "district";
  parent_id: string | null;
  country_code: string;
  lat: number | null;
  lng: number | null;
  parent?: LocationResource | null;
};

export type PlaceResource = {
  id: string;
  name: string;
  category: string;
  location_id: string | null;
  country_code: string;
  lat: number | null;
  lng: number | null;
  location?: LocationResource | null;
};

export type LocationSearchResponse = {
  data: {
    locations: LocationResource[];
    places: PlaceResource[];
  };
};

export async function searchLocations(query: string): Promise<LocationSearchResponse["data"]> {
  const response = await api.get<LocationSearchResponse>("/locations/search", {
    params: {
      country: "BJ",
      enrich: 1,
      include_places: 1,
      limit: 8,
      q: query,
    },
  });

  return response.data.data;
}

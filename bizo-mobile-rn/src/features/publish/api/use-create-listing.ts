import { useMutation } from "@tanstack/react-query";

import { createListing, updateListing, type CreateListingPayload, type UpdateListingPayload } from "@/src/lib/api/listings";
import { queryClient } from "@/src/lib/query-client";

export function useCreateListingMutation() {
  return useMutation({
    mutationFn: (payload: CreateListingPayload) => createListing(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["home-listings"] }),
        queryClient.invalidateQueries({ queryKey: ["my-listings"] }),
      ]);
    },
  });
}

export function useUpdateListingMutation(id: string) {
  return useMutation({
    mutationFn: (payload: UpdateListingPayload) => updateListing(id, payload),
    onSuccess: async (listing) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["home-listings"] }),
        queryClient.invalidateQueries({ queryKey: ["my-listings"] }),
        queryClient.invalidateQueries({ queryKey: ["listing-detail", listing.id] }),
      ]);
    },
  });
}

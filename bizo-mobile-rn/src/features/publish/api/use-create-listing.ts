import { useMutation } from "@tanstack/react-query";

import { createListing, type CreateListingPayload } from "@/src/lib/api/listings";
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

import { router } from "expo-router";
import { useEffect } from "react";

import { useDiscoveryStore } from "@/src/store/discovery";

export default function SearchFilterRoute() {
  const setSearchContext = useDiscoveryStore((state) => state.setSearchContext);
  const openFilterSheet = useDiscoveryStore((state) => state.openFilterSheet);

  useEffect(() => {
    setSearchContext({ query: "iPhone 13", category: null });
    openFilterSheet();
    router.replace("/search");
  }, [openFilterSheet, setSearchContext]);

  return null;
}

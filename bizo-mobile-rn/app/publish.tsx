import { useLocalSearchParams } from "expo-router";

import { PublishFlowScreen } from "@/src/features/publish/screens/publish-flow-screen";

export default function PublishRoute() {
  const params = useLocalSearchParams<{ edit?: string }>();

  return <PublishFlowScreen editId={typeof params.edit === "string" ? params.edit : undefined} />;
}

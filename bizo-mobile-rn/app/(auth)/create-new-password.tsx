import { router } from "expo-router";
import { useEffect } from "react";

export default function CreateNewPasswordRoute() {
  useEffect(() => {
    router.replace("/(auth)/sign-in?modal=create-password");
  }, []);

  return null;
}

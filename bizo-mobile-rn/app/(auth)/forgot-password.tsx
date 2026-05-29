import { router } from "expo-router";
import { useEffect } from "react";

export default function ForgotPasswordRoute() {
  useEffect(() => {
    router.replace("/(auth)/sign-in?modal=forgot-password");
  }, []);

  return null;
}

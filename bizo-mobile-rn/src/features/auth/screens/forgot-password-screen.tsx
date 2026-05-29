import { router } from "expo-router";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { useForgotPasswordMutation } from "@/src/features/auth/api/use-auth-mutations";
import {
  AuthBackdropPreview,
  AuthInput,
  BottomSheetModal,
  BottomSheetCard,
  PrimaryButton,
  AuthNoticeToast,
} from "@/src/features/auth/components/auth-ui";
import { normalizeApiError } from "@/src/lib/api/errors";

export function ForgotPasswordScreen() {
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const forgotPasswordMutation = useForgotPasswordMutation();

  const handleSubmit = () => {
    setMessage(null);
    forgotPasswordMutation.mutate(
      { email: contact.trim() },
      {
        onError: (error) => setMessage(normalizeApiError(error).message),
        onSuccess: (data) =>
          router.push({
            pathname: "/(auth)/verification",
            params: { email: contact.trim(), mode: "reset", notice: data.message },
          }),
      },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#D7D7D7]" edges={["top"]}>
      <AuthNoticeToast message={message} onClose={() => setMessage(null)} tone="error" />
      <BottomSheetModal backdrop={<AuthBackdropPreview />} onClose={() => router.back()}>
        <BottomSheetCard
          title="Forgot Password"
          subtitle="Enter your email"
          footer={
            <PrimaryButton
              disabled={forgotPasswordMutation.isPending}
              label={forgotPasswordMutation.isPending ? "Sending..." : "Send Code"}
              onPress={handleSubmit}
            />
          }
        >
          <AuthInput
            icon="mail"
            label="Email"
            onChangeText={setContact}
            placeholder="Enter your email"
            value={contact}
          />
        </BottomSheetCard>
      </BottomSheetModal>
    </SafeAreaView>
  );
}

import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { useResetPasswordMutation } from "@/src/features/auth/api/use-auth-mutations";
import {
  AuthBackdropPreview,
  AuthInput,
  BottomSheetModal,
  BottomSheetCard,
  PrimaryButton,
  AuthNoticeToast,
} from "@/src/features/auth/components/auth-ui";
import { normalizeApiError } from "@/src/lib/api/errors";

export function CreateNewPasswordScreen() {
  const params = useLocalSearchParams<{ email?: string; otp?: string }>();
  const email = params.email ?? "";
  const otp = params.otp ?? "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const resetPasswordMutation = useResetPasswordMutation();

  const handleSubmit = () => {
    setMessage(null);
    resetPasswordMutation.mutate(
      {
        email,
        otp,
        password: newPassword,
        password_confirmation: confirmPassword,
      },
      {
        onError: (error) => setMessage(normalizeApiError(error).message),
        onSuccess: (data) => {
          setMessage(data.message);
          router.replace("/(auth)/sign-in");
        },
      },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#D7D7D7]" edges={["top"]}>
      <AuthNoticeToast message={message} onClose={() => setMessage(null)} tone={message?.includes("succès") ? "success" : "error"} />
      <BottomSheetModal backdrop={<AuthBackdropPreview showForgotLink={false} />} onClose={() => router.back()}>
        <BottomSheetCard
          title="Create New Password"
          subtitle="Enter your new password"
          footer={
            <PrimaryButton
              disabled={resetPasswordMutation.isPending}
              label={resetPasswordMutation.isPending ? "Updating..." : "Update Password"}
              onPress={handleSubmit}
            />
          }
        >
          <AuthInput
            icon="lock"
            label="New Password"
            onChangeText={setNewPassword}
            placeholder="Enter your new password"
            secureTextEntry
            value={newPassword}
          />
          <AuthInput
            icon="lock"
            label="Confirm Password"
            onChangeText={setConfirmPassword}
            placeholder="Confirm your new password"
            secureTextEntry
            value={confirmPassword}
          />
        </BottomSheetCard>
      </BottomSheetModal>
    </SafeAreaView>
  );
}

import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { KeyboardAwareScrollView, KeyboardAvoidingView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

import {
  AuthInput,
  BottomSheetCard,
  BottomSheetModal,
  PrimaryButton,
} from "@/src/features/auth/components/auth-ui";
import { useForgotPasswordMutation, useLoginMutation, useResetPasswordMutation } from "@/src/features/auth/api/use-auth-mutations";
import { normalizeApiError } from "@/src/lib/api/errors";

const bizoBrandLogo = require("../../../../design/bizo/bizo_brand_logo/brand.png");

function LoginField({
  label,
  placeholder,
  value,
  onChangeText,
  secure = false,
  keyboardType = "default",
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  secure?: boolean;
  keyboardType?: "default" | "email-address";
}) {
  const [hidden, setHidden] = useState(secure);
  const Icon = secure ? Lock : Mail;

  return (
    <View className="mb-6">
      <Text className="mb-2 text-[13px] font-bold text-[#191C1D]">{label}</Text>
      <View className="h-[52px] flex-row items-center rounded-xl border border-[#D1C5AC] bg-white px-4">
        <Icon color="#5F5E5E" size={18} strokeWidth={2} />
        <TextInput
          autoCapitalize="none"
          keyboardType={keyboardType}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#C8C6C5"
          secureTextEntry={hidden}
          style={{ flex: 1, marginLeft: 12, color: "#191C1D", fontSize: 16, padding: 0 }}
          value={value}
        />
        {secure ? (
          <Pressable hitSlop={12} onPress={() => setHidden((current) => !current)}>
            {hidden ? (
              <EyeOff color="#5F5E5E" size={18} strokeWidth={2} />
            ) : (
              <Eye color="#5B5BD6" size={18} strokeWidth={2} />
            )}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function GoogleMark() {
  return (
    <Svg height={20} viewBox="0 0 24 24" width={20}>
      <Path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <Path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <Path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <Path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </Svg>
  );
}

export function SignInScreen() {
  const params = useLocalSearchParams<{ modal?: string }>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotContact, setForgotContact] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [activeSheet, setActiveSheet] = useState<"forgot-password" | "create-password" | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const loginMutation = useLoginMutation();
  const forgotPasswordMutation = useForgotPasswordMutation();
  const resetPasswordMutation = useResetPasswordMutation();

  useEffect(() => {
    if (params.modal === "forgot-password" || params.modal === "create-password") {
      setActiveSheet(params.modal);
      return;
    }

    setActiveSheet(null);
  }, [params.modal]);

  const closeSheet = () => {
    setActiveSheet(null);
    setFeedback(null);

    if (params.modal) {
      router.replace("/(auth)/sign-in");
    }
  };

  const handleLogin = () => {
    setFeedback(null);
    loginMutation.mutate(
      {
        email: email.trim(),
        password,
      },
      {
        onError: (error) => setFeedback(normalizeApiError(error).message),
        onSuccess: () => router.replace("/(tabs)/home"),
      },
    );
  };

  const handleForgotPassword = () => {
    setFeedback(null);
    forgotPasswordMutation.mutate(
      { email: forgotContact.trim() },
      {
        onError: (error) => setFeedback(normalizeApiError(error).message),
        onSuccess: (data) => {
          setResetEmail(forgotContact.trim());
          setActiveSheet(null);
          router.push({
            pathname: "/(auth)/verification",
            params: { email: forgotContact.trim(), mode: "reset", notice: data.message },
          });
        },
      },
    );
  };

  const handleResetPassword = () => {
    setFeedback(null);
    resetPasswordMutation.mutate(
      {
        email: resetEmail.trim(),
        password: newPassword,
        password_confirmation: confirmPassword,
        otp: resetOtp.trim(),
      },
      {
        onError: (error) => setFeedback(normalizeApiError(error).message),
        onSuccess: (data) => {
          setFeedback(data.message);
          setActiveSheet(null);
          router.replace("/(auth)/sign-in");
        },
      },
    );
  };

  return (
    <KeyboardAvoidingView automaticOffset behavior="translate-with-padding" style={{ backgroundColor: "#F8F9FA", flex: 1 }}>
      <SafeAreaView className="h-[180px] items-center justify-center overflow-hidden bg-[#EFF6FF]" edges={["top"]}>
        <View className="absolute inset-x-0 bottom-0 h-[96px] bg-white" />
        <View className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#F5C518]/20" />
        <Image source={bizoBrandLogo} style={{ width: 120, height: 99 }} contentFit="contain" />
      </SafeAreaView>

      <View className="-mt-6 flex-1 rounded-t-[24px] bg-white px-6 pb-6 pt-10 shadow-soft">
        <KeyboardAwareScrollView
          bottomOffset={24}
          extraKeyboardSpace={16}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
        >
        <View className="mx-auto w-full max-w-[400px] flex-1">
          <View className="mb-8">
            <Text className="mb-2 text-[26px] font-extrabold text-[#191C1D]">Bon retour 👋</Text>
            <Text className="text-[14px] leading-5 text-[#5F5E5E]">Connectez-vous à votre compte Bizo.</Text>
          </View>

          <LoginField
            keyboardType="email-address"
            label="Email"
            onChangeText={setEmail}
            placeholder="votre@email.com"
            value={email}
          />

          <LoginField
            label="Mot de passe"
            onChangeText={setPassword}
            placeholder="••••••••"
            secure
            value={password}
          />

          <Pressable className="-mt-4 mb-5 self-end py-2" onPress={() => setActiveSheet("forgot-password")}>
            <Text className="text-[13px] font-bold text-[#5B5BD6]">Mot de passe oublié ?</Text>
          </Pressable>

          <Pressable
            className={`h-[52px] flex-row items-center justify-center rounded-full shadow-soft ${loginMutation.isPending ? "bg-[#5F5E5E]" : "bg-[#191C1D]"}`}
            disabled={loginMutation.isPending}
            onPress={handleLogin}
          >
            <Text className="text-[20px] font-extrabold text-white">{loginMutation.isPending ? "Connexion..." : "Se connecter"}</Text>
            <ArrowRight color="#FFFFFF" size={22} strokeWidth={2.4} style={{ marginLeft: 10 }} />
          </Pressable>

          {feedback ? <Text className="mt-3 text-center text-[13px] font-semibold text-[#BA1A1A]">{feedback}</Text> : null}

          <View className="my-6 flex-row items-center">
            <View className="h-px flex-1 bg-[#D1C5AC]" />
            <Text className="mx-4 text-[13px] text-[#5F5E5E]">ou</Text>
            <View className="h-px flex-1 bg-[#D1C5AC]" />
          </View>

          <Pressable className="h-[52px] flex-row items-center justify-center rounded-full border border-[#D1C5AC] bg-white">
            <GoogleMark />
            <Text className="ml-3 text-[16px] font-bold text-[#191C1D]">Continuer avec Google</Text>
          </Pressable>

          <View className="mt-10 flex-row justify-center">
            <Text className="text-[14px] text-[#5F5E5E]">Pas encore de compte ? </Text>
            <Pressable onPress={() => router.push("/(auth)/sign-up")}>
              <Text className="text-[14px] font-bold text-[#5B5BD6]">S'inscrire</Text>
            </Pressable>
          </View>

          <Text className="mt-auto pb-1 text-center text-[11px] font-bold uppercase tracking-[2px] text-[#C8C6C5]">
            Powered by Bizo Infrastructure
          </Text>
        </View>
        </KeyboardAwareScrollView>
      </View>

      {activeSheet === "forgot-password" ? (
        <BottomSheetModal backdrop={<View className="flex-1" />} onClose={closeSheet}>
          <BottomSheetCard
            title="Forgot Password"
            subtitle="Enter your email or phone number"
            footer={
              <PrimaryButton
                disabled={forgotPasswordMutation.isPending}
                label={forgotPasswordMutation.isPending ? "Sending..." : "Send Code"}
                onPress={handleForgotPassword}
              />
            }
          >
            {feedback ? <Text className="mb-3 text-[13px] font-semibold text-[#5B5BD6]">{feedback}</Text> : null}
            <AuthInput
              icon="mail"
              label="Email"
              onChangeText={setForgotContact}
              placeholder="Enter your email"
              value={forgotContact}
            />
          </BottomSheetCard>
        </BottomSheetModal>
      ) : null}

      {activeSheet === "create-password" ? (
        <BottomSheetModal backdrop={<View className="flex-1" />} onClose={closeSheet}>
          <BottomSheetCard
            title="Create New Password"
            subtitle="Enter your new password"
            footer={
              <PrimaryButton
                disabled={resetPasswordMutation.isPending}
                label={resetPasswordMutation.isPending ? "Updating..." : "Update Password"}
                onPress={handleResetPassword}
              />
            }
          >
            {feedback ? <Text className="mb-3 text-[13px] font-semibold text-[#5B5BD6]">{feedback}</Text> : null}
            <AuthInput
              icon="mail"
              label="Email"
              onChangeText={setResetEmail}
              placeholder="Enter your email"
              value={resetEmail}
            />
            <AuthInput
              icon="lock"
              label="OTP Code"
              onChangeText={setResetOtp}
              placeholder="Enter the 6-digit code"
              value={resetOtp}
            />
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
      ) : null}
    </KeyboardAvoidingView>
  );
}

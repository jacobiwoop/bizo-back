import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";

import { useForgotPasswordMutation } from "@/src/features/auth/api/use-auth-mutations";
import { AuthNoticeTone } from "@/src/features/auth/components/auth-ui";
import { normalizeApiError } from "@/src/lib/api/errors";

export function VerificationScreen() {
  const params = useLocalSearchParams<{ email?: string; mode?: string; notice?: string }>();
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [notice, setNotice] = useState<string | null>(params.notice ?? null);
  const [noticeTone, setNoticeTone] = useState<AuthNoticeTone>(params.notice ? "success" : "info");
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const forgotPasswordMutation = useForgotPasswordMutation();
  const destination = params.email ?? "";
  const isResetFlow = params.mode === "reset" || Boolean(params.email);
  const otp = otpDigits.join("");
  const complete = otp.length === 6;

  const setDigit = (index: number, value: string) => {
    const clean = value.replace(/\D/g, "");

    if (clean.length > 1) {
      const pasted = clean.slice(0, 6).split("");
      setOtpDigits((current) => current.map((_, digitIndex) => pasted[digitIndex] ?? ""));
      inputRefs.current[Math.min(pasted.length, 5)]?.focus();
      setNotice(null);
      return;
    }

    setOtpDigits((current) => {
      const next = [...current];
      next[index] = clean;
      return next;
    });
    setNotice(null);

    if (clean && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleBackspace = (index: number) => {
    if (otpDigits[index]) {
      setOtpDigits((current) => {
        const next = [...current];
        next[index] = "";
        return next;
      });
      return;
    }

    if (index > 0) {
      inputRefs.current[index - 1]?.focus();
      setOtpDigits((current) => {
        const next = [...current];
        next[index - 1] = "";
        return next;
      });
    }
  };

  const handleVerify = () => {
    if (isResetFlow) {
      if (!complete) {
        setNoticeTone("error");
        setNotice("Entrez le code OTP à 6 chiffres.");
        return;
      }

      router.replace({
        pathname: "/(auth)/create-new-password",
        params: { email: destination, otp },
      });
      return;
    }

    router.replace("/(auth)/sign-in");
  };

  const handleResend = () => {
    if (!isResetFlow) {
      return;
    }

    setNotice(null);
    setOtpDigits(["", "", "", "", "", ""]);
    forgotPasswordMutation.mutate(
      { email: destination },
      {
        onError: (error) => {
          setNoticeTone("error");
          setNotice(normalizeApiError(error).message);
        },
        onSuccess: (data) => {
          setNoticeTone("success");
          setNotice(data.message);
        },
      },
    );
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-[#F0EEEB]" behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <SafeAreaView className="flex-1 bg-[#F0EEEB]" edges={["top", "bottom"]}>
        <View className="h-[58px] flex-row items-center px-5">
          <Pressable className="h-9 w-9 items-center justify-center" onPress={() => router.back()}>
            <ChevronLeft color="#1A1A1A" size={25} strokeWidth={2.2} />
          </Pressable>
          <Text className="absolute left-0 right-0 text-center text-[17px] font-medium tracking-[0.2px] text-[#1A1A1A]">Verification</Text>
        </View>

        <View className="flex-1 items-center px-7 pt-12">
          <Text className="text-center text-[32px] font-bold leading-[38px] text-[#1A1A1A]">Verification Code</Text>
          <Text className="mt-6 text-center text-[14px] italic leading-[23px] text-[#888888]">
              We have sent the verification code to
          </Text>
          <Text className="mt-[6px] text-center text-[15px] font-medium italic text-[#1A1A1A]">{destination || "votre email"}</Text>

          {notice ? (
            <View className={`mt-5 w-full rounded-2xl border px-4 py-3 ${noticeTone === "error" ? "border-[#BA1A1A]/20 bg-[#FFF2F0]" : "border-[#2D54E8]/20 bg-white"}`}>
              <View className="flex-row items-start">
                <Text className={`flex-1 text-[13px] font-semibold leading-5 ${noticeTone === "error" ? "text-[#BA1A1A]" : "text-[#1A1A1A]"}`}>{notice}</Text>
                <Pressable className="ml-3" hitSlop={8} onPress={() => setNotice(null)}>
                  <Text className={`text-[16px] font-bold ${noticeTone === "error" ? "text-[#BA1A1A]" : "text-[#2D54E8]"}`}>×</Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          <Text className="mt-9 text-center text-[13px] italic text-[#AAAAAA]">Touchez les cases et saisissez le code reçu par email</Text>

          <View className="mt-5 flex-row justify-center gap-[10px]">
            {otpDigits.map((value, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                className={`h-[52px] w-[52px] rounded-xl border bg-white text-center text-[22px] font-semibold text-[#1A1A1A] ${value ? "border-[#2D54E8] bg-[#EEF1FD]" : "border-[#D4D0CB]"}`}
                inputMode="numeric"
                keyboardType="number-pad"
                maxLength={index === 0 ? 6 : 1}
                onChangeText={(value) => setDigit(index, value)}
                onKeyPress={({ nativeEvent }) => {
                  if (nativeEvent.key === "Backspace") {
                    handleBackspace(index);
                  }
                }}
                selectTextOnFocus
                value={value}
              />
            ))}
          </View>

          <Pressable
            className={`mt-10 h-[58px] w-full max-w-[340px] items-center justify-center rounded-full shadow-soft ${complete ? "bg-[#2D54E8]" : "bg-[#B0BBF0]"}`}
            disabled={!complete}
            onPress={handleVerify}
          >
            <Text className="text-[18px] font-semibold italic text-white">Verify</Text>
          </Pressable>

          <View className="mt-7 flex-row items-center justify-center">
            <Text className="text-[14px] italic text-[#AAAAAA]">Didn't received the code? </Text>
            <Pressable disabled={forgotPasswordMutation.isPending} onPress={handleResend}>
              <Text className="text-[14px] font-semibold italic text-[#2D54E8]">{forgotPasswordMutation.isPending ? "Sending..." : "Resend"}</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

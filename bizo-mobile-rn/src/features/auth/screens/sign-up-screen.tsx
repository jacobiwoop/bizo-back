import { Image } from "expo-image";
import { router } from "expo-router";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle,
  Circle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  Plus,
  User,
} from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useRegisterMutation } from "@/src/features/auth/api/use-auth-mutations";
import { normalizeApiError } from "@/src/lib/api/errors";

const bizoBrandLogo = require("../../../../design/bizo/bizo_brand_logo/brand.png");

function RegistrationHeader({
  step,
  onBack,
}: {
  step: 1 | 2;
  onBack: () => void;
}) {
  return (
    <SafeAreaView className="bg-[#F8F9FA]" edges={["top"]}>
      <View className="h-16 flex-row items-center justify-between px-5">
        <Pressable className="h-10 w-10 items-center justify-center" onPress={onBack}>
          <ArrowLeft color="#745B00" size={24} strokeWidth={2.2} />
        </Pressable>
        <Image source={bizoBrandLogo} style={{ width: 72, height: 60 }} contentFit="contain" />
        <View className="h-10 w-10" />
      </View>
      <View className="h-1 bg-[#E5E7EB]">
        <View
          className="h-full rounded-r-full bg-[#F5C518]"
          style={{ width: step === 1 ? "33.33%" : "66%" }}
        />
      </View>
      <View className="px-5 pt-2">
        <Text className="text-right text-[12px] font-bold text-[#5F5E5E]">Étape {step} sur 3</Text>
      </View>
    </SafeAreaView>
  );
}

function RegisterField({
  label,
  placeholder,
  value,
  onChangeText,
  icon,
  keyboardType = "default",
  trailing,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  icon: "user" | "mail" | "phone" | "lock";
  keyboardType?: "default" | "email-address" | "phone-pad";
  trailing?: React.ReactNode;
}) {
  const Icon = icon === "mail" ? Mail : icon === "phone" ? Phone : icon === "lock" ? Lock : User;

  return (
    <View>
      <Text className="mb-2 pl-1 text-[13px] font-bold text-[#191C1D]">{label}</Text>
      <View className="h-[52px] flex-row items-center rounded-xl border border-[#D1C5AC] bg-white px-4">
        <Icon color="#5F5E5E" size={19} strokeWidth={2} />
        <TextInput
          autoCapitalize="none"
          keyboardType={keyboardType}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#C8C6C5"
          style={{ flex: 1, marginLeft: 12, color: "#191C1D", fontSize: 16, padding: 0 }}
          value={value}
        />
        {trailing}
      </View>
    </View>
  );
}

function PasswordField({
  label,
  value,
  onChangeText,
  valid = false,
  toggle = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  valid?: boolean;
  toggle?: boolean;
}) {
  const [hidden, setHidden] = useState(true);

  return (
    <View>
      <Text className="mb-2 text-[13px] font-bold text-[#191C1D]">{label}</Text>
      <View className="h-[52px] flex-row items-center rounded-xl border border-[#E5E7EB] bg-white px-4">
        <Lock color="#4E4633" size={19} strokeWidth={2} />
        <TextInput
          autoCapitalize="none"
          onChangeText={onChangeText}
          placeholder="••••••••"
          placeholderTextColor="#C8C6C5"
          secureTextEntry={hidden}
          style={{ flex: 1, marginLeft: 12, color: "#191C1D", fontSize: 16, padding: 0 }}
          value={value}
        />
        {toggle ? (
          <Pressable hitSlop={12} onPress={() => setHidden((current) => !current)}>
            {hidden ? <EyeOff color="#4E4633" size={19} /> : <Eye color="#745B00" size={19} />}
          </Pressable>
        ) : null}
        {valid ? <CheckCircle color="#22C55E" fill="#22C55E" size={21} strokeWidth={2} /> : null}
      </View>
    </View>
  );
}

function StepOne({
  email,
  firstName,
  lastName,
  onContinue,
  phone,
  setEmail,
  setFirstName,
  setLastName,
  setPhone,
}: {
  email: string;
  firstName: string;
  lastName: string;
  onContinue: () => void;
  phone: string;
  setEmail: (value: string) => void;
  setFirstName: (value: string) => void;
  setLastName: (value: string) => void;
  setPhone: (value: string) => void;
}) {
  return (
    <>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 132 }} showsVerticalScrollIndicator={false}>
        <View className="px-5 py-6">
          <View className="mb-8">
            <Text className="mb-1 text-[24px] font-black text-[#191C1D]">Créez votre compte</Text>
            <Text className="text-[14px] leading-5 text-[#5F5E5E]">Quelques infos pour commencer.</Text>
          </View>

          <View className="mb-8 items-center">
            <Pressable className="active:scale-95">
              <View className="h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-[#D1C5AC] bg-[#F3F4F5]">
                <Camera color="#5F5E5E" size={30} strokeWidth={2} />
                <View className="absolute bottom-0 right-0 h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#241A00]">
                  <Plus color="#FFFFFF" size={14} strokeWidth={2.4} />
                </View>
              </View>
            </Pressable>
            <Text className="mt-3 text-[12px] font-bold text-[#5F5E5E]">Photo (optionnel)</Text>
          </View>

          <View className="gap-5">
            <RegisterField icon="user" label="Prénom" onChangeText={setFirstName} placeholder="Votre prénom" value={firstName} />
            <RegisterField icon="user" label="Nom" onChangeText={setLastName} placeholder="Votre nom" value={lastName} />
            <RegisterField
              icon="mail"
              keyboardType="email-address"
              label="Email"
              onChangeText={setEmail}
              placeholder="votre@email.com"
              trailing={<CheckCircle color="#00687C" fill="#00687C" size={21} strokeWidth={2} />}
              value={email}
            />
            <View>
              <Text className="mb-2 pl-1 text-[13px] font-bold text-[#191C1D]">Téléphone</Text>
              <View className="h-[52px] flex-row gap-2">
                <View className="items-center justify-center rounded-xl bg-[#191C1D] px-4">
                  <Text className="text-[13px] font-bold text-white">+225</Text>
                </View>
                <View className="h-[52px] flex-1 flex-row items-center rounded-xl bg-[#F3F4F5] px-4">
                  <Phone color="#5F5E5E" size={20} strokeWidth={2} />
                  <TextInput
                    className="ml-3 flex-1 text-[14px] font-semibold text-[#191C1D]"
                    keyboardType="phone-pad"
                    onChangeText={setPhone}
                    placeholder="XX XX XX XX XX"
                    placeholderTextColor="#777777"
                    value={phone}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 h-24 justify-center rounded-t-xl bg-[#F8F9FA]/95 px-5 shadow-soft">
        <Pressable className="h-[52px] flex-row items-center justify-center rounded-full bg-[#191C1D]" onPress={onContinue}>
          <Text className="text-[16px] font-bold text-white">Continuer</Text>
          <ArrowRight color="#FFFFFF" size={20} strokeWidth={2.4} style={{ marginLeft: 8 }} />
        </Pressable>
      </View>
    </>
  );
}

function StepTwo({
  confirmPassword,
  error,
  isSubmitting,
  onContinue,
  password,
  setConfirmPassword,
  setPassword,
}: {
  confirmPassword: string;
  error: string | null;
  isSubmitting: boolean;
  onContinue: () => void;
  password: string;
  setConfirmPassword: (value: string) => void;
  setPassword: (value: string) => void;
}) {
  const rules = [
    { label: "8 caractères minimum", valid: password.length >= 8 },
    { label: "Une majuscule", valid: /[A-Z]/.test(password) },
    { label: "Un chiffre", valid: /\d/.test(password) },
    { label: "Confirmation identique", valid: password.length > 0 && password === confirmPassword },
  ];

  return (
    <>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 124 }} showsVerticalScrollIndicator={false}>
        <View className="px-4 py-6">
          <View className="mb-8">
            <Text className="text-[24px] font-black text-[#191C1D]">Sécurisez votre compte</Text>
            <Text className="mt-1 text-[14px] text-[#5F5E5E]">Choisissez un mot de passe solide.</Text>
          </View>

          <PasswordField label="Mot de passe" onChangeText={setPassword} toggle value={password} />

          <View className="mt-4 flex-row items-center gap-3">
            <View className="flex-1 flex-row gap-1">
              {[0, 1, 2, 3].map((index) => (
                <View
                  key={index}
                  className={`h-1 flex-1 rounded-sm ${index < 3 ? "bg-[#5B5BD6]" : "bg-[#E5E7EB]"}`}
                />
              ))}
            </View>
            <Text className="text-[12px] font-bold text-[#5B5BD6]">Fort</Text>
          </View>

          <View className="mt-6 gap-3">
            {rules.map((rule) => (
              <View key={rule.label} className="flex-row items-center">
                {rule.valid ? (
                  <CheckCircle color="#22C55E" fill="#22C55E" size={20} strokeWidth={2} />
                ) : (
                  <Circle color="#C8C6C5" size={20} strokeWidth={2} />
                )}
                <Text className={`ml-3 text-[14px] ${rule.valid ? "text-[#191C1D]" : "text-[#5F5E5E]"}`}>
                  {rule.label}
                </Text>
              </View>
            ))}
          </View>

          <View className="mt-8">
            <PasswordField
              label="Confirmer le mot de passe"
              onChangeText={setConfirmPassword}
              valid={password.length > 0 && password === confirmPassword}
              value={confirmPassword}
            />
          </View>
          {error ? <Text className="mt-5 text-center text-[13px] font-semibold text-[#BA1A1A]">{error}</Text> : null}
        </View>
      </ScrollView>

      <View className="border-t border-[#E5E7EB] bg-white px-4 pb-10 pt-4">
        <Pressable
          className={`h-[52px] flex-row items-center justify-center rounded-full ${isSubmitting ? "bg-[#5F5E5E]" : "bg-[#191C1D]"}`}
          disabled={isSubmitting}
          onPress={onContinue}
        >
          <Text className="text-[16px] font-bold text-white">{isSubmitting ? "Création..." : "Créer le compte"}</Text>
          <ArrowRight color="#FFFFFF" size={20} strokeWidth={2.4} style={{ marginLeft: 8 }} />
        </Pressable>
      </View>
    </>
  );
}

export function SignUpScreen() {
  const [step, setStep] = useState<1 | 2>(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const registerMutation = useRegisterMutation();

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      return;
    }

    router.back();
  };

  const handleRegister = () => {
    setError(null);

    const displayName = `${firstName} ${lastName}`.trim();
    const usernameSource = email.split("@")[0]?.toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 30);
    const username = usernameSource && usernameSource.length >= 3 ? usernameSource : null;

    registerMutation.mutate(
      {
        display_name: displayName || email.trim(),
        email: email.trim(),
        password,
        password_confirmation: confirmPassword,
        username,
      },
      {
        onError: (apiError) => setError(normalizeApiError(apiError).message),
        onSuccess: () => {
          void phone;
          router.replace("/(tabs)/home");
        },
      },
    );
  };

  return (
    <View className="flex-1 bg-[#F8F9FA]">
      <RegistrationHeader step={step} onBack={handleBack} />
      <View className="flex-1">
        {step === 1 ? (
          <StepOne
            email={email}
            firstName={firstName}
            lastName={lastName}
            onContinue={() => setStep(2)}
            phone={phone}
            setEmail={setEmail}
            setFirstName={setFirstName}
            setLastName={setLastName}
            setPhone={setPhone}
          />
        ) : (
          <StepTwo
            confirmPassword={confirmPassword}
            error={error}
            isSubmitting={registerMutation.isPending}
            onContinue={handleRegister}
            password={password}
            setConfirmPassword={setConfirmPassword}
            setPassword={setPassword}
          />
        )}
      </View>
    </View>
  );
}

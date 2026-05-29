import { LucideIcon, Apple, ArrowLeft, Check, Eye, EyeOff, Lock, Mail, User, X } from "lucide-react-native";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Keyboard,
  PanResponder,
  Platform,
  Pressable,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
  scroll?: boolean;
};

type AuthInputProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  icon: "user" | "mail" | "lock";
  secureTextEntry?: boolean;
};

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

type SocialProvider = {
  id: string;
  label: string;
  icon: "apple" | "facebook" | "google";
};

type SocialAuthRowProps = {
  question: string;
  actionLabel: string;
  onActionPress: () => void;
};

type AuthBackdropPreviewProps = {
  showForgotLink?: boolean;
};

type BottomSheetCardProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
};

type BottomSheetModalProps = {
  backdrop: ReactNode;
  children: ReactNode;
  onClose?: () => void;
  overlayOpacity?: number;
};

type OtpCodeRowProps = {
  values: string[];
};

export type AuthNoticeTone = "info" | "error" | "success";

type AuthNoticeToastProps = {
  message: string | null;
  onClose: () => void;
  tone?: AuthNoticeTone;
};

const iconMap: Record<AuthInputProps["icon"], LucideIcon> = {
  user: User,
  mail: Mail,
  lock: Lock,
};

const socialProviders: SocialProvider[] = [
  { id: "apple", label: "Apple", icon: "apple" },
  { id: "facebook", label: "f", icon: "facebook" },
  { id: "google", label: "G", icon: "google" },
];

function SocialIcon({ icon }: { icon: SocialProvider["icon"] }) {
  if (icon === "apple") {
    return <Apple color="#111111" size={28} strokeWidth={2.2} />;
  }

  return (
    <Text className="text-[28px] font-semibold text-ink">
      {icon === "facebook" ? "f" : "G"}
    </Text>
  );
}

function IllustrationShell({ children }: { children: ReactNode }) {
  return <View className="h-[270px] items-center justify-end px-4">{children}</View>;
}

export function OnboardingArtwork({ variant }: { variant: "cards" | "cart" | "phone" }) {
  if (variant === "cards") {
    return (
      <IllustrationShell>
        <View className="absolute left-20 top-12 h-12 w-12 items-center justify-center rounded-full bg-[#F68B4B] shadow-soft">
          <View className="h-7 w-7 rounded-full bg-white/95" />
        </View>
        <View className="absolute right-9 top-24 h-[210px] w-[164px] rotate-[8deg] rounded-[24px] bg-white px-5 py-6 shadow-soft">
          <View className="h-[104px] rounded-[18px] bg-[#ECE8FF]" />
          <View className="mt-4 h-4 w-24 rounded-full bg-[#E9EDF3]" />
          <View className="mt-3 flex-row justify-between">
            <View className="h-4 w-20 rounded-full bg-[#E9EDF3]" />
            <View className="h-4 w-10 rounded-full bg-[#E9EDF3]" />
          </View>
        </View>
        <View className="h-[244px] w-[178px] -rotate-[7deg] rounded-[24px] bg-white px-5 py-6 shadow-soft">
          <View className="items-end">
            <View className="h-4 w-4 rounded-full border border-[#202020]" />
          </View>
          <View className="mt-2 h-[110px] rounded-[18px] bg-[#FCEAE9]">
            <View className="flex-1 items-center justify-center">
              <View className="h-14 w-24 rounded-[16px] bg-[#FF705A]" />
            </View>
          </View>
          <View className="mt-5 h-4 w-28 rounded-full bg-[#E9EDF3]" />
          <View className="mt-3 flex-row justify-between">
            <View className="h-4 w-20 rounded-full bg-[#E9EDF3]" />
            <View className="h-4 w-10 rounded-full bg-[#E9EDF3]" />
          </View>
        </View>
      </IllustrationShell>
    );
  }

  if (variant === "cart") {
    return (
      <IllustrationShell>
        <View className="absolute left-10 bottom-5 h-14 w-14 rounded-full bg-[#F68B4B]" />
        <View className="absolute left-10 bottom-5 h-14 w-14 rounded-full bg-[#3363E6]/10" />
        <View className="absolute left-16 bottom-6 h-10 w-10 rounded-tr-[26px] rounded-bl-[26px] bg-[#3363E6]" />
        <View className="absolute left-16 top-8">
          {Array.from({ length: 9 }).map((_, index) => (
            <View
              key={index}
              className="absolute h-[2px] w-12 bg-[#F5F0E8]"
              style={{
                left: (index % 3) * 85,
                top: Math.floor(index / 3) * 64,
              }}
            />
          ))}
        </View>
        <View className="absolute right-10 bottom-4 h-[230px] w-[120px]">
          <View className="absolute right-6 top-0 h-10 w-10 rounded-full bg-[#A5646D]" />
          <View className="absolute right-2 top-8 h-[88px] w-[88px] rounded-t-[28px] rounded-b-[22px] bg-[#46435F]" />
          <View className="absolute right-12 top-16 h-[100px] w-4 rounded-full bg-[#F68B4B]" />
          <View className="absolute right-1 top-[120px] h-[58px] w-9 rounded-t-[16px] rounded-bl-[16px] bg-[#A5646D]" />
          <View className="absolute right-12 top-[78px] h-[88px] w-14 rounded-sm bg-white" />
          <View className="absolute right-20 top-[172px] h-[74px] w-[38px] rounded-t-[14px] bg-[#0C2A4F]" />
          <View className="absolute right-2 top-[172px] h-[84px] w-[40px] rounded-t-[14px] bg-[#0C2A4F]" />
          <View className="absolute right-18 top-[238px] h-[40px] w-6 rounded-b-[14px] bg-[#3363E6]" />
          <View className="absolute right-0 top-[242px] h-[36px] w-6 rounded-b-[14px] bg-[#3363E6]" />
        </View>
        <View className="absolute left-14 bottom-6">
          <View className="h-28 w-[216px] border-2 border-[#3363E6] border-t-[3px] bg-transparent">
            <View className="absolute inset-x-0 top-9 border-t border-[#3363E6]" />
            <View className="absolute inset-x-0 top-[78px] border-t border-[#3363E6]" />
            <View className="absolute left-[72px] top-0 h-full border-l border-[#3363E6]" />
            <View className="absolute left-[124px] top-0 h-full border-l border-[#3363E6]" />
            <View className="absolute left-0 right-0 top-2 bottom-2 bg-[#F1F1F1]/60" />
          </View>
          <View className="ml-10 h-5 w-40 border-x-2 border-b-2 border-[#3363E6]" />
          <View className="mt-3 flex-row items-center justify-between px-3">
            <View className="h-6 w-6 rounded-full bg-[#4B4B74]" />
            <View className="h-6 w-6 rounded-full bg-[#4B4B74]" />
          </View>
        </View>
        <View className="absolute bottom-2 left-8 right-8 h-[2px] bg-[#3363E6]" />
      </IllustrationShell>
    );
  }

  return (
    <IllustrationShell>
      <View className="absolute left-14 bottom-3 h-[2px] w-[270px] bg-[#EDE9E3]" />
      <View className="absolute left-16 top-6 h-[260px] w-[150px] rounded-[34px] border-[10px] border-[#0B0A19] bg-white">
        <View className="absolute left-1/2 top-3 h-5 w-16 -translate-x-8 rounded-full bg-[#0B0A19]" />
        <View className="absolute left-7 top-12 h-8 w-8 rounded-full bg-[#F68B4B]" />
        <View className="absolute right-8 top-14 h-7 w-7 rounded-full bg-[#EEEEEE]" />
        <View className="absolute left-7 top-24 h-4 w-14 rounded-full bg-[#3363E6]" />
        <View className="absolute left-24 top-24 h-4 w-12 rounded-full bg-[#E3E3E3]" />
        <View className="absolute left-7 top-48 h-8 w-8 items-center justify-center rounded-md bg-[#3363E6]">
          <Check color="#FFFFFF" size={18} strokeWidth={3} />
        </View>
        <View className="absolute left-20 top-50 h-4 w-[92px] rounded-full bg-[#E3E3E3]" />
        <View className="absolute left-20 top-60 h-4 w-14 rounded-full bg-[#E3E3E3]" />
        <View className="absolute left-7 top-88 h-8 w-8 items-center justify-center rounded-md bg-[#3363E6]">
          <Check color="#FFFFFF" size={18} strokeWidth={3} />
        </View>
        <View className="absolute left-20 top-[90px] h-4 w-[92px] rounded-full bg-[#E3E3E3]" />
        <View className="absolute left-20 top-[100px] h-4 w-14 rounded-full bg-[#E3E3E3]" />
        <View className="absolute left-7 top-[128px] h-8 w-8 items-center justify-center rounded-md bg-[#3363E6]">
          <Check color="#FFFFFF" size={18} strokeWidth={3} />
        </View>
        <View className="absolute left-20 top-[130px] h-4 w-[92px] rounded-full bg-[#E3E3E3]" />
        <View className="absolute left-20 top-[140px] h-4 w-14 rounded-full bg-[#E3E3E3]" />
        <View className="absolute bottom-6 left-7 right-7 h-20 rounded-xl bg-[#F5F5F5]">
          <View className="absolute left-5 top-14 h-[1px] w-20 rotate-[35deg] bg-[#111111]" />
          <View className="absolute left-16 top-10 h-[1px] w-8 rotate-[-35deg] bg-[#111111]" />
          <View className="absolute left-24 top-16 h-[1px] w-8 rotate-[-40deg] bg-[#111111]" />
          <View className="absolute left-32 top-9 h-[1px] w-14 rotate-[38deg] bg-[#111111]" />
          <View className="absolute left-9 top-11 h-2 w-2 rounded-full bg-[#111111]" />
          <View className="absolute left-18 top-[26px] h-2 w-2 rounded-full bg-[#111111]" />
          <View className="absolute left-[82px] top-[22px] h-2 w-2 rounded-full bg-[#111111]" />
          <View className="absolute left-[118px] top-[10px] h-2 w-2 rounded-full bg-[#111111]" />
        </View>
      </View>
      <View className="absolute right-12 top-16 h-[220px] w-[96px]">
        <View className="absolute right-7 top-10 h-10 w-10 rounded-full bg-[#F4A0A9]" />
        <View className="absolute right-0 top-20 h-[86px] w-[56px] rounded-t-[24px] bg-[#3363E6]" />
        <View className="absolute right-12 top-28 h-[108px] w-4 rounded-full bg-[#3363E6]" />
        <View className="absolute right-10 top-[116px] h-[44px] w-16 -rotate-[28deg] rounded-full bg-[#3363E6]" />
        <View className="absolute right-6 top-[186px] h-[92px] w-7 rounded-t-[14px] bg-[#111021]" />
        <View className="absolute right-0 top-[188px] h-[90px] w-8 rounded-t-[14px] bg-[#111021]" />
      </View>
    </IllustrationShell>
  );
}

export function AuthLogoBadge() {
  return (
    <View className="h-[54px] w-[54px] items-center justify-center rounded-full bg-[#F68B4B] shadow-soft">
      <View className="h-7 w-7 rounded-full bg-white/95" />
    </View>
  );
}

export function AuthNoticeToast({ message, onClose, tone = "info" }: AuthNoticeToastProps) {
  if (!message) {
    return null;
  }

  const toneClass = {
    error: "border-[#BA1A1A]/20 bg-[#FFF2F0]",
    info: "border-[#2D54E8]/20 bg-white",
    success: "border-[#22C55E]/20 bg-[#F2FFF7]",
  }[tone];
  const textClass = {
    error: "text-[#BA1A1A]",
    info: "text-[#1A1A1A]",
    success: "text-[#176B35]",
  }[tone];
  const iconColor = tone === "error" ? "#BA1A1A" : tone === "success" ? "#176B35" : "#2D54E8";

  return (
    <View className="absolute left-4 right-4 top-3 z-50">
      <View className={`flex-row items-center rounded-2xl border px-4 py-3 shadow-soft ${toneClass}`}>
        <View className="mr-3 h-2 w-2 rounded-full" style={{ backgroundColor: iconColor }} />
        <Text className={`flex-1 text-[13px] font-semibold leading-5 ${textClass}`}>{message}</Text>
        <Pressable className="ml-3 h-7 w-7 items-center justify-center rounded-full bg-black/5" hitSlop={8} onPress={onClose}>
          <X color={iconColor} size={15} strokeWidth={2.4} />
        </Pressable>
      </View>
    </View>
  );
}

export function AuthScreenShell({
  title,
  subtitle,
  children,
  footer,
  scroll = false,
}: AuthShellProps) {
  const content = (
    <View className="flex-1 px-6 pb-6 pt-4">
      <AuthLogoBadge />
      <Text className="mt-6 text-[26px] font-semibold leading-[31px] text-ink">{title}</Text>
      <Text className="mt-2 text-[14px] leading-5 text-[#8A8A8A]">{subtitle}</Text>
      <View className="mt-7 flex-1">{children}</View>
      {footer ? <View className="mt-6">{footer}</View> : null}
    </View>
  );

  if (!scroll) {
    return (
      <SafeAreaView className="flex-1 bg-shell" edges={["top"]}>
        {content}
      </SafeAreaView>
    );
  }

  return <SafeAreaView className="flex-1 bg-shell" edges={["top"]}>{content}</SafeAreaView>;
}

export function AuthInput({
  label,
  placeholder,
  value,
  onChangeText,
  icon,
  secureTextEntry = false,
}: AuthInputProps) {
  const [hidden, setHidden] = useState(secureTextEntry);
  const LeadingIcon = iconMap[icon];

  return (
    <View className="mb-4">
      <Text className="mb-3 text-[16px] font-medium text-ink">{label}</Text>
      <View className="h-[58px] flex-row items-center rounded-[20px] border border-line bg-white px-4">
        <LeadingIcon color="#8F8F8F" size={22} strokeWidth={1.8} />
        <TextInput
          autoCapitalize="none"
          className="ml-3 flex-1 text-[16px] text-ink"
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#989898"
          secureTextEntry={hidden}
          value={value}
        />
        {secureTextEntry ? (
          <Pressable
            className="ml-4"
            hitSlop={12}
            onPress={() => setHidden((current) => !current)}
          >
            {hidden ? (
              <Eye color="#8F8F8F" size={22} strokeWidth={1.8} />
            ) : (
              <EyeOff color="#3363E6" size={22} strokeWidth={1.8} />
            )}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export function PrimaryButton({ label, onPress, disabled = false }: PrimaryButtonProps) {
  return (
    <Pressable
      className={`h-[58px] items-center justify-center rounded-[30px] ${disabled ? "bg-[#AFC0F7]" : "bg-[#3363E6]"}`}
      disabled={disabled}
      onPress={onPress}
    >
      <Text className="text-[16px] font-semibold text-white">{label}</Text>
    </Pressable>
  );
}

export function SocialAuthRow({ question, actionLabel, onActionPress }: SocialAuthRowProps) {
  return (
    <View className="items-center">
      <Text className="text-[14px] text-[#848484]">Or continue with</Text>
      <View className="mt-6 flex-row gap-5">
        {socialProviders.map((provider) => (
          <Pressable
            key={provider.id}
            className="h-[68px] w-[68px] items-center justify-center rounded-[20px] border border-[#A1A1A1] bg-white"
          >
            <SocialIcon icon={provider.icon} />
          </Pressable>
        ))}
      </View>
      <View className="mt-7 flex-row items-center">
        <Text className="text-[16px] text-[#818181]">{question} </Text>
        <Pressable onPress={onActionPress}>
          <Text className="text-[16px] font-medium text-[#3363E6]">{actionLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function AuthBackdropPreview({ showForgotLink = true }: AuthBackdropPreviewProps) {
  return (
    <View className="px-6 pt-4">
      <AuthLogoBadge />
      <Text className="mt-8 text-[26px] font-semibold leading-[31px] text-ink">Hello Again!</Text>
      <Text className="mt-2 text-[14px] leading-5 text-[#7F7F7F]">Welcome back you’ve been missed!</Text>

      <View className="mt-12">
        <Text className="mb-3 text-[16px] font-medium text-ink">Username</Text>
        <View className="h-[58px] flex-row items-center rounded-[20px] border border-[#B9B9B9] bg-transparent px-4">
          <User color="#7D7D7D" size={22} strokeWidth={1.8} />
          <Text className="ml-3 text-[16px] text-[#7F7F7F]">Enter your username</Text>
        </View>
      </View>

      <View className="mt-8">
        <Text className="mb-3 text-[16px] font-medium text-ink">Password</Text>
        <View className="h-[58px] flex-row items-center rounded-[20px] border border-[#B9B9B9] bg-transparent px-4">
          <Lock color="#7D7D7D" size={22} strokeWidth={1.8} />
          <Text className="ml-3 flex-1 text-[16px] text-[#7F7F7F]">Enter your password</Text>
          <Eye color="#7D7D7D" size={22} strokeWidth={1.8} />
        </View>
      </View>

      {showForgotLink ? (
        <Text className="mt-6 self-end text-[14px] font-medium text-[#3363E6]">Forgot Password ?</Text>
      ) : null}

      <View className="mt-9 h-[58px] items-center justify-center rounded-[30px] bg-[#3363E6]">
        <Text className="text-[16px] font-semibold text-white">Sign In</Text>
      </View>
    </View>
  );
}

export function BottomSheetModal({
  backdrop,
  children,
  onClose,
  overlayOpacity = 0.18,
}: BottomSheetModalProps) {
  const { height } = useWindowDimensions();
  const translateY = useRef(new Animated.Value(height)).current;
  const keyboardLift = useRef(new Animated.Value(0)).current;
  const closingRef = useRef(false);

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: 0,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [translateY]);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(showEvent, (event) => {
      Animated.timing(keyboardLift, {
        toValue: event.endCoordinates.height,
        duration: Platform.OS === "ios" ? event.duration || 240 : 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });
    const hideSub = Keyboard.addListener(hideEvent, (event) => {
      Animated.timing(keyboardLift, {
        toValue: 0,
        duration: Platform.OS === "ios" ? event.duration || 220 : 160,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [keyboardLift]);

  const closeSheet = () => {
    if (closingRef.current) {
      return;
    }

    closingRef.current = true;
    Animated.timing(translateY, {
      toValue: height,
      duration: 220,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      onClose?.();
      closingRef.current = false;
    });
  };

  const resetSheet = () => {
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      damping: 20,
      stiffness: 180,
      mass: 0.8,
    }).start();
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dy) > 6 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dy > 0) {
            translateY.setValue(gestureState.dy);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dy > 140 || gestureState.vy > 1.2) {
            closeSheet();
            return;
          }

          resetSheet();
        },
        onPanResponderTerminate: resetSheet,
      }),
    [height, translateY]
  );

  return (
    <View className="absolute inset-0 z-50 bg-transparent">
      <View className="flex-1">{backdrop}</View>
      <Pressable
        className="absolute inset-0"
        onPress={closeSheet}
        style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }}
      />
      <Animated.View
        className="absolute inset-x-0 bottom-0"
        style={{ transform: [{ translateY }, { translateY: Animated.multiply(keyboardLift, -1) }] }}
      >
        <View {...panResponder.panHandlers}>{children}</View>
      </Animated.View>
    </View>
  );
}

export function BottomSheetCard({ title, subtitle, children, footer }: BottomSheetCardProps) {
  return (
    <View className="rounded-t-[34px] bg-white px-6 pb-6 pt-4">
      <View className="items-center">
        <View className="h-[6px] w-[98px] rounded-full bg-[#D9D9D9]" />
      </View>
      <Text className="mt-7 text-[26px] font-semibold text-ink">{title}</Text>
      <Text className="mt-3 text-[14px] leading-5 text-[#8A8A8A]">{subtitle}</Text>
      <View className="mt-8">{children}</View>
      {footer ? <View className="mt-4">{footer}</View> : null}
    </View>
  );
}

export function OtpCodeRow({ values }: OtpCodeRowProps) {
  return (
    <View className="mt-10 flex-row justify-between">
      {values.map((value, index) => {
        const filled = value.length > 0;

        return (
          <View
            key={`${index}-${value}`}
            className={`h-[86px] w-[68px] items-center justify-center rounded-[22px] border ${filled ? "border-[#3363E6] bg-white" : "border-[#D6D6D6] bg-[#E5ECFF]"}`}
          >
            <Text className={`text-[28px] font-semibold ${filled ? "text-ink" : "text-[#B9C5EA]"}`}>
              {filled ? value : ""}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export function VerificationHeader({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) {
  return (
    <SafeAreaView className="bg-shell" edges={["top"]}>
      <View className="flex-row items-center justify-center px-6 pb-3 pt-3">
        <Pressable className="absolute left-6 top-4" hitSlop={12} onPress={onBack}>
          <ArrowLeft color="#111111" size={26} strokeWidth={2.2} />
        </Pressable>
        <Text className="text-[18px] font-semibold text-ink">{title}</Text>
      </View>
    </SafeAreaView>
  );
}

export function VerificationIllustration() {
  return (
    <View className="mt-10 items-center">
      <View className="h-[190px] w-[190px] items-center justify-center rounded-full border-[1.5px] border-[#3363E6]">
        <View className="absolute bottom-8 h-[72px] w-[104px] rounded-[20px] border-[1.5px] border-[#3363E6] bg-[#FDC8AF]" />
        <View className="absolute bottom-5 right-5 h-14 w-[98px] rotate-[-18deg] rounded-[4px] bg-[#325DD4]" />
        <View className="h-[108px] w-[80px] rounded-[14px] border-[1.5px] border-[#3363E6] bg-white">
          <View className="items-center pt-3">
            <View className="h-6 w-6 rounded-full bg-[#F3B092]" />
          </View>
          <View className="mx-3 mt-3 h-10 rounded-[8px] bg-[#F9C3AC]" />
          <View className="mx-4 mt-3 h-3 rounded-md bg-[#EFEFEF]" />
        </View>
        <View className="absolute left-5 top-2 h-[82px] w-[112px] rounded-[18px] border-[1.5px] border-[#3363E6] bg-white px-3 py-3 shadow-soft">
          <View className="h-6 w-6 items-center justify-center rounded-full bg-[#F3B092]">
            <Lock color="#3363E6" size={14} strokeWidth={2.5} />
          </View>
          <View className="mt-3 h-4 rounded-md border border-[#D1D1D1]">
            <View className="ml-2 mt-[4px] flex-row gap-1">
              {Array.from({ length: 5 }).map((_, index) => (
                <View key={index} className="h-[5px] w-[5px] rounded-full bg-[#3363E6]" />
              ))}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

export function SuccessSheet({
  title,
  subtitle,
  actionLabel,
  onPress,
}: {
  title: string;
  subtitle: string;
  actionLabel: string;
  onPress: () => void;
}) {
  const rows = useMemo(() => [0, 1, 2], []);

  return (
    <BottomSheetCard title={title} subtitle={subtitle} footer={<PrimaryButton label={actionLabel} onPress={onPress} />}>
      <View className="items-center pb-2">
        <View className="h-[180px] w-[146px] rounded-[16px] border-[5px] border-[#163B9D] bg-white pt-3">
          <View className="absolute left-1/2 top-0 h-8 w-[56px] -translate-x-7 rounded-b-[16px] rounded-t-[10px] bg-[#3363E6]" />
          {rows.map((row) => (
            <View key={row} className="mt-6 flex-row items-center justify-center">
              <View className="h-9 w-9 items-center justify-center">
                {row < 2 ? (
                  <Check color="#163B9D" size={26} strokeWidth={2.4} />
                ) : (
                  <View className="h-5 w-5 border-2 border-[#D9D9D9]" />
                )}
              </View>
              <View className="ml-3 gap-2">
                <View className="h-3 w-14 rounded-full bg-[#D9D9D9]" />
                <View className="h-3 w-9 rounded-full bg-[#D9D9D9]" />
              </View>
            </View>
          ))}
          <View className="absolute bottom-7 right-[-6px] h-[16px] w-[96px] -rotate-[38deg] rounded-[10px] bg-[#FFC1A0]" />
          <View className="absolute bottom-[36px] right-[28px] h-[66px] w-[8px] -rotate-[38deg] rounded-full bg-[#163B9D]" />
        </View>
      </View>
    </BottomSheetCard>
  );
}

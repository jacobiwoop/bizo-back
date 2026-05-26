import { ReactNode } from "react";
import { Text, View } from "react-native";

import { AppScreen } from "@/src/components/ui/screen";

type PlaceholderScreenProps = {
  title: string;
  subtitle: string;
  footer?: ReactNode;
};

export function PlaceholderScreen({ title, subtitle, footer }: PlaceholderScreenProps) {
  return (
    <AppScreen className="bg-shell">
      <View className="flex-1 px-6 pt-8">
        <Text className="text-[32px] font-semibold text-ink">{title}</Text>
        <Text className="mt-3 text-base leading-6 text-muted">{subtitle}</Text>
        {footer ? <View className="mt-8">{footer}</View> : null}
      </View>
    </AppScreen>
  );
}

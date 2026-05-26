import { PropsWithChildren, ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type AppScreenProps = PropsWithChildren<{
  header?: ReactNode;
  scroll?: boolean;
  className?: string;
  contentClassName?: string;
}>;

export function AppScreen({
  children,
  header,
  scroll = false,
  className = "",
  contentClassName = "",
}: AppScreenProps) {
  const content = (
    <View className={`flex-1 bg-shell ${contentClassName}`.trim()}>
      {header}
      <View className="flex-1">{children}</View>
    </View>
  );

  if (scroll) {
    return (
      <SafeAreaView className={`flex-1 bg-shell ${className}`.trim()} edges={["top"]}>
        {header}
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 bg-shell ${className}`.trim()} edges={["top"]}>
      {content}
    </SafeAreaView>
  );
}

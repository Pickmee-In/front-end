import React, { createContext, forwardRef, useContext } from "react";
import {
  Text as NativeText,
  TextInput as NativeTextInput,
  StyleSheet,
  type TextProps,
  type TextInputProps,
} from "react-native";
const Weight = createContext(400);
const families: Record<number, string> = {
  400: "JakartaRegular",
  500: "JakartaMedium",
  600: "JakartaSemiBold",
  700: "JakartaBold",
  800: "JakartaExtraBold",
};
function getWeight(value: string | number | undefined, inherited: number) {
  if (!value) return inherited;
  if (value === "bold") return 700;
  if (value === "normal") return 400;
  return Math.min(800, Math.max(400, Math.round(Number(value) / 100) * 100));
}
export const Text = forwardRef<
  React.ComponentRef<typeof NativeText>,
  TextProps
>(function Text({ style, children, ...props }, ref) {
  const parentWeight = useContext(Weight);
  const flat = StyleSheet.flatten(style);
  const weight = getWeight(flat?.fontWeight, parentWeight);
  return (
    <Weight.Provider value={weight}>
      <NativeText
        ref={ref}
        {...props}
        style={[
          { fontFamily: families[weight] },
          style,
          { fontWeight: "normal" },
        ]}
      >
        {children}
      </NativeText>
    </Weight.Provider>
  );
});
export const TextInput = forwardRef<
  React.ComponentRef<typeof NativeTextInput>,
  TextInputProps
>(function TextInput({ style, ...props }, ref) {
  const weight = getWeight(StyleSheet.flatten(style)?.fontWeight, 400);
  return (
    <NativeTextInput
      ref={ref}
      {...props}
      style={[
        { fontFamily: families[weight] },
        style,
        { fontWeight: "normal" },
      ]}
    />
  );
});

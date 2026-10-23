import React, { forwardRef } from "react";
import {
  Text as NativeText,
  TextInput as NativeTextInput,
  StyleSheet,
  type TextProps,
  type TextInputProps,
} from "react-native";
// The original Flutter app requests an unbundled Jakarta family and renders Roboto.
// Bundle that same fallback font so browser and native text have matching metrics.
export const Text = forwardRef<
  React.ComponentRef<typeof NativeText>,
  TextProps
>(function Text({ style, ...props }, ref) {
  const flat = StyleSheet.flatten(style);
  const size = flat?.fontSize ?? 14;
  return (
    <NativeText
      ref={ref}
      {...props}
      style={[
        {
          fontFamily: "PickMeRoboto",
          fontSize: 14,
          lineHeight: size * (20 / 14),
          letterSpacing: 0.25,
          color: "#000000DE",
        },
        style,
      ]}
    />
  );
});
export const TextInput = forwardRef<
  React.ComponentRef<typeof NativeTextInput>,
  TextInputProps
>(function TextInput({ style, ...props }, ref) {
  const size = StyleSheet.flatten(style)?.fontSize ?? 16;
  return (
    <NativeTextInput
      ref={ref}
      {...props}
      style={[
        {
          fontFamily: "PickMeRoboto",
          fontSize: 16,
          lineHeight: size * 1.5,
          letterSpacing: 0.5,
          color: "#000000DE",
        },
        style,
      ]}
    />
  );
});

import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

interface Props extends TextInputProps {
  label: string;
  placeholder?: string;
}

const CustomInput = ({
  label,
  placeholder,
  secureTextEntry,
  ...rest
}: Props) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const stylesheet = getStyles(colors);

  const isPassword = secureTextEntry === true;

  return (
    <View style={stylesheet.container}>
      <Text style={stylesheet.label}>{label}</Text>
      <View style={[stylesheet.inputWrapper, isFocused && stylesheet.inputFocused]}>
        <TextInput
          style={stylesheet.input}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...rest}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={stylesheet.eyeBtn}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={22}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  container: { marginBottom: 16, width: "100%" },
  label: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
    fontWeight: "600",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.card,
  },
  input: {
    flex: 1,
    padding: 13,
    fontSize: 15,
    color: colors.text,
  },
  eyeBtn: {
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CustomInput;

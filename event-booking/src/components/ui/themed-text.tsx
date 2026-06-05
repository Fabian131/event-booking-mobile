import type { TextProps } from 'react-native';
import { StyleSheet, Text } from 'react-native';

type TextType = 'title' | 'defaultSemiBold' | 'link' | undefined;

interface ThemedTextProps extends TextProps {
  type?: TextType;
}

const typeStyles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#11181c',
  },
  defaultSemiBold: {
    fontSize: 15,
    fontWeight: '600',
    color: '#11181c',
  },
  link: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0a7ea4',
  },
  default: {
    fontSize: 15,
    color: '#11181c',
  },
});

export function ThemedText({ type, style, ...rest }: ThemedTextProps) {
  return (
    <Text
      style={[
        typeStyles[type || 'default'],
        style,
      ]}
      {...rest}
    />
  );
}

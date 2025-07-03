import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';

export const ThemedView: React.FC<ViewProps> = ({ style, ...props }) => {
  return <View style={[styles.default, style]} {...props} />;
};

const styles = StyleSheet.create({
  default: {
    padding: 16,
  },
});

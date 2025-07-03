import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const HelloWave: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🌊 Hello, Wave!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
  },
});

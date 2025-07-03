import React from 'react';
import { ScrollView, View, Image, StyleSheet } from 'react-native';

interface ParallaxScrollViewProps {
  headerBackgroundColor: { light: string; dark: string };
  headerImage: React.ReactNode;
  children: React.ReactNode;
}

const ParallaxScrollView: React.FC<ParallaxScrollViewProps> = ({
  headerBackgroundColor,
  headerImage,
  children,
}) => {
  return (
    <ScrollView>
      <View style={[styles.header, { backgroundColor: headerBackgroundColor.light }]}>
        {headerImage}
      </View>
      {children}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 200, // or whatever height you need
  },
});

export default ParallaxScrollView;

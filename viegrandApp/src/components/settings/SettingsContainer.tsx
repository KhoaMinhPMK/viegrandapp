import React from 'react';
import { ScrollView, StyleSheet, ViewStyle } from 'react-native';

interface SettingsContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function SettingsContainer({ children, style }: SettingsContainerProps) {
  return (
    <ScrollView
      style={[styles.container, style, {
        marginBottom: 0,
      }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Modern light gray background
  },
  contentContainer: {
    paddingVertical: 20,
  },
});

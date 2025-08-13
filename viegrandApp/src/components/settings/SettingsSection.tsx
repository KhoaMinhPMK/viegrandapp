import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface SettingsSectionProps {
  children: React.ReactNode;
  title?: string;
  style?: ViewStyle;
}

export function SettingsSection({ children, title, style }: SettingsSectionProps) {
  return (
    <View style={[styles.container, style]}>
      {title && <Text style={styles.title}>{title.toUpperCase()}</Text>}
      <View style={styles.sectionBody}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6D6D72', // iOS-like section header color
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionBody: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    overflow: 'hidden',
  },
});

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
    marginHorizontal: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  sectionBody: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
});

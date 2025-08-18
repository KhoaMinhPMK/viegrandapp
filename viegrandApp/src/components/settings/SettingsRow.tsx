import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ViewStyle,
  TextStyle,
  ColorValue,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

interface SettingsRowProps {
  icon?: string;
  iconColor?: string;
  iconBackgroundColor?: string;
  title: string;
  value?: string | boolean;
  type: 'navigation' | 'toggle' | 'button';
  onPress?: () => void;
  onValueChange?: (value: boolean) => void;
  isFirst?: boolean;
  isLast?: boolean;
  titleColor?: ColorValue;
  style?: ViewStyle;
}

export function SettingsRow(props: SettingsRowProps) {
  const {
    icon,
    iconColor = '#FFFFFF',
    iconBackgroundColor = '#CCCCCC',
    title,
    value,
    type,
    onPress,
    onValueChange,
    isLast,
    titleColor = '#1E293B',
  } = props;

  const renderValue = () => {
    if (type === 'navigation') {
      return (
        <View style={styles.valueContainer}>
          {typeof value === 'string' && (
            <Text style={styles.valueText} numberOfLines={1} ellipsizeMode="tail">
              {value}
            </Text>
          )}
          <View style={styles.chevronContainer}>
            <Feather name="chevron-right" size={18} color="#94A3B8" />
          </View>
        </View>
      );
    }
    if (type === 'toggle') {
      return (
        <Switch
          value={typeof value === 'boolean' ? value : false}
          onValueChange={onValueChange}
          trackColor={{ false: '#E2E8F0', true: '#3B82F6' }}
          thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
          ios_backgroundColor="#E2E8F0"
          style={styles.switch}
        />
      );
    }
    return null;
  };

  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={styles.touchable} 
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.container, isLast && styles.noBorder]}>
        {icon && (
          <View style={[styles.iconContainer, { backgroundColor: iconBackgroundColor }]}>
            <Feather name={icon as any} size={18} color={iconColor} />
          </View>
        )}
        <View style={styles.contentContainer}>
          <Text style={[styles.title, { color: titleColor }]} numberOfLines={1} ellipsizeMode="tail">
            {title}
          </Text>
        </View>
        {renderValue()}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: {
    backgroundColor: '#FFFFFF',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F1F5F9',
    minHeight: 64,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contentContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '40%',
  },
  valueText: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
    marginRight: 8,
    textAlign: 'right',
  },
  chevronContainer: {
    opacity: 0.6,
  },
  switch: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },
});

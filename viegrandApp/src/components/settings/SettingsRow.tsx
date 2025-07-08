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
    titleColor = '#000000',
  } = props;

  const renderValue = () => {
    if (type === 'navigation') {
      return (
        <View style={styles.valueContainer}>
          {typeof value === 'string' && <Text style={styles.valueText}>{value}</Text>}
          <Feather name="chevron-right" size={20} color="#C7C7CC" />
        </View>
      );
    }
    if (type === 'toggle') {
      return (
        <Switch
          value={typeof value === 'boolean' ? value : false}
          onValueChange={onValueChange}
          trackColor={{ false: '#767577', true: '#0D4C92' }}
          thumbColor={value ? '#FFFFFF' : '#f4f3f4'}
        />
      );
    }
    return null;
  };

  return (
    <TouchableOpacity onPress={onPress} style={styles.touchable} disabled={!onPress}>
      <View style={[styles.container, isLast && styles.noBorder]}>
        {icon && (
          <View style={[styles.iconContainer, { backgroundColor: iconBackgroundColor }]}>
            <Feather name={icon as any} size={20} color={iconColor} />
          </View>
        )}
        <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C7C7CC',
    marginLeft: 16, // to align with section title
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  title: {
    fontSize: 17,
    flex: 1,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 17,
    color: '#8E8E93',
    marginRight: 8,
  },
});

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface AvatarProps {
  name: string;
  size?: number;
  backgroundColor?: string;
  textColor?: string;
  style?: ViewStyle;
}

const Avatar: React.FC<AvatarProps> = ({ 
  name, 
  size = 40, 
  backgroundColor, 
  textColor = '#FFFFFF',
  style 
}) => {
  
  const getInitials = (fullName: string): string => {
    const words = fullName.trim().split(' ').filter(word => word.length > 0);
    
    if (words.length >= 2) {
      // Lấy chữ cái đầu của từ đầu tiên và từ cuối cùng
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    } else if (words.length === 1) {
      // Nếu chỉ có 1 từ, lấy 2 chữ cái đầu
      return words[0].slice(0, 2).toUpperCase();
    }
    
    return '??';
  };

  const getBackgroundColor = (name: string): string => {
    if (backgroundColor) return backgroundColor;
    
    // Tạo màu dựa trên tên để consistent
    const colors = [
      '#FF6B35', // Orange
      '#007AFF', // Blue
      '#28A745', // Green
      '#DC3545', // Red
      '#6F42C1', // Purple
      '#FD7E14', // Amber
      '#20C997', // Teal
      '#E83E8C', // Pink
      '#6C757D', // Gray
      '#17A2B8', // Cyan
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const initials = getInitials(name);
  const bgColor = getBackgroundColor(name);
  const fontSize = size * 0.4; // Tỷ lệ font phù hợp với kích thước avatar

  return (
    <View 
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bgColor,
        },
        style
      ]}
    >
      <Text 
        style={[
          styles.text,
          {
            fontSize,
            color: textColor,
          }
        ]}
      >
        {initials}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default Avatar; 
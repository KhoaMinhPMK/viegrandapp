import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Vibration,
  Platform,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

interface ReminderItemProps {
  reminder: {
    id: string;
    type: 'medicine' | 'exercise' | 'appointment' | 'call';
    title: string;
    time: string;
    date: string;
    content: string;
    isCompleted: boolean;
  };
  onMarkCompleted: (id: string) => void;
}

const ReminderItem: React.FC<ReminderItemProps> = ({ reminder, onMarkCompleted }) => {
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const iconRotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'medicine':
        return 'heart';
      case 'exercise':
        return 'activity';
      case 'appointment':
        return 'calendar';
      case 'call':
        return 'phone';
      default:
        return 'bell';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'medicine':
        return '#0D4C92';
      case 'exercise':
        return '#1E88E5';
      case 'appointment':
        return '#42A5F5';
      case 'call':
        return '#64B5F6';
      default:
        return '#90CAF9';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'medicine':
        return '#E3F2FD';
      case 'exercise':
        return '#E8F4FD';
      case 'appointment':
        return '#F3F9FF';
      case 'call':
        return '#F8FBFF';
      default:
        return '#F5F9FF';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'medicine':
        return 'Thuốc';
      case 'exercise':
        return 'Tập luyện';
      case 'appointment':
        return 'Hẹn khám';
      case 'call':
        return 'Cuộc gọi';
      default:
        return 'Nhắc nhở';
    }
  };

  const handleMarkCompleted = () => {
    // Haptic feedback
    if (Platform.OS === 'ios') {
      Vibration.vibrate();
    }

    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Icon rotation animation
    Animated.sequence([
      Animated.timing(iconRotateAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(iconRotateAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    onMarkCompleted(reminder.id);
  };

  const iconRotation = iconRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View 
      style={[
        styles.container,
        reminder.isCompleted && styles.completedContainer,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        }
      ]}
    >
      {/* Icon and Type Badge */}
      <View style={styles.leftSection}>
        <Animated.View 
          style={[
            styles.iconContainer,
            { 
              backgroundColor: getTypeColor(reminder.type),
              transform: [{ rotate: iconRotation }]
            }
          ]}
        >
          <Feather 
            name={getTypeIcon(reminder.type)} 
            size={18} 
            color={getIconColor(reminder.type)} 
          />
        </Animated.View>
        <View style={[styles.typeBadge, { backgroundColor: getIconColor(reminder.type) + '15' }]}>
          <Text style={[styles.typeLabel, { color: getIconColor(reminder.type) }]}>
            {getTypeLabel(reminder.type)}
          </Text>
        </View>
      </View>
      
      {/* Content */}
      <View style={styles.contentContainer}>
        <Text style={[
          styles.title,
          reminder.isCompleted && styles.completedText
        ]}>
          {reminder.title}
        </Text>
        <View style={styles.timeContainer}>
          <Feather name="clock" size={12} color="#8E8E93" />
          <Text style={[
            styles.time,
            reminder.isCompleted && styles.completedText
          ]}>
            {reminder.time} • {reminder.date}
          </Text>
        </View>
        <Text style={[
          styles.content,
          reminder.isCompleted && styles.completedText
        ]} numberOfLines={2}>
          {reminder.content}
        </Text>
      </View>

      {/* Action */}
      <View style={styles.actionContainer}>
        {!reminder.isCompleted ? (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleMarkCompleted}
            activeOpacity={0.8}
          >
            <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
              <Feather name="check" size={16} color="#FFFFFF" />
            </Animated.View>
            <Text style={styles.completeButtonText}>Hoàn thành</Text>
          </TouchableOpacity>
        ) : (
          <Animated.View 
            style={[
              styles.completedBadge,
              { transform: [{ scale: scaleAnim }] }
            ]}
          >
            <Feather name="check-circle" size={20} color="#0D4C92" />
            <Text style={styles.completedBadgeText}>Đã hoàn thành</Text>
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  completedContainer: {
    backgroundColor: '#F8FAFF',
    opacity: 0.7,
  },
  leftSection: {
    alignItems: 'center',
    marginRight: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
  },
  typeLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  contentContainer: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 6,
    lineHeight: 22,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  time: {
    fontSize: 13,
    color: '#8E8E93',
    marginLeft: 4,
    fontWeight: '500',
  },
  content: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    fontWeight: '400',
  },
  completedText: {
    color: '#8E8E93',
    textDecorationLine: 'line-through',
  },
  actionContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minHeight: 44,
  },
  completeButton: {
    backgroundColor: '#0D4C92',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: '#0D4C92',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  completedBadge: {
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    flexDirection: 'row',
  },
  completedBadgeText: {
    color: '#0D4C92',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default ReminderItem; 
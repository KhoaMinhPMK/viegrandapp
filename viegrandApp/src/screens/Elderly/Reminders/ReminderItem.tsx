import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
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

  const handleMarkCompleted = () => {
    onMarkCompleted(reminder.id);
  };

  return (
    <View style={[
      styles.container,
      reminder.isCompleted && styles.completedContainer
    ]}>
      {/* Icon */}
      <View style={[
        styles.iconContainer,
        { backgroundColor: getTypeColor(reminder.type) }
      ]}>
        <Feather 
          name={getTypeIcon(reminder.type)} 
          size={20} 
          color={getIconColor(reminder.type)} 
        />
      </View>
      
      {/* Content */}
      <View style={styles.contentContainer}>
        <Text style={[
          styles.title,
          reminder.isCompleted && styles.completedText
        ]}>
          {reminder.title}
        </Text>
        <Text style={[
          styles.time,
          reminder.isCompleted && styles.completedText
        ]}>
          {reminder.time} • {reminder.date}
        </Text>
        <Text style={[
          styles.content,
          reminder.isCompleted && styles.completedText
        ]}>
          {reminder.content}
        </Text>
      </View>

      {/* Action */}
      <View style={styles.actionContainer}>
        {!reminder.isCompleted ? (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleMarkCompleted}
            activeOpacity={0.7}
          >
            <Text style={styles.completeButtonText}>Hoàn thành</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.completedBadge}>
            <Text style={styles.completedBadgeText}>✓</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedContainer: {
    backgroundColor: '#F2F2F7',
    opacity: 0.6,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },

  contentContainer: {
    flex: 1,
  },
  actionContainer: {
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  time: {
    fontSize: 15,
    color: '#8E8E93',
    marginBottom: 6,
  },
  content: {
    fontSize: 15,
    color: '#3C3C43',
    lineHeight: 20,
  },
  completedText: {
    color: '#8E8E93',
    textDecorationLine: 'line-through',
  },
  completeButton: {
    backgroundColor: '#0D4C92',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  completedBadge: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedBadgeText: {
    color: '#0D4C92',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReminderItem; 
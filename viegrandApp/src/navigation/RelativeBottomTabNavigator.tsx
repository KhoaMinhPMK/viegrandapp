import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

import RelativeHomeScreen from '../screens/Relative/Home';
import RelativeSettingsScreen from '../screens/Relative/Settings';
import { RelativeBottomTabParamList } from '../types/navigation';
import MessageNavigator from './MessageNavigator';

const Tab = createBottomTabNavigator<RelativeBottomTabParamList>();

const RelativeBottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Message':
              iconName = 'message-square';
              break;
            case 'Settings':
              iconName = 'settings';
              break;
            default:
              iconName = 'circle';
          }

          return (
            <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
              <Feather 
                name={iconName} 
                size={focused ? 26 : 24} 
                color={color} 
              />
            </View>
          );
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={RelativeHomeScreen}
        options={{
          tabBarLabel: 'Trang chủ',
        }}
      />
      <Tab.Screen 
        name="Message" 
        component={MessageNavigator}
        options={{
          tabBarLabel: 'Tin nhắn',
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={RelativeSettingsScreen}
        options={{
          tabBarLabel: 'Cài đặt',
        }}
      />

    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingBottom: 8,
    paddingTop: 8,
    height: 84,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  iconContainerFocused: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
});

export default RelativeBottomTabNavigator; 
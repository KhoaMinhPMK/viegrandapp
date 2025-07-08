import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, TouchableOpacity, Dimensions, Platform, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import HomeScreen from '../screens/Elderly/Home';
import ProfileScreen from '../screens/Elderly/Profile';
import PhoneScreen from '../screens/Elderly/Phone';
import MessageScreen from '../screens/Elderly/Message';
import ElderlySettingsScreen from '../screens/Elderly/Settings';
import Icon from 'react-native-vector-icons/Ionicons';
import SettingsNavigator from './SettingsNavigator';

// Import voice components
import { useVoice } from '../contexts/VoiceContext';

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');
const isIOS = Platform.OS === 'ios';

const CenterButton = () => {
  const { isListening, startListening, stopListening } = useVoice();
  
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={isListening ? stopListening : startListening}
      style={styles.centerButtonTouchable}
    >
      <LinearGradient
        colors={['#0EA5E9', '#0369A1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.centerButtonGradient}
      >
        <Feather 
          name={isListening ? "mic-off" : "mic"} 
          size={26} 
          color="#FFFFFF" 
        />
      </LinearGradient>
    </TouchableOpacity>
  );
};

const TabBarItem = ({ 
  isFocused, 
  icon 
}: { 
  isFocused: boolean; 
  icon: string;
}) => {
  return (
    <View style={styles.tabItemContainer}>
      {isFocused ? (
        <LinearGradient
          colors={['#0EA5E9', '#0369A1']}
          style={styles.activeIconBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Feather name={icon} size={20} color="#FFFFFF" />
        </LinearGradient>
      ) : (
        <Feather name={icon} size={22} color="#94A3B8" />
      )}
    </View>
  );
};

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  return (
    <View style={styles.tabBarContainer}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        if (index === 2) {
          return (
            <CenterButton
              key={route.key}
            />
          );
        }

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tabButton}
            onPress={onPress}
            activeOpacity={0.7}
          >
            {options.tabBarIcon && options.tabBarIcon({ focused: isFocused })}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const SOSButton = ({onPress}: {onPress: () => void}) => (
  <TouchableOpacity style={styles.sosButtonContainer} onPress={onPress}>
    <View style={styles.sosButton}>
      <Feather name="shield" size={32} color="#FFFFFF" />
      <Text style={styles.sosButtonText}>SOS</Text>
    </View>
  </TouchableOpacity>
);

const ElderlyBottomTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarItem 
              isFocused={focused}
              icon="home"
            />
          )
        }}
      />
      <Tab.Screen 
        name="Message" 
        component={MessageScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarItem 
              isFocused={focused}
              icon="message-square"
            />
          )
        }}
      />
      <Tab.Screen
        name="CenterAction"
        component={() => null}
        options={{
          tabBarIcon: () => null
        }}
      />
      <Tab.Screen 
        name="Phone" 
        component={PhoneScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarItem 
              isFocused={focused}
              icon="phone"
            />
          )
        }}
      />
      <Tab.Screen 
        name="Settings"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarItem 
              isFocused={focused}
              icon="settings"
            />
          )
        }}
      >
        {() => <SettingsNavigator initialRouteName="ElderlySettings" />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

const PlaceholderScreen = () => <View />;

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 25,
    left: 15,
    right: 15,
    height: 60,
    backgroundColor: isIOS ? 'rgba(255, 255, 255, 0.95)' : '#FFFFFF',
    borderRadius: 24,
    elevation: 12,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 0,
    ...(isIOS && {
      borderWidth: 0.5,
      borderColor: 'rgba(203, 213, 225, 0.3)',
    }),
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
  },
  tabItemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconBackground: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0369A1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  centerButtonTouchable: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
    position: 'relative',
    top: -20,
  },
  centerButtonGradient: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sosButtonContainer: {
    top: -30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sosButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 12,
    shadowColor: '#FF3B30',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.4,
    shadowRadius: 12,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  sosButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
});

export default ElderlyBottomTabNavigator; 
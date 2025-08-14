import React, { useState, useCallback, memo } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, TouchableOpacity, Dimensions, Platform, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import RelativeHomeScreen from '../screens/Relative/Home';
import RelativeSettingsScreen from '../screens/Relative/Settings';
import { RelativeBottomTabParamList } from '../types/navigation';
import MessageNavigator from './MessageNavigator';

const Tab = createBottomTabNavigator<RelativeBottomTabParamList>();
const { width } = Dimensions.get('window');
const isIOS = Platform.OS === 'ios';

// --- Tách các component con ra ngoài và sử dụng React.memo ---

const TabBarItem = memo(({
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
});

const CustomTabBar = memo(({ state, descriptors, navigation }: any) => {
  // For relative users, always show the tab bar
  // Only hide when in Chat screen for better UX
  const currentRouteName = state.routes[state.index].name;

  // Get the current route from MessageNavigator to check if we're in Chat
  const currentRoute = state.routes.find((route: any) => route.name === 'Message');
  const currentMessageScreen = currentRoute?.state?.routes?.[currentRoute.state.index]?.name;

  // Only hide tab bar when in Chat screen
  if (currentMessageScreen === 'Chat') {
    return null;
  }

  const renderTab = useCallback((route: any, index: number) => {
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
  }, [state, descriptors, navigation]);

  return (
    <View style={styles.tabBarContainer}>
      {state.routes.map(renderTab)}
    </View>
  );
});

const renderSettingsNavigator = () => <RelativeSettingsScreen />;

// --- Component chính ---

const RelativeBottomTabNavigator = () => {

  const renderTabBarIcon = useCallback((iconName: string) =>
    ({ focused }: { focused: boolean }) =>
      <TabBarItem isFocused={focused} icon={iconName} />,
    []
  );

  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={RelativeHomeScreen}
        options={{
          tabBarIcon: renderTabBarIcon('home')
        }}
      />
      <Tab.Screen
        name="Message"
        component={MessageNavigator}
        options={{
          tabBarIcon: renderTabBarIcon('message-square'),
        }}
      />
      <Tab.Screen
        name="Settings"
        options={{
          tabBarIcon: renderTabBarIcon('settings')
        }}
      >
        {() => <RelativeSettingsScreen />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

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
    paddingHorizontal: 10, // Thêm padding để các tab không quá sát nhau
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
    minWidth: 40, // Đảm bảo tab button có kích thước tối thiểu
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
});

export default RelativeBottomTabNavigator; 
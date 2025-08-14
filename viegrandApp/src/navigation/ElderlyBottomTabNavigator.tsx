import React, { useState, useCallback, memo } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, TouchableOpacity, Dimensions, Platform, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import HomeScreen from '../screens/Elderly/Home';
import ProfileScreen from '../screens/Elderly/Profile';
import PhoneScreen from '../screens/Elderly/Phone';
import MessageScreen from '../screens/Elderly/Message';
import MessageNavigator from './MessageNavigator'; // Import the new navigator
import ElderlySettingsScreen from '../screens/Elderly/Settings';
import HealthCheckScreen from '../screens/Elderly/Health/HealthCheckScreen';

import SettingsNavigator from './SettingsNavigator';
import HomeNavigator from './HomeNavigator';

const Tab = createBottomTabNavigator();
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
  // Ẩn tab bar khi đang ở trong Message tab hoặc các màn hình đọc sách/game
  // để có trải nghiệm full-screen tốt hơn
  const currentRouteName = state.routes[state.index].name;
  
  // Lấy route hiện tại từ HomeStack để kiểm tra các màn hình con
  const currentRoute = state.routes.find((route: any) => route.name === 'HomeStack');
  const homeScreenName = currentRoute?.state?.routes?.[currentRoute.state.index]?.name;
  
  // Lấy route hiện tại từ Message tab để kiểm tra chat
  const messageRoute = state.routes.find((route: any) => route.name === 'Message');
  const messageScreenName = messageRoute?.state?.routes?.[messageRoute.state.index]?.name;
  
  // Debug log để kiểm tra
  console.log('📱 TabBar Debug:', {
    currentRouteName,
    homeScreenName,
    messageScreenName
  });
  
  // Danh sách các màn hình cần ẩn tab bar
  const hideTabBarScreens = [
    'Chat', // Chỉ ẩn khi ở trong chat conversation, không ẩn MessageList
    'BookLibrary',
    'BookDetail',
    'BookReader',
    'BookSettings',
    'BookBookmark',
    'BookStats',
    'EntertainmentHub', // Ẩn tab bar khi ở EntertainmentHub để có trải nghiệm tốt hơn
    'GameHub', // Ẩn tab bar khi ở GameHub
    'HealthCheck' // Ẩn tab bar khi ở màn hình health check chi tiết
  ];
  
  // Kiểm tra nếu đang ở các màn hình cần ẩn tab bar
  if (hideTabBarScreens.includes(homeScreenName) || hideTabBarScreens.includes(messageScreenName)) {
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

    if (index === 2) { // Nút micro ở vị trí thứ 3
      return null; // Removed CenterButton
    }



    // Nút sức khỏe ở vị trí thứ 4 (sau micro)
    if (index === 3 && route.name === 'Health') {
      return (
        <TouchableOpacity
          key={route.key}
          style={styles.tabButton}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <TabBarItem isFocused={isFocused} icon="heart" />
        </TouchableOpacity>
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
  }, [state, descriptors, navigation]);

  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.leftTabGroup}>
        {state.routes.slice(0, 2).map((route: any, globalIndex: number) => renderTab(route, globalIndex))}
      </View>
      
      <View style={styles.centerSpacing} />
      
      <View style={styles.rightTabGroup}>
        {state.routes.slice(3).map((route: any, localIndex: number) => renderTab(route, localIndex + 3))}
      </View>
    </View>
  );
});

const SOSButton = memo(({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity style={styles.sosButtonContainer} onPress={onPress}>
    <View style={styles.sosButton}>
      <Feather name="shield" size={32} color="#FFFFFF" />
      <Text style={styles.sosButtonText}>SOS</Text>
    </View>
  </TouchableOpacity>
));

const PlaceholderComponent = () => null;

const renderSettingsNavigator = () => <SettingsNavigator initialRouteName="ElderlySettings" />;

// --- Component chính ---

const ElderlyBottomTabNavigator = () => {

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
        name="HomeStack" // Renamed from "Home" to reflect it's a stack
        component={HomeNavigator}
        options={{
          tabBarIcon: renderTabBarIcon('home')
        }}
      />
      <Tab.Screen
        name="Message"
        component={MessageNavigator} // Replace MessageScreen with MessageNavigator
        options={{
          tabBarIcon: renderTabBarIcon('message-square'),
        }}
      />
      <Tab.Screen
        name="CenterAction"
        component={PlaceholderComponent} // Sử dụng component rỗng
        options={{
          tabBarIcon: () => null
        }}
      />

      <Tab.Screen 
        name="Health" 
        component={HealthCheckScreen}
        options={{
          tabBarIcon: renderTabBarIcon('heart'),
        }}
      />
      <Tab.Screen
        name="Settings"
        options={{
          tabBarIcon: renderTabBarIcon('settings')
        }}
      >
        {() => <SettingsNavigator initialRouteName="ElderlySettings" />}
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
    justifyContent: 'space-between',
    borderTopWidth: 0,
    paddingHorizontal: 20,
    ...(isIOS && {
      borderWidth: 0.5,
      borderColor: 'rgba(203, 213, 225, 0.3)',
    }),
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    paddingHorizontal: 12,
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
    shadowOffset: { width: 0, height: 8 },
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
  leftTabGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    paddingRight: 15, // Space before center
  },
  centerSpacing: {
    width: 60, // Wider space for voice button area
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightTabGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    paddingLeft: 15, // Space after center
  },
});

export default ElderlyBottomTabNavigator; 
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import Feather from 'react-native-vector-icons/Feather';

// Screens
import HomeScreen from '../screens/Elderly/Home';
import EntertainmentHubScreen from '../screens/Elderly/Entertainment/EntertainmentHubScreen';
import GameHubScreen from '../screens/Elderly/Entertainment/GameHubScreen';
import SudokuScreen from '../screens/Games/Sudoku';
import MinesweeperScreen from '../screens/Games/Minesweeper';
import MemoryMatchScreen from '../screens/Games/MemoryMatch';
import NotificationsScreen from '../screens/Elderly/Notifications';
import EditProfileScreen from '../screens/Profile/EditProfileScreen';

// Navigators
import PremiumNavigator from './PremiumNavigator';

const Stack = createStackNavigator();

const CustomBackButton = ({ onPress }: { onPress: () => void }) => (
    <TouchableOpacity onPress={onPress} style={styles.backButton}>
      <BlurView
        style={styles.blurView}
        blurType="light"
        blurAmount={10}
        reducedTransparencyFallbackColor="white"
      />
      <Feather name="chevron-left" size={24} color="#000" />
    </TouchableOpacity>
);

const HomeNavigator = () => {
  return (
    <Stack.Navigator
        screenOptions={({ navigation }) => ({
            headerShown: true,
            headerTransparent: true,
            headerTitle: '',
            headerLeft: () => <CustomBackButton onPress={() => navigation.goBack()} />,
        })}
    >
      <Stack.Screen 
        name="ElderlyHomeScreen" 
        component={HomeScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen name="EntertainmentHub" component={EntertainmentHubScreen} />
      <Stack.Screen name="GameHub" component={GameHubScreen} options={{ headerShown: false }}/>
      <Stack.Screen 
        name="Sudoku" 
        component={SudokuScreen}
        options={{ headerShown: false }} // Ẩn header của stack, dùng header tùy chỉnh trong game
      />
      <Stack.Screen 
        name="Minesweeper" 
        component={MinesweeperScreen} 
        options={{ headerTitle: 'Dò mìn' }}
      />
      <Stack.Screen name="MemoryMatch" component={MemoryMatchScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Premium" component={PremiumNavigator} />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
        options={{ 
          presentation: 'modal',
          headerShown: false, // Modal tự có nút đóng
        }} 
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
    backButton: {
        marginLeft: 16,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    blurView: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
});


export default HomeNavigator; 
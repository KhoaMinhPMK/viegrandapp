import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import Feather from 'react-native-vector-icons/Feather';

// Screens
import HomeScreen from '../screens/Elderly/Home';
import FamilyScreen from '../screens/Elderly/Family';
import EntertainmentHubScreen from '../screens/Elderly/Entertainment/EntertainmentHubScreen';
import GameHubScreen from '../screens/Elderly/Entertainment/GameHubScreen';
import BookLibraryScreen from '../screens/Elderly/Entertainment/BookLibraryScreen';
import BookReaderScreen from '../screens/Elderly/Entertainment/BookReaderScreen';
import BookDetailScreen from '../screens/Elderly/Entertainment/BookDetailScreen';
import BookSettingsScreen from '../screens/Elderly/Entertainment/BookSettingsScreen';
import BookBookmarkScreen from '../screens/Elderly/Entertainment/BookBookmarkScreen';
import BookStatsScreen from '../screens/Elderly/Entertainment/BookStatsScreen';
import SudokuScreen from '../screens/Games/Sudoku';
import MinesweeperScreen from '../screens/Games/Minesweeper';
import MemoryMatchScreen from '../screens/Games/MemoryMatch';
import WordSearchScreen from '../screens/Games/WordSearch';
import NotificationsScreen from '../screens/Elderly/Notifications';
import EditProfileScreen from '../screens/Profile/EditProfileScreen';

// Navigators
// Premium Navigator moved to ElderlyNavigator level

const Stack = createStackNavigator();

const CustomBackButton = ({ onPress }: { onPress: () => void }) => (
    <TouchableOpacity onPress={onPress} style={styles.backButton}>
      <BlurView
        style={styles.blurView}
        blurType="light"
        blurAmount={10}
        reducedTransparencyFallbackColor="white"
      />
      <Feather name="chevron-left" size={24} color="#007AFF" />
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
      <Stack.Screen 
        name="Family" 
        component={FamilyScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen name="EntertainmentHub" component={EntertainmentHubScreen} />
      <Stack.Screen name="GameHub" component={GameHubScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="BookLibrary" component={BookLibraryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="BookDetail" component={BookDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="BookReader" component={BookReaderScreen} options={{ headerShown: false }} />
      <Stack.Screen name="BookSettings" component={BookSettingsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="BookBookmark" component={BookBookmarkScreen} options={{ headerShown: false }} />
      <Stack.Screen name="BookStats" component={BookStatsScreen} options={{ headerShown: false }} />
      <Stack.Screen 
        name="Sudoku" 
        component={SudokuScreen}
        options={{ headerShown: false }} // Ẩn header của stack, dùng header tùy chỉnh trong game
      />
      <Stack.Screen 
        name="Minesweeper" 
        component={MinesweeperScreen} 
        options={{ headerShown: false }} // Ẩn header để full-screen game experience
      />
      <Stack.Screen 
        name="MemoryMatch" 
        component={MemoryMatchScreen}
        options={{ headerShown: false }} // Ẩn header để full-screen game experience
      />
      <Stack.Screen 
        name="WordSearch" 
        component={WordSearchScreen}
        options={{ headerShown: false }} // Ẩn header để full-screen game experience
      />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
        options={{ headerShown: false }}
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
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigationState } from '@react-navigation/native';

import ElderlyBottomTabNavigator from './ElderlyBottomTabNavigator';
import HealthCheckScreen from '../screens/Elderly/Health/HealthCheckScreen';
import RemindersScreen from '../screens/Elderly/Reminders';
import VideoPlayerScreen from '../screens/Elderly/Entertainment/VideoPlayerScreen';
import VideoDetailScreen from '../screens/Elderly/Entertainment/VideoDetailScreen';
import EntertainmentHubScreen from '../screens/Elderly/Entertainment/EntertainmentHubScreen';
import GameHubScreen from '../screens/Elderly/Entertainment/GameHubScreen';
import BookLibraryScreen from '../screens/Elderly/Entertainment/BookLibraryScreen';
import BookDetailScreen from '../screens/Elderly/Entertainment/BookDetailScreen';
import BookReaderScreen from '../screens/Elderly/Entertainment/BookReaderScreen';
import BookSettingsScreen from '../screens/Elderly/Entertainment/BookSettingsScreen';
import BookStatsScreen from '../screens/Elderly/Entertainment/BookStatsScreen';
import BookBookmarkScreen from '../screens/Elderly/Entertainment/BookBookmarkScreen';
import PremiumNavigator from './PremiumNavigator';
import PremiumManagementScreen from '../screens/Premium/PremiumManagementScreen';
import RestrictedContentSettingsScreen from '../screens/Elderly/Settings/RestrictedContentSettingsScreen';
import ElderlyPremiumInfoScreen from '../screens/Elderly/Premium/ElderlyPremiumInfoScreen';
import VoiceHelpScreen from '../screens/Elderly/Settings/VoiceHelpScreen';
import ChangePasswordScreen from '../screens/Elderly/Settings/ChangePasswordScreen';
import FloatingVoiceButton from '../components/elderly-home/FloatingVoiceButton';
import { VoiceButtonProvider } from '../contexts/VoiceButtonContext';

const Stack = createStackNavigator();

function getActiveRouteNameFromState(state: any): string | undefined {
	if (!state || !state.routes || typeof state.index !== 'number') return undefined;
	
	// Debug full state
	console.log('🔍 Navigation State Debug:', JSON.stringify(state, null, 2));
	
	let route = state.routes[state.index];
	console.log('🔍 Current route:', route?.name);
	
	while (route && route.state && route.state.routes && typeof route.state.index === 'number') {
		route = route.state.routes[route.state.index];
		console.log('🔍 Nested route:', route?.name);
	}
	
	console.log('🔍 Final active route:', route?.name);
	return route?.name;
}

const ElderlyNavigator = () => {
	const activeRouteName = useNavigationState((state) => getActiveRouteNameFromState(state));
	const shouldShowVoice = activeRouteName !== 'Chat';

	// Debug logs to see what's happening
	console.log('🎯 ElderlyNavigator Debug:', {
		activeRouteName,
		shouldShowVoice
	});

	return (
		<VoiceButtonProvider>
			<Stack.Navigator>
				<Stack.Screen 
					name="Main" 
					component={ElderlyBottomTabNavigator} 
					options={{ headerShown: false }}
				/>
				<Stack.Screen 
					name="HealthCheck" 
					component={HealthCheckScreen} 
					options={{ headerShown: false }}
				/>
				<Stack.Screen 
					name="Reminders" 
					component={RemindersScreen} 
					options={{ headerShown: false }}
				/>
				<Stack.Screen 
					name="VideoPlayer" 
					component={VideoPlayerScreen} 
					options={{ headerShown: false }}
				/>
				<Stack.Screen 
					name="VideoDetail" 
					component={VideoDetailScreen} 
					options={{ headerShown: false }}
				/>
				<Stack.Screen 
					name="EntertainmentHub" 
					component={EntertainmentHubScreen} 
					options={{ headerShown: false }}
				/>
				<Stack.Screen 
					name="GameHub" 
					component={GameHubScreen} 
					options={{ headerShown: false }}
				/>
				<Stack.Screen 
					name="BookLibrary" 
					component={BookLibraryScreen} 
					options={{ headerShown: false }}
				/>
				<Stack.Screen 
					name="BookDetail" 
					component={BookDetailScreen} 
					options={{ headerShown: false }}
				/>
				<Stack.Screen 
					name="BookReader" 
					component={BookReaderScreen} 
					options={{ headerShown: false }}
				/>
				<Stack.Screen 
					name="BookSettings" 
					component={BookSettingsScreen} 
					options={{ headerShown: false }}
				/>
				<Stack.Screen 
					name="BookStats" 
					component={BookStatsScreen} 
					options={{ headerShown: false }}
				/>
				<Stack.Screen 
					name="BookBookmark" 
					component={BookBookmarkScreen} 
					options={{ headerShown: false }}
				/>
				{/* Premium Navigator - Full screen without bottom tabs */}
				<Stack.Screen 
					name="Premium" 
					component={PremiumNavigator} 
					options={{ headerShown: false }}
				/>
				{/* Settings Screens */}
				<Stack.Screen 
					name="RestrictedContentSettings" 
					component={RestrictedContentSettingsScreen} 
					options={{ headerShown: false }}
				/>
				{/* Premium Info Screen */}
				<Stack.Screen 
					name="ElderlyPremiumInfo" 
					component={ElderlyPremiumInfoScreen} 
					options={{ headerShown: false }}
				/>
				{/* Voice Help Screen */}
				<Stack.Screen 
					name="VoiceHelp" 
					component={VoiceHelpScreen} 
					options={{ headerShown: false }}
				/>
				{/* Change Password Screen */}
				<Stack.Screen 
					name="ChangePassword" 
					component={ChangePasswordScreen} 
					options={{ headerShown: false }}
				/>
			</Stack.Navigator>

			{/* Voice Button - only show when not in Chat */}
			{shouldShowVoice && (
				<>
					{console.log('🎤 Rendering FloatingVoiceButton')}
					<FloatingVoiceButton variant="centerDocked" />
				</>
			)}
		</VoiceButtonProvider>
	);
};

export default ElderlyNavigator;

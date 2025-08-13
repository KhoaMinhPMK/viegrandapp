import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MessageScreen from '../screens/Elderly/Message';
import ChatScreen, { MessageStackParamList } from '../screens/Elderly/Message/ChatScreen';

const Stack = createNativeStackNavigator<MessageStackParamList>();

const MessageNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MessageList" component={MessageScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
};

export default MessageNavigator; 
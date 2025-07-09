import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { BlurView } from '@react-native-community/blur';
import { useVoice } from '../../contexts/VoiceContext';

const VoiceTranscript = memo(() => {
  const { isListening, stopListening, results, error, clearResults } = useVoice();
  const [isVisible, setIsVisible] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isListening) {
      setIsVisible(true);
      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else if (results.length > 0) {
      setIsVisible(true);
    } else {
      Animated.timing(animation, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start(() => setIsVisible(false));
    }
  }, [isListening, results, animation]);
  
  const handleProcessVoice = useCallback(() => {
    if (results.length > 0) {
      const command = results[0];
      console.log('Lệnh thoại đã nhận:', command);
      // Xử lý lệnh ở đây
    }
    clearResults();
  }, [results, clearResults]);

  const handleCancelVoice = useCallback(() => {
    stopListening();
    clearResults();
  }, [stopListening, clearResults]);

  const animatedStyle = {
    opacity: animation,
    transform: [{ translateY: animation.interpolate({ inputRange: [0, 1], outputRange: [100, 0] }) }],
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View style={[styles.transcriptContainer, animatedStyle]}>
      <BlurView style={styles.absolute} blurType="light" blurAmount={10} reducedTransparencyFallbackColor="white" />
      <Text style={styles.transcriptText} numberOfLines={3}>{results[0] || 'Đang nghe...'}</Text>
      {error && <Text style={styles.errorText}>{error}</Text>}
      {!isListening && results.length > 0 && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleCancelVoice}>
            <Feather name="x" size={24} color="#555" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.processButton]} onPress={handleProcessVoice}>
            <Feather name="check" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
    transcriptContainer: { 
        position: 'absolute', 
        bottom: 100, 
        left: 20, 
        right: 20, 
        borderRadius: 20, 
        overflow: 'hidden', 
        elevation: 10, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: -4 }, 
        shadowOpacity: 0.1, 
        shadowRadius: 8, 
        borderTopColor: 'rgba(0,0,0,0.1)' 
    },
    absolute: { 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        bottom: 0, 
        right: 0 
    },
    transcriptText: { 
        fontSize: 18, 
        color: '#000', 
        padding: 20, 
        textAlign: 'center', 
        fontWeight: '500' 
    },
    errorText: { 
        fontSize: 14, 
        color: '#D93B3B', 
        textAlign: 'center', 
        paddingHorizontal: 20, 
        paddingBottom: 10 
    },
    actionsContainer: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        padding: 15, 
        borderTopWidth: 1, 
        borderTopColor: 'rgba(0,0,0,0.1)' 
    },
    actionButton: { 
        width: 50, 
        height: 50, 
        borderRadius: 25, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: 'rgba(255,255,255,0.7)' 
    },
    processButton: { 
        backgroundColor: '#007AFF' 
    },
});

export default VoiceTranscript; 
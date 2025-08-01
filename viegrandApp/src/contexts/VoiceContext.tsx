import React, { createContext, useState, useEffect, useContext } from 'react';
import Voice, { SpeechResultsEvent, SpeechErrorEvent } from '@react-native-voice/voice';
import { Alert, Platform, PermissionsAndroid, NativeEventEmitter, NativeModules } from 'react-native';

interface VoiceContextProps {
  isListening: boolean;
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  results: string[];
  error: string | null;
  clearResults: () => void;
}

const VoiceContext = createContext<VoiceContextProps | undefined>(undefined);

export const VoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isListening, setIsListening] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Khởi tạo Voice với NativeEventEmitter đúng cách
    let voiceEmitter: NativeEventEmitter | null = null;
    
    try {
      if (NativeModules.Voice) {
        voiceEmitter = new NativeEventEmitter(NativeModules.Voice);
      }
    } catch (error) {
      console.warn('Voice module not available:', error);
    }

    // Khởi tạo Voice
    const onSpeechResults = (e: SpeechResultsEvent) => {
      if (e.value) {
        setResults(e.value);
      }
    };

    const onSpeechPartialResults = (e: SpeechResultsEvent) => {
      if (e.value) {
        setResults(e.value);
      }
    };

    const onSpeechError = (e: SpeechErrorEvent) => {
      setError(e.error?.message || 'Lỗi không xác định');
      setIsListening(false);
    };

    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechPartialResults = onSpeechPartialResults;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechEnd = () => setIsListening(false);

    return () => {
      // Dọn dẹp khi component unmount
      Voice.destroy().then(() => {
        Voice.removeAllListeners();
      });
    };
  }, []);

  const requestMicrophonePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Quyền truy cập Microphone',
            message: 'Ứng dụng cần quyền truy cập microphone để nhận diện giọng nói của bạn.',
            buttonPositive: 'Đồng ý',
            buttonNegative: 'Hủy',
            buttonNeutral: 'Hỏi lại sau',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.error(err);
        return false;
      }
    }
    return true; // iOS sẽ tự động hiện hộp thoại xin quyền
  };

  const destroyAndReset = async () => {
    try {
      await Voice.destroy();
    } catch (e) {
      console.error('Error destroying voice session:', e);
    }
    setResults([]);
    setError(null);
    setIsListening(false);
    Voice.removeAllListeners();
  };

  const setupAndStart = async () => {
    try {
      const onSpeechResults = (e: SpeechResultsEvent) => {
        if (e.value) setResults(e.value);
      };
      const onSpeechPartialResults = (e: SpeechResultsEvent) => {
        if (e.value) setResults(e.value);
      };
      const onSpeechError = (e: SpeechErrorEvent) => {
        setError(e.error?.message || 'Lỗi không xác định');
        setIsListening(false);
      };

      Voice.onSpeechResults = onSpeechResults;
      Voice.onSpeechPartialResults = onSpeechPartialResults;
      Voice.onSpeechError = onSpeechError;
      Voice.onSpeechEnd = () => setIsListening(false);

      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        Alert.alert(
          'Quyền truy cập bị từ chối',
          'Vui lòng cấp quyền truy cập microphone trong cài đặt để sử dụng tính năng này.'
        );
        return;
      }
      
      setResults([]);
      setError(null);
      await Voice.start('vi-VN');
      setIsListening(true);
    } catch (e: any) {
      setError(e.message || 'Lỗi khi bắt đầu nhận diện giọng nói');
      setIsListening(false);
    }
  };

  const startListening = async () => {
    await destroyAndReset();
    await setupAndStart();
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (e: any) {
      setError(e.message || 'Lỗi khi dừng nhận diện giọng nói');
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <VoiceContext.Provider
      value={{
        isListening,
        startListening,
        stopListening,
        results,
        error,
        clearResults,
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = () => {
  const context = useContext(VoiceContext);
  if (context === undefined) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
}; 
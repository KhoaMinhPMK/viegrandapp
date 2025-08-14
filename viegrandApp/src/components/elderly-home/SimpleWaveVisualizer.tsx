import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';

const { width } = Dimensions.get('window');
const WAVE_WIDTH = width - 80;
const WAVE_HEIGHT = 60;
const BAR_COUNT = 15; // Very few bars for maximum performance

interface SimpleWaveVisualizerProps {
  isListening: boolean;
  onAmplitudeChange?: (amplitude: number) => void;
}

const SimpleWaveVisualizer: React.FC<SimpleWaveVisualizerProps> = ({
  isListening,
  onAmplitudeChange,
}) => {
  const [amplitudes, setAmplitudes] = useState<number[]>(new Array(BAR_COUNT).fill(0));
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Simple amplitude generation
  const generateAmplitude = useCallback((time: number) => {
    const wave = Math.sin(time * 0.03) * 0.3;
    const noise = (Math.random() - 0.5) * 0.1;
    return Math.max(0, Math.min(1, 0.4 + wave + noise));
  }, []);

  // Start animation
  const startAnimation = useCallback(() => {
    if (animationRef.current) {
      clearInterval(animationRef.current);
    }
    
    startTimeRef.current = Date.now();
    
    animationRef.current = setInterval(() => {
      const currentTime = Date.now() - startTimeRef.current;
      const newAmplitude = generateAmplitude(currentTime);
      
      setAmplitudes(prev => {
        const newAmplitudes = [...prev.slice(1), newAmplitude];
        return newAmplitudes;
      });
      
      onAmplitudeChange?.(newAmplitude);
    }, 150); // Even slower for better performance
  }, [generateAmplitude, onAmplitudeChange]);

  // Stop animation
  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      clearInterval(animationRef.current);
      animationRef.current = null;
    }
    setAmplitudes(new Array(BAR_COUNT).fill(0));
  }, []);

  // Effect to start/stop animation
  useEffect(() => {
    if (isListening) {
      startAnimation();
    } else {
      stopAnimation();
    }
    
    return () => {
      stopAnimation();
    };
  }, [isListening, startAnimation, stopAnimation]);

  return (
    <View style={styles.container}>
      <View style={styles.waveContainer}>
        {amplitudes.map((amplitude, index) => {
          const barHeight = amplitude * WAVE_HEIGHT * 0.8;
          const opacity = amplitude * 0.6 + 0.4;
          
          return (
            <View
              key={index}
              style={[
                styles.bar,
                {
                  height: barHeight,
                  opacity,
                  backgroundColor: `rgba(14, 165, 233, ${opacity})`,
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: WAVE_HEIGHT,
    width: WAVE_WIDTH,
  },
  bar: {
    width: 3,
    marginHorizontal: 1,
    borderRadius: 2,
  },
});

export default SimpleWaveVisualizer; 
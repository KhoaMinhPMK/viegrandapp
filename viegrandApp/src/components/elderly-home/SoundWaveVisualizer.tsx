import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import {
  Canvas,
  Path,
  Skia,
} from '@shopify/react-native-skia';

const { width } = Dimensions.get('window');
const WAVE_WIDTH = width - 80;
const WAVE_HEIGHT = 80; // Reduced height for better performance
const POINT_COUNT = 20; // Fewer points for smoother animation

interface SoundWaveVisualizerProps {
  isListening: boolean;
  onAmplitudeChange?: (amplitude: number) => void;
}

const SoundWaveVisualizer: React.FC<SoundWaveVisualizerProps> = ({
  isListening,
  onAmplitudeChange,
}) => {
  const [amplitudes, setAmplitudes] = useState<number[]>(new Array(POINT_COUNT).fill(0));
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Simple, fast amplitude generation
  const generateAmplitude = useCallback((time: number) => {
    // Simple sine wave with some variation
    const baseWave = Math.sin(time * 0.02) * 0.3;
    const variation = Math.sin(time * 0.05) * 0.2;
    const noise = (Math.random() - 0.5) * 0.1;
    
    return Math.max(0, Math.min(1, 0.3 + baseWave + variation + noise));
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
    }, 100); // Slower update for better performance
  }, [generateAmplitude, onAmplitudeChange]);

  // Stop animation
  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      clearInterval(animationRef.current);
      animationRef.current = null;
    }
    setAmplitudes(new Array(POINT_COUNT).fill(0));
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

  // Create simple wave path
  const createWavePath = useCallback(() => {
    const path = Skia.Path.Make();
    const centerY = WAVE_HEIGHT / 2;
    
    for (let i = 0; i < amplitudes.length; i++) {
      const x = (i / (POINT_COUNT - 1)) * WAVE_WIDTH;
      const amplitude = amplitudes[i] || 0;
      const y = centerY + (amplitude * centerY * 0.6);
      
      if (i === 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }
    
    return path;
  }, [amplitudes]);

  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas}>
        <Path
          path={createWavePath()}
          style="stroke"
          strokeWidth={2}
          color="#0EA5E9"
          strokeCap="round"
          strokeJoin="round"
        />
      </Canvas>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
  },
  canvas: {
    width: WAVE_WIDTH,
    height: WAVE_HEIGHT,
  },
});

export default SoundWaveVisualizer; 
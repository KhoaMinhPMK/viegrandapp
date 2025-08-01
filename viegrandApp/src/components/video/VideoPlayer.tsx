import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
  StatusBar,
  Image,
} from 'react-native';
import Video from 'react-native-video';
import Feather from 'react-native-vector-icons/Feather';

const { width, height } = Dimensions.get('window');

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  thumbnailUrl?: string;
  onClose: () => void;
  onBackward?: () => void;
  onForward?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  title,
  thumbnailUrl,
  onClose,
  onBackward,
  onForward,
}) => {
  const videoRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [showControls]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (seekTime: number) => {
    setPosition(seekTime);
  };

  const handleBackward = () => {
    const newPosition = Math.max(0, position - 10);
    handleSeek(newPosition);
  };

  const handleForward = () => {
    const newPosition = Math.min(duration, position + 10);
    handleSeek(newPosition);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVideoLoad = (data: any) => {
    setDuration(data.duration || 0);
    setIsLoading(false);
  };

  const handleVideoProgress = (data: any) => {
    setPosition(data.currentTime || 0);
    setIsPlaying(data.isPlaying || false);
  };

  const handleVideoError = (error: any) => {
    console.error('Video error:', error);
    Alert.alert('Lỗi', 'Không thể phát video. Vui lòng thử lại.');
  };

  const toggleControls = () => {
    setShowControls(!showControls);
  };



  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      {/* Video Container */}
      <TouchableOpacity
        style={styles.videoContainer}
        activeOpacity={1}
        onPress={toggleControls}
      >
        {/* Real Video Player */}
        <Video
          ref={videoRef}
          source={{ uri: videoUrl }}
          style={styles.video}
          resizeMode="contain"
          paused={!isPlaying}
          onLoad={handleVideoLoad}
          onProgress={handleVideoProgress}
          onError={handleVideoError}
          controls={false}
        />

        {/* Loading Overlay */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.loadingText}>Đang tải video...</Text>
          </View>
        )}

        {/* Controls Overlay */}
        {showControls && (
          <View style={styles.controlsOverlay}>
            {/* Top Controls */}
            <View style={styles.topControls}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
              >
                <Feather name="x" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              
              <Text style={styles.videoTitle} numberOfLines={1}>
                {title}
              </Text>
              
              <TouchableOpacity
                style={styles.fullscreenButton}
                onPress={() => setIsFullscreen(!isFullscreen)}
              >
                <Feather 
                  name={isFullscreen ? "minimize" : "maximize"} 
                  size={20} 
                  color="#FFFFFF" 
                />
              </TouchableOpacity>
            </View>

            {/* Center Controls */}
            <View style={styles.centerControls}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={handleBackward}
                disabled={!onBackward}
              >
                <Feather name="skip-back" size={32} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.playButton}
                onPress={handlePlayPause}
              >
                <Feather
                  name={isPlaying ? "pause" : "play"}
                  size={40}
                  color="#FFFFFF"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={handleForward}
                disabled={!onForward}
              >
                <Feather name="skip-forward" size={32} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Bottom Controls */}
            <View style={styles.bottomControls}>
              <Text style={styles.timeText}>
                {formatTime(position)}
              </Text>
              
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${(position / duration) * 100}%` }
                    ]}
                  />
                </View>
              </View>
              
              <Text style={styles.timeText}>
                {formatTime(duration)}
              </Text>
            </View>
          </View>
        )}

        {/* Play Button Overlay (when paused and no controls) */}
        {!isPlaying && !showControls && (
          <TouchableOpacity
            style={styles.playOverlay}
            onPress={handlePlayPause}
          >
            <View style={styles.playOverlayButton}>
              <Feather name="play" size={40} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  video: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  videoPlaceholder: {
    flex: 1,
    backgroundColor: '#1F2937',
  },
  videoThumbnail: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  videoBackground: {
    flex: 1,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 12,
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  topControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 40,
  },
  closeButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginHorizontal: 20,
  },
  fullscreenButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
  },
  controlButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 40,
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
    minWidth: 60,
  },
  progressContainer: {
    flex: 1,
    marginHorizontal: 20,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0EA5E9',
    borderRadius: 3,
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playOverlayButton: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default VideoPlayer; 
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
  Linking,
  Animated,
} from 'react-native';
import Video from 'react-native-video';
import Feather from 'react-native-vector-icons/Feather';
import YouTubePlayer from './YouTubePlayer';

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
  const [isYouTubeVideo, setIsYouTubeVideo] = useState(false);
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Kiểm tra xem có phải YouTube video không
    const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
    setIsYouTubeVideo(isYouTube);
    
    // Extract YouTube video ID
    if (isYouTube) {
      const videoId = extractYouTubeVideoId(videoUrl);
      setYoutubeVideoId(videoId);
    }
    
    const timer = setTimeout(() => {
      hideControls();
    }, 3000);

    return () => clearTimeout(timer);
  }, [showControls, videoUrl]);

  const extractYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const hideControls = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowControls(false);
    });
  };

  const showControlsUI = () => {
    setShowControls(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      showControlsUI();
    }
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
    console.error('Video error details:', {
      errorCode: error.error?.errorCode,
      errorString: error.error?.errorString,
      videoUrl: videoUrl,
      isYouTube: isYouTubeVideo
    });
    
    if (isYouTubeVideo) {
      Alert.alert(
        'Video YouTube',
        'Video YouTube không thể phát trực tiếp trong ứng dụng. Bạn có muốn mở trong YouTube không?',
        [
          { text: 'Hủy', style: 'cancel' },
          { 
            text: 'Mở YouTube', 
            onPress: () => {
              Linking.openURL(videoUrl);
              onClose();
            }
          }
        ]
      );
    } else {
      Alert.alert(
        'Lỗi Video', 
        'Không thể phát video này. Có thể do format không hỗ trợ hoặc file bị hỏng.',
        [{ text: 'OK' }]
      );
    }
  };

  const toggleControls = () => {
    if (showControls) {
      hideControls();
    } else {
      showControlsUI();
    }
  };

  // Nếu là YouTube video và có video ID, sử dụng YouTubePlayer
  if (isYouTubeVideo && youtubeVideoId) {
    return (
      <YouTubePlayer
        videoId={youtubeVideoId}
        title={title}
        onClose={onClose}
      />
    );
  }

  // Nếu là YouTube video nhưng không có video ID, hiển thị placeholder
  if (isYouTubeVideo) {
    const openYouTubeApp = () => {
      const videoId = youtubeVideoId;
      if (videoId) {
        const youtubeAppUrl = `youtube://watch?v=${videoId}`;
        const youtubeWebUrl = `https://www.youtube.com/watch?v=${videoId}`;
        
        Linking.canOpenURL(youtubeAppUrl).then(supported => {
          if (supported) {
            Linking.openURL(youtubeAppUrl);
          } else {
            Linking.openURL(youtubeWebUrl);
          }
          onClose();
        });
      } else {
        Linking.openURL(videoUrl);
        onClose();
      }
    };

    return (
      <View style={styles.container}>
        <StatusBar hidden />
        
        {/* YouTube Video Placeholder */}
        <View style={styles.videoContainer}>
          <View style={styles.youtubePlaceholder}>
            <View style={styles.youtubeIconContainer}>
              <Feather name="youtube" size={60} color="#FF0000" />
            </View>
            <Text style={styles.youtubeTitle}>{title}</Text>
            <Text style={styles.youtubeMessage}>
              Video YouTube sẽ được mở trong ứng dụng YouTube
            </Text>
            
            <TouchableOpacity
              style={styles.youtubeButton}
              onPress={openYouTubeApp}
            >
              <Feather name="play" size={20} color="#FFFFFF" />
              <Text style={styles.youtubeButtonText}>Phát trong YouTube</Text>
            </TouchableOpacity>
          </View>
          
          {/* Controls Overlay */}
          <Animated.View 
            style={[
              styles.controlsOverlay,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            <View style={styles.topControls}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
              >
                <Feather name="x" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              
              <Text style={styles.videoTitle} numberOfLines={1}>
                {title}
              </Text>
              
              <View style={styles.placeholderButton} />
            </View>
          </Animated.View>
        </View>
      </View>
    );
  }

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
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text style={styles.loadingText}>Đang tải video...</Text>
            </View>
          </View>
        )}

        {/* Controls Overlay */}
        {showControls && (
          <Animated.View 
            style={[
              styles.controlsOverlay,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            {/* Top Controls */}
            <View style={styles.topControls}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
              >
                <Feather name="x" size={20} color="#FFFFFF" />
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
                  size={18} 
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
                <Feather name="skip-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.playButton}
                onPress={handlePlayPause}
              >
                <Feather
                  name={isPlaying ? "pause" : "play"}
                  size={32}
                  color="#FFFFFF"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={handleForward}
                disabled={!onForward}
              >
                <Feather name="skip-forward" size={24} color="#FFFFFF" />
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
          </Animated.View>
        )}

        {/* Play Button Overlay (when paused and no controls) */}
        {!isPlaying && !showControls && (
          <TouchableOpacity
            style={styles.playOverlay}
            onPress={handlePlayPause}
          >
            <View style={styles.playOverlayButton}>
              <Feather name="play" size={32} color="#FFFFFF" />
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
  loadingContainer: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 12,
    fontWeight: '500',
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    padding: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  topControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 40,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginHorizontal: 20,
  },
  fullscreenButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
    fontSize: 14,
    fontWeight: '500',
    minWidth: 50,
  },
  progressContainer: {
    flex: 1,
    marginHorizontal: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
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
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  youtubePlaceholder: {
    flex: 1,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  youtubeIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  youtubeTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 28,
  },
  youtubeMessage: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  youtubeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF0000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  youtubeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  placeholderButton: {
    width: 40,
    height: 40,
  },
});

export default VideoPlayer; 
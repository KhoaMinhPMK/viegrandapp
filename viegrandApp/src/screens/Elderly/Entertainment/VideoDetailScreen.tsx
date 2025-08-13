import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Image,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import VideoPlayer from '../../../components/video/VideoPlayer';

const { width, height } = Dimensions.get('window');

interface VideoDetailScreenProps {
  route: any;
  navigation: any;
}

const VideoDetailScreen: React.FC<VideoDetailScreenProps> = ({ route, navigation }) => {
  const { video } = route.params;
  const [showPlayer, setShowPlayer] = useState(false);
  const [thumbnailLoading, setThumbnailLoading] = useState(true);
  const [thumbnailError, setThumbnailError] = useState(false);

  // Kiểm tra xem có phải YouTube video không
  const isYouTubeVideo = video.videoUrl?.includes('youtube.com') || video.videoUrl?.includes('youtu.be');

  const handlePlayVideo = () => {
    setShowPlayer(true);
  };

  const handleClosePlayer = () => {
    setShowPlayer(false);
  };

  if (showPlayer) {
    return (
      <VideoPlayer
        videoUrl={video.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
        title={video.title}
        thumbnailUrl={video.thumbnail}
        onClose={handleClosePlayer}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={20} color="#374151" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle} numberOfLines={1}>
          {video.title}
        </Text>
        
        <TouchableOpacity style={styles.shareButton}>
          <Feather name="share-2" size={18} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Video Thumbnail */}
      <View style={styles.videoContainer}>
        <View style={styles.videoWrapper}>
          <TouchableOpacity
            style={styles.thumbnailContainer}
            onPress={handlePlayVideo}
            activeOpacity={0.9}
          >
            {video.thumbnail && !thumbnailError ? (
              <Image
                source={{ uri: video.thumbnail }}
                style={styles.thumbnailImage}
                resizeMode="cover"
                onLoadStart={() => setThumbnailLoading(true)}
                onLoadEnd={() => setThumbnailLoading(false)}
                onError={() => {
                  setThumbnailError(true);
                  setThumbnailLoading(false);
                }}
              />
            ) : (
              <View style={styles.thumbnail}>
                <View style={styles.playIconContainer}>
                  <Feather name="play" size={40} color="#FFFFFF" />
                </View>
              </View>
            )}
            
            {/* Loading Overlay */}
            {thumbnailLoading && video.thumbnail && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#0EA5E9" />
              </View>
            )}
            
            {/* Play Button Overlay */}
            <View style={styles.playButtonOverlay}>
              <View style={styles.playIconContainer}>
                <Feather name="play" size={32} color="#FFFFFF" />
              </View>
            </View>
            
            {/* Duration Badge */}
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>{video.duration}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Video Info */}
        <View style={styles.videoInfo}>
          <Text style={styles.videoTitle}>{video.title}</Text>
          
          <View style={styles.videoMeta}>
            <View style={styles.metaItem}>
              <Feather name="eye" size={14} color="#6B7280" />
              <Text style={styles.metaText}>{video.viewCount}</Text>
            </View>
            
            <View style={styles.metaItem}>
              <Feather name="calendar" size={14} color="#6B7280" />
              <Text style={styles.metaText}>{video.publishedAt}</Text>
            </View>
            
            <View style={styles.metaItem}>
              <Feather name="clock" size={14} color="#6B7280" />
              <Text style={styles.metaText}>{video.duration}</Text>
            </View>
          </View>
        </View>

        {/* Play Button */}
        <View style={styles.playActionContainer}>
          <TouchableOpacity
            style={styles.playActionButton}
            onPress={handlePlayVideo}
          >
            <Feather name="play" size={18} color="#FFFFFF" />
            <Text style={styles.playActionText}>Phát video</Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Feather name="thumbs-up" size={18} color="#6B7280" />
            <Text style={styles.actionText}>Thích</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Feather name="message-circle" size={18} color="#6B7280" />
            <Text style={styles.actionText}>Bình luận</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Feather name="share-2" size={18} color="#6B7280" />
            <Text style={styles.actionText}>Chia sẻ</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Feather name="download" size={18} color="#6B7280" />
            <Text style={styles.actionText}>Tải xuống</Text>
          </TouchableOpacity>
        </View>

        {/* Channel Info */}
        <View style={styles.channelInfo}>
          <View style={styles.channelHeader}>
            <View style={styles.channelAvatar}>
              <Feather name="user" size={20} color="#6B7280" />
            </View>
            
            <View style={styles.channelDetails}>
              <Text style={styles.channelTitle}>{video.channelTitle}</Text>
              <Text style={styles.channelSubscribers}>Kênh video</Text>
            </View>
            
            <TouchableOpacity style={styles.subscribeButton}>
              <Text style={styles.subscribeText}>Theo dõi</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>Mô tả</Text>
          <Text style={styles.descriptionText} numberOfLines={5}>
            {video.description}
          </Text>
          <TouchableOpacity>
            <Text style={styles.readMoreText}>Đọc thêm</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  shareButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContainer: {
    width: '100%',
    height: height * 0.3,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  videoWrapper: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  thumbnailContainer: {
    flex: 1,
    position: 'relative',
  },
  thumbnail: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailImage: {
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
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  playButtonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  playIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  videoInfo: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
    lineHeight: 24,
  },
  videoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: '#6B7280',
    fontSize: 13,
  },
  playActionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  playActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0EA5E9',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  playActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  actionButton: {
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    color: '#6B7280',
    fontSize: 13,
  },
  channelInfo: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  channelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  channelAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  channelDetails: {
    flex: 1,
  },
  channelTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  channelSubscribers: {
    fontSize: 12,
    color: '#6B7280',
  },
  subscribeButton: {
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  subscribeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  descriptionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  descriptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  readMoreText: {
    color: '#0EA5E9',
    fontSize: 13,
    marginTop: 8,
  },
});

export default VideoDetailScreen; 
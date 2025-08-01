import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import VideoPlayer from '../../../components/video/VideoPlayer';

const { width } = Dimensions.get('window');

interface VideoDetailScreenProps {
  route: any;
  navigation: any;
}

const VideoDetailScreen: React.FC<VideoDetailScreenProps> = ({ route, navigation }) => {
  const { video } = route.params;
  const [showPlayer, setShowPlayer] = useState(false);

  const handlePlayVideo = () => {
    setShowPlayer(true);
  };

  const handleClosePlayer = () => {
    setShowPlayer(false);
  };

  if (showPlayer) {
    return (
      <VideoPlayer
        videoUrl={video.videoUrl || 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4'}
        title={video.title}
        thumbnailUrl={video.thumbnail}
        onClose={handleClosePlayer}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle} numberOfLines={1}>
          {video.title}
        </Text>
        
        <TouchableOpacity style={styles.shareButton}>
          <Feather name="share-2" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Video Thumbnail */}
      <View style={styles.videoContainer}>
        <TouchableOpacity
          style={styles.thumbnailContainer}
          onPress={handlePlayVideo}
          activeOpacity={0.9}
        >
          <View style={styles.thumbnail}>
            <Feather name="play" size={60} color="#FFFFFF" />
          </View>
          
          {/* Duration Badge */}
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{video.duration}</Text>
          </View>
          

        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Video Info */}
        <View style={styles.videoInfo}>
          <Text style={styles.videoTitle}>{video.title}</Text>
          
          <View style={styles.videoMeta}>
            <View style={styles.metaItem}>
              <Feather name="eye" size={16} color="#6B7280" />
              <Text style={styles.metaText}>{video.viewCount}</Text>
            </View>
            
            <View style={styles.metaItem}>
              <Feather name="calendar" size={16} color="#6B7280" />
              <Text style={styles.metaText}>{video.publishedAt}</Text>
            </View>
            
            <View style={styles.metaItem}>
              <Feather name="clock" size={16} color="#6B7280" />
              <Text style={styles.metaText}>{video.duration}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Feather name="thumbs-up" size={20} color="#6B7280" />
            <Text style={styles.actionText}>Thích</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Feather name="message-circle" size={20} color="#6B7280" />
            <Text style={styles.actionText}>Bình luận</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Feather name="share-2" size={20} color="#6B7280" />
            <Text style={styles.actionText}>Chia sẻ</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Feather name="download" size={20} color="#6B7280" />
            <Text style={styles.actionText}>Tải về</Text>
          </TouchableOpacity>
        </View>

        {/* Description */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Mô tả</Text>
          <Text style={styles.descriptionText}>
            {video.description || 'Video hay về chủ đề nấu ăn, sức khỏe và cuộc sống. Phù hợp cho mọi lứa tuổi, đặc biệt là người cao tuổi.'}
          </Text>
        </View>

        {/* Related Videos */}
        <View style={styles.relatedSection}>
          <Text style={styles.sectionTitle}>Video liên quan</Text>
          
          {/* Mock related videos */}
          {[1, 2, 3].map((item) => (
            <TouchableOpacity key={item} style={styles.relatedVideo}>
              <View style={styles.relatedThumbnail}>
                <Feather name="play" size={20} color="#FFFFFF" />
              </View>
              
              <View style={styles.relatedInfo}>
                <Text style={styles.relatedTitle}>
                  Video liên quan {item}
                </Text>
                <Text style={styles.relatedMeta}>
                  1.2K lượt xem • 2 ngày trước
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Floating Play Button */}
      <TouchableOpacity
        style={styles.floatingPlayButton}
        onPress={handlePlayVideo}
      >
        <Feather name="play" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  backButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  shareButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContainer: {
    width: '100%',
    height: width * 0.5625, // 16:9 aspect ratio
    backgroundColor: '#1F2937',
  },
  thumbnailContainer: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#374151',
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
    borderRadius: 12,
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  videoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    lineHeight: 28,
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
    fontSize: 18,
    color: '#6B7280',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  descriptionSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 18,
    color: '#374151',
    lineHeight: 24,
  },
  relatedSection: {
    padding: 20,
  },
  relatedVideo: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  relatedThumbnail: {
    width: 120,
    height: 68,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  relatedInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  relatedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
    lineHeight: 22,
  },
  relatedMeta: {
    fontSize: 16,
    color: '#6B7280',
  },
  floatingPlayButton: {
    position: 'absolute',
    bottom: 40,
    right: 40,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0EA5E9',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
});

export default VideoDetailScreen; 
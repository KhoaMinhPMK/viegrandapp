import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
  Alert,
  TextInput,
  Animated,
  FlatList,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import VoiceRecognitionModal from '../../../components/VoiceRecognitionModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserRestrictedContent } from '../../../services/api';
import { useVoiceButton } from '../../../contexts/VoiceButtonContext';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface VideoItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  viewCount: string;
  duration: string;
  videoUrl?: string;
}

const VideoPlayerScreen = ({ navigation }: any) => {
  const { setIsVisible } = useVoiceButton();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [filteredVideos, setFilteredVideos] = useState<VideoItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [userRestrictedContent, setUserRestrictedContent] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [filteredCount, setFilteredCount] = useState(0);

  const API_KEY = 'AIzaSyBnaEQD7O2SMQFAcL6pBmx8wjNNmKLUc2A';

  // Suggested search terms for initial content
  const suggestedSearches = [
    'Doraemon', 'Tom và Jerry', 'nấu ăn', 'tập thể dục', 
    'âm nhạc Việt Nam', 'du lịch Việt Nam', 'sức khỏe người già',
    'yoga cho người cao tuổi', 'nhạc trữ tình', 'công thức món ăn'
  ];

  // Load user's personalized restricted content
  const loadUserRestrictedContent = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUserId(user.id);
        
        const result = await getUserRestrictedContent(user.id);
        if (result.success && result.restricted_contents) {
          setUserRestrictedContent(result.restricted_contents);
        } else {
          // No restricted content - user sees everything
          setUserRestrictedContent([]);
        }
      }
    } catch (error) {
      console.error('Error loading user restricted content:', error);
      // No restricted content - user sees everything
      setUserRestrictedContent([]);
    }
  };

  // Load user restricted content on component mount
  useEffect(() => {
    loadUserRestrictedContent();
  }, []);

  // Hide voice button when entering VideoPlayerScreen, show when leaving
  useFocusEffect(
    React.useCallback(() => {
      // Hide voice button when entering video player
      console.log('📱 VideoPlayerScreen: Hiding voice button');
      setIsVisible(false);
      
      // Show voice button when leaving video player
      return () => {
        console.log('📱 VideoPlayerScreen: Showing voice button on cleanup');
        setIsVisible(true);
      };
    }, [setIsVisible])
  );

  // Personalized filtering function - ONLY uses user's restricted content
  const shouldFilterVideo = (video: VideoItem): boolean => {
    // If user has no restricted content, show everything
    if (userRestrictedContent.length === 0) {
      return false;
    }

    const title = video.title.toLowerCase();
    const description = video.description.toLowerCase();
    const channelTitle = video.channelTitle.toLowerCase();

    // Debug: Log what we're checking
    console.log('🔍 Checking video:', {
      title: video.title,
      restrictedKeywords: userRestrictedContent
    });

    // Check if any of the user's restricted keywords appear in the video
    const shouldFilter = userRestrictedContent.some(keyword => {
      const lowerKeyword = keyword.toLowerCase();
      const titleMatch = title.includes(lowerKeyword);
      const descMatch = description.includes(lowerKeyword);
      const channelMatch = channelTitle.includes(lowerKeyword);
      
      if (titleMatch || descMatch || channelMatch) {
        console.log('🚫 Filtering video due to keyword:', keyword, {
          titleMatch,
          descMatch,
          channelMatch,
          title: video.title,
          description: video.description.substring(0, 100) + '...',
          channelTitle: video.channelTitle
        });
      }
      
      return titleMatch || descMatch || channelMatch;
    });

    return shouldFilter;
  };

  const fetchVideos = async (query: string, isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      
      // Build API URL with user's search query
      let apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=10&key=${API_KEY}`;
      
      if (isLoadMore && nextPageToken) {
        apiUrl += `&pageToken=${nextPageToken}`;
      }
      
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (data.items) {
        // Get video details for each video
        const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
        const detailsResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${API_KEY}`
        );
        
        const detailsData = await detailsResponse.json();
        
        // Combine search results with video details and filter sensitive content
        const processedVideos = data.items.map((item: any, index: number) => {
          const details = detailsData.items[index];
          return {
            id: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.high.url,
            channelTitle: item.snippet.channelTitle,
            publishedAt: formatDate(item.snippet.publishedAt),
            viewCount: formatViewCount(details?.statistics?.viewCount || '0'),
            duration: formatDuration(details?.contentDetails?.duration || 'PT0S'),
            videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          };
        });
        
        // Filter out sensitive content using personalized keywords
        const filteredVideos = processedVideos.filter((video: VideoItem) => !shouldFilterVideo(video));
        
        // Count filtered videos for this batch
        const newFilteredCount = processedVideos.length - filteredVideos.length;
        setFilteredCount(prev => prev + newFilteredCount);
        
        // Show notification if many videos are filtered
        if (newFilteredCount > 3 && !isLoadMore) {
          Alert.alert(
            'Bảo vệ nội dung',
            `Đã lọc bỏ ${newFilteredCount} video không phù hợp để bảo vệ bạn.`,
            [{ text: 'OK' }]
          );
        }
        
        if (isLoadMore) {
          setVideos(prev => [...prev, ...filteredVideos]);
          setFilteredVideos(prev => [...prev, ...filteredVideos]);
        } else {
          setVideos(filteredVideos);
          setFilteredVideos(filteredVideos);
        }
        
        // Save next page token for pagination
        setNextPageToken(data.nextPageToken || null);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      Alert.alert('Lỗi', 'Không thể tải video. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`;
    return `${Math.floor(diffDays / 365)} năm trước`;
  };

  const formatViewCount = (viewCount: string) => {
    const count = parseInt(viewCount);
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M lượt xem`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K lượt xem`;
    }
    return `${count} lượt xem`;
  };

  const formatDuration = (duration: string) => {
    // Parse ISO 8601 duration format (PT4M13S)
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '0:00';
    
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleVideoPress = (video: VideoItem) => {
    navigation.navigate('VideoDetail', { video });
  };

  const handleVoiceSearch = (text: string) => {
    setSearchQuery(text);
    setHasSearched(true);
    setFilteredCount(0); // Reset filtered count for new search
    fetchVideos(text);
  };

  const handleTextSearch = () => {
    if (searchQuery.trim()) {
      setHasSearched(true);
      setFilteredCount(0); // Reset filtered count for new search
      fetchVideos(searchQuery.trim());
    }
  };

  const handleLoadMore = () => {
    if (nextPageToken && !isLoadingMore && searchQuery.trim()) {
      fetchVideos(searchQuery.trim(), true);
    }
  };

  const handleSuggestedSearch = (suggestion: string) => {
    setSearchQuery(suggestion);
    setHasSearched(true);
    setFilteredCount(0); // Reset filtered count for new search
    fetchVideos(suggestion);
  };

  const renderVideoCard = (video: VideoItem) => (
    <TouchableOpacity
      key={video.id}
      style={styles.videoCard}
      onPress={() => handleVideoPress(video)}
      activeOpacity={0.8}
    >
      <View style={styles.thumbnailContainer}>
        <Image source={{ uri: video.thumbnail }} style={styles.thumbnail} />
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{video.duration}</Text>
        </View>
        <View style={styles.playButton}>
          <Feather name="play" size={20} color="#FFFFFF" />
        </View>
        <View style={styles.qualityBadge}>
          <Text style={styles.qualityText}>HD</Text>
        </View>
      </View>
      
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle} numberOfLines={2}>
          {video.title}
        </Text>
        <Text style={styles.channelTitle}>{video.channelTitle}</Text>
        <View style={styles.videoMeta}>
          <View style={styles.metaRow}>
            <Feather name="eye" size={12} color="#8E8E93" />
            <Text style={styles.metaText}>{video.viewCount}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaText}>{video.publishedAt}</Text>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <Feather name="bookmark" size={16} color="#8E8E93" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Feather name="share-2" size={16} color="#8E8E93" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="chevron-left" size={24} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Video hay</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => searchQuery.trim() && fetchVideos(searchQuery.trim())}
        >
          <Feather name="refresh-cw" size={20} color="#1C1C1E" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentScroll}
      >
        {/* Search Section */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Feather name="search" size={20} color="#8E8E93" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm video..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#8E8E93"
              onSubmitEditing={handleTextSearch}
              returnKeyType="search"
            />
            <TouchableOpacity
              style={[styles.searchButton, !searchQuery.trim() && styles.searchButtonDisabled]}
              onPress={handleTextSearch}
              disabled={!searchQuery.trim()}
            >
              <Text style={[styles.searchButtonText, !searchQuery.trim() && styles.searchButtonTextDisabled]}>
                Tìm
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {!hasSearched ? (
          <View style={styles.welcomeContainer}>
            <Feather name="search" size={64} color="#E5E7EB" />
            <Text style={styles.welcomeTitle}>Tìm kiếm video</Text>
            <Text style={styles.welcomeSubtitle}>
              Nhập từ khóa hoặc sử dụng nút microphone để tìm kiếm video bạn muốn xem
            </Text>
            <View style={styles.suggestedSearches}>
              <Text style={styles.suggestedTitle}>Gợi ý tìm kiếm:</Text>
              <View style={styles.suggestedTags}>
                {suggestedSearches.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestedTag}
                    onPress={() => handleSuggestedSearch(suggestion)}
                  >
                    <Text style={styles.suggestedTagText}>{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        ) : isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0EA5E9" />
            <Text style={styles.loadingText}>Đang tải video...</Text>
          </View>
        ) : filteredVideos.length > 0 ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Kết quả tìm kiếm: "{searchQuery}"
              </Text>
              <View style={styles.sectionSubtitleContainer}>
                <Text style={styles.sectionSubtitle}>{filteredVideos.length} video</Text>
                {filteredCount > 0 && userRestrictedContent.length > 0 && (
                  <View style={styles.filteredIndicator}>
                    <Feather name="shield" size={14} color="#10B981" />
                    <Text style={styles.filteredText}>Đã bảo vệ</Text>
                  </View>
                )}
              </View>
            </View>
            {filteredVideos.map(renderVideoCard)}
            
            {/* Load More Indicator */}
            {isLoadingMore && (
              <View style={styles.loadMoreContainer}>
                <ActivityIndicator size="small" color="#0EA5E9" />
                <Text style={styles.loadMoreText}>Đang tải thêm video...</Text>
              </View>
            )}
            
            {/* Load More Button */}
            {!isLoadingMore && nextPageToken && (
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={handleLoadMore}
              >
                <Text style={styles.loadMoreButtonText}>Tải thêm video</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Feather name="youtube" size={48} color="#C7C7CC" />
            <Text style={styles.emptyTitle}>Không tìm thấy video</Text>
            <Text style={styles.emptySubtitle}>
              Thử tìm kiếm với từ khóa khác hoặc kiểm tra kết nối mạng
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Voice Button */}
      <TouchableOpacity
        style={styles.floatingVoiceButton}
        onPress={() => setShowVoiceModal(true)}
        activeOpacity={0.8}
      >
        <View style={styles.voiceButtonInner}>
          <Feather name="mic" size={28} color="#FFFFFF" />
        </View>
      </TouchableOpacity>

      {/* Voice Recognition Modal */}
      <VoiceRecognitionModal
        visible={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onResult={handleVoiceSearch}
      />
      {/* <FloatingVoiceButton variant="centerDocked" visible={false} /> */}
          
    </SafeAreaView> 
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  backButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  refreshButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchSection: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 20,
    color: '#1C1C1E',
  },
  voiceButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  searchButtonTextDisabled: {
    color: '#9CA3AF',
  },
  categoriesSection: {
    marginBottom: 20,
  },
  categoriesContainer: {
    paddingHorizontal: 24,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    marginRight: 16,
    minHeight: 56,
  },
  categoryButtonActive: {
    backgroundColor: '#0EA5E9',
  },
  categoryText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#8E8E93',
    marginLeft: 12,
  },
  categoryTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentScroll: {
    paddingBottom: 120, // Extra padding for floating button
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  sectionSubtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filteredIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  filteredText: {
    fontSize: 12,
    color: '#065F46',
    fontWeight: '600',
  },
  videoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  thumbnailContainer: {
    position: 'relative',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: 240,
    resizeMode: 'cover',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  qualityBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  qualityText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -30 }, { translateY: -30 }],
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoInfo: {
    padding: 20,
  },
  videoTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
    lineHeight: 26,
  },
  channelTitle: {
    fontSize: 18,
    color: '#8E8E93',
    marginBottom: 12,
  },
  videoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 12,
  },
  metaText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  metaDot: {
    fontSize: 12,
    color: '#8E8E93',
    marginHorizontal: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8E8E93',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 40,
  },
  welcomeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  suggestedSearches: {
    width: '100%',
  },
  suggestedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
    textAlign: 'center',
  },
  suggestedTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  suggestedTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  suggestedTagText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  loadMoreContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadMoreText: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
  },
  loadMoreButton: {
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  loadMoreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  floatingVoiceButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0EA5E9',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0EA5E9',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  voiceButtonInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#0EA5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default VideoPlayerScreen; 
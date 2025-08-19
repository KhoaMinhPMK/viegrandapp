import { NavigationProp } from '@react-navigation/native';
import { navigate } from '../navigation/navigationService';

// Types
export interface VoiceNavigationResult {
  success: boolean;
  action?: () => void;
  command?: string;
  screen?: string;
  confidence?: number;
  message?: string;
}

export interface ElderlyNavigationCommand {
  screen: string;
  params?: any;
  aliases: string[];
  description: string;
  category: string;
}

export interface ElderlyNavigationCommands {
  [key: string]: ElderlyNavigationCommand;
}

// Helper function to handle navigation
const handleNavigation = (config: ElderlyNavigationCommand, command: string, navigation: any): VoiceNavigationResult => {
  // Handle nested navigation for bottom tabs
  if (config.params && config.params.screen) {
    return {
      success: true,
      action: () => {
        // Navigate to Main first, then to the specific tab/screen
        navigate(config.screen);
        // Small delay to ensure Main is loaded
        setTimeout(() => {
          if (config.params.params && config.params.params.screen) {
            // Triple nested: Main -> Tab -> Screen
            navigate(config.params.screen, config.params.params);
          } else {
            // Double nested: Main -> Tab
            navigate(config.params.screen, config.params.params);
          }
        }, 100);
      },
      command,
      screen: config.screen,
      confidence: 1.0,
      message: `Đang mở ${config.description}...`
    };
  }
  
  // Handle direct navigation to screens within ElderlyNavigator
  return {
    success: true,
    action: () => {
      try {
        // For screens that are direct children of ElderlyNavigator
        const directScreens = ['HealthCheck', 'Reminders', 'VideoPlayer', 'VideoDetail', 'EntertainmentHub', 'GameHub', 'BookLibrary', 'BookDetail', 'BookReader', 'BookSettings', 'BookStats', 'BookBookmark', 'RestrictedContentSettings', 'ElderlyPremiumInfo', 'VoiceHelp'];
        
        if (directScreens.includes(config.screen)) {
          // Navigate directly to the screen using navigation service
          navigate(config.screen, config.params);
        } else {
          // For tab screens, navigate directly to the tab
          navigate(config.screen, config.params);
        }
      } catch (error) {
        console.log('Navigation error:', error);
        // If navigation fails, try to reset to the screen
        try {
          navigation.reset({
            index: 0,
            routes: [{ name: config.screen, params: config.params }],
          });
        } catch (resetError) {
          console.log('Reset navigation error:', resetError);
        }
      }
    },
    command,
    screen: config.screen,
    confidence: 1.0,
    message: `Đang mở ${config.description}...`
  };
};

// Voice command mapping for elderly flow

// Voice command mapping for elderly flow
export const ELDERLY_VOICE_COMMANDS: ElderlyNavigationCommands = {
  // === MAIN NAVIGATION ===
  'home': {
    screen: 'Main',
    aliases: ['trang chủ', 'màn hình chính', 'về nhà', 'quay về trang chủ', 'trở về trang chủ', 'trang đầu'],
    description: 'Đi đến trang chủ',
    category: 'main'
  },
  
  // Add "Về trang chủ" as a direct command for better recognition
  'về trang chủ': {
    screen: 'Main',
    aliases: ['trang chủ', 'màn hình chính', 'về nhà', 'quay về trang chủ', 'trở về trang chủ', 'trang đầu', 'home'],
    description: 'Đi đến trang chủ',
    category: 'main'
  },
  
  // === WEATHER & DASHBOARD ===
  'weather': {
    screen: 'Main',
    aliases: ['thời tiết', 'xem thời tiết', 'dự báo thời tiết', 'nhiệt độ', 'mưa nắng', 'khí hậu', 'nắng mưa'],
    description: 'Xem thông tin thời tiết',
    category: 'main'
  },
  
  // === HEALTH & MONITORING ===
  'health': {
    screen: 'HealthCheck',
    aliases: ['sức khỏe', 'kiểm tra sức khỏe', 'theo dõi sức khỏe', 'huyết áp', 'nhịp tim', 'đo huyết áp', 'kiểm tra sức khỏe'],
    description: 'Kiểm tra sức khỏe',
    category: 'health'
  },
  
  'reminders': {
    screen: 'Reminders',
    aliases: ['nhắc nhở', 'xem nhắc nhở', 'danh sách nhắc nhở', 'lịch nhắc nhở', 'lịch trình', 'ghi chú', 'công việc'],
    description: 'Xem danh sách nhắc nhở',
    category: 'health'
  },
  
  // === COMMUNICATION ===
  'messages': {
    screen: 'Main',
    params: { screen: 'Message' },
    aliases: ['tin nhắn', 'chat', 'nhắn tin', 'liên lạc', 'thông báo', 'giao tiếp', 'trò chuyện'],
    description: 'Mở tin nhắn',
    category: 'communication'
  },
  
  'phone': {
    screen: 'Main',
    params: { screen: 'Phone' },
    aliases: ['điện thoại', 'gọi điện', 'danh bạ', 'liên hệ', 'số điện thoại', 'cuộc gọi'],
    description: 'Mở điện thoại',
    category: 'communication'
  },
  
  'family': {
    screen: 'Main',
    params: { screen: 'HomeStack', params: { screen: 'Family' } },
    aliases: ['gia đình', 'người thân', 'con cái', 'cháu', 'gia đình của tôi', 'thành viên gia đình'],
    description: 'Xem thông tin gia đình',
    category: 'communication'
  },
  
  'notifications': {
    screen: 'Main',
    params: { screen: 'HomeStack', params: { screen: 'Notifications' } },
    aliases: ['thông báo', 'tin tức', 'cập nhật', 'báo cáo', 'tin mới', 'thông tin mới'],
    description: 'Xem thông báo',
    category: 'communication'
  },
  
  // === ENTERTAINMENT HUB ===
  'entertainment': {
    screen: 'Main',
    params: { screen: 'HomeStack', params: { screen: 'EntertainmentHub' } },
    aliases: ['giải trí', 'trung tâm giải trí', 'tiêu khiển', 'vui chơi', 'thư giãn'],
    description: 'Mở trung tâm giải trí',
    category: 'entertainment'
  },
  
  // === VIDEO & ENTERTAINMENT CONTENT ===
  'videos': {
    screen: 'VideoPlayer',
    aliases: ['xem video', 'youtube', 'phim ảnh', 'clip', 'video giải trí', 'xem phim', 'video'],
    description: 'Xem video trên YouTube',
    category: 'entertainment'
  },
  
  'music': {
    screen: 'VideoPlayer',
    aliases: ['nghe nhạc', 'âm nhạc', 'bài hát', 'ca nhạc', 'nhạc việt nam', 'nhạc trữ tình', 'nhạc vàng', 'nhạc bolero', 'nghe bài hát', 'phát nhạc'],
    description: 'Nghe nhạc trên YouTube',
    category: 'entertainment'
  },
  
  'films': {
    screen: 'VideoPlayer',
    aliases: ['xem phim', 'phim', 'phim truyện', 'phim việt nam', 'phim hàn quốc', 'phim trung quốc', 'phim thái lan', 'phim ảnh', 'xem phim truyện'],
    description: 'Xem phim trên YouTube',
    category: 'entertainment'
  },
  
  'movies': {
    screen: 'VideoPlayer',
    aliases: ['xem phim', 'phim điện ảnh', 'phim bom tấn', 'phim hành động', 'phim tình cảm', 'phim hài', 'phim kinh dị', 'phim viễn tưởng'],
    description: 'Xem phim điện ảnh',
    category: 'entertainment'
  },
  
  'cooking': {
    screen: 'VideoPlayer',
    aliases: ['nấu ăn', 'công thức nấu ăn', 'món ăn', 'nấu cơm', 'nấu bếp', 'học nấu ăn', 'cách nấu', 'món ngon', 'ẩm thực'],
    description: 'Xem video nấu ăn',
    category: 'entertainment'
  },
  
  'exercise': {
    screen: 'VideoPlayer',
    aliases: ['tập thể dục', 'thể dục', 'yoga', 'thể thao', 'vận động', 'tập luyện', 'sức khỏe', 'thể hình', 'aerobic', 'dance'],
    description: 'Xem video tập thể dục',
    category: 'entertainment'
  },
  
  'travel': {
    screen: 'VideoPlayer',
    aliases: ['du lịch', 'khám phá', 'đi du lịch', 'thăm quan', 'địa điểm du lịch', 'cảnh đẹp', 'văn hóa', 'ẩm thực địa phương'],
    description: 'Xem video du lịch',
    category: 'entertainment'
  },
  
  'news': {
    screen: 'VideoPlayer',
    aliases: ['tin tức', 'thời sự', 'báo cáo', 'tin mới', 'thông tin', 'cập nhật tin tức', 'bản tin'],
    description: 'Xem tin tức',
    category: 'entertainment'
  },
  
  'comedy': {
    screen: 'VideoPlayer',
    aliases: ['hài kịch', 'phim hài', 'tiếu lâm', 'hài', 'vui nhộn', 'giải trí hài', 'stand up comedy'],
    description: 'Xem video hài kịch',
    category: 'entertainment'
  },
  
  'drama': {
    screen: 'VideoPlayer',
    aliases: ['phim truyền hình', 'drama', 'phim bộ', 'truyền hình', 'phim tình cảm', 'phim gia đình'],
    description: 'Xem phim truyền hình',
    category: 'entertainment'
  },
  
  // === GAMES ===
  'games': {
    screen: 'Main',
    params: { screen: 'HomeStack', params: { screen: 'GameHub' } },
    aliases: ['chơi game', 'trò chơi', 'game hub', 'giải đố', 'vui chơi'],
    description: 'Mở trung tâm trò chơi',
    category: 'games'
  },
  
  'sudoku': {
    screen: 'Main',
    params: { screen: 'HomeStack', params: { screen: 'Sudoku' } },
    aliases: ['chơi sudoku', 'sudoku', 'số đố', 'trò chơi số', 'giải sudoku'],
    description: 'Chơi Sudoku',
    category: 'games'
  },
  
  'memory': {
    screen: 'Main',
    params: { screen: 'HomeStack', params: { screen: 'MemoryMatch' } },
    aliases: ['chơi memory', 'memory match', 'trò chơi trí nhớ', 'ghép hình', 'memory game'],
    description: 'Chơi Memory Match',
    category: 'games'
  },
  
  'minesweeper': {
    screen: 'Main',
    params: { screen: 'HomeStack', params: { screen: 'Minesweeper' } },
    aliases: ['chơi minesweeper', 'dò mìn', 'trò chơi dò mìn', 'minesweeper game'],
    description: 'Chơi Minesweeper',
    category: 'games'
  },
  
  'wordsearch': {
    screen: 'Main',
    params: { screen: 'HomeStack', params: { screen: 'WordSearch' } },
    aliases: ['chơi word search', 'tìm từ', 'trò chơi tìm từ', 'word search game', 'từ vựng'],
    description: 'Chơi Word Search',
    category: 'games'
  },
  
  // === BOOKS ===
  'books': {
    screen: 'Main',
    params: { screen: 'HomeStack', params: { screen: 'BookLibrary' } },
    aliases: ['sách', 'đọc sách', 'thư viện sách', 'truyện', 'đọc truyện', 'sách điện tử', 'thư viện'],
    description: 'Mở thư viện sách',
    category: 'books'
  },
  
  'bookmarks': {
    screen: 'Main',
    params: { screen: 'HomeStack', params: { screen: 'BookBookmark' } },
    aliases: ['đánh dấu sách', 'bookmark', 'sách đã đánh dấu', 'đánh dấu trang'],
    description: 'Xem sách đã đánh dấu',
    category: 'books'
  },
  
  'bookstats': {
    screen: 'Main',
    params: { screen: 'HomeStack', params: { screen: 'BookStats' } },
    aliases: ['thống kê sách', 'số liệu đọc sách', 'tiến độ đọc', 'thống kê đọc sách'],
    description: 'Xem thống kê đọc sách',
    category: 'books'
  },
  
  'booksettings': {
    screen: 'Main',
    params: { screen: 'HomeStack', params: { screen: 'BookSettings' } },
    aliases: ['cài đặt sách', 'thiết lập sách', 'tùy chỉnh sách', 'cấu hình sách'],
    description: 'Cài đặt sách',
    category: 'books'
  },
  
  // === SETTINGS & PROFILE ===
  'settings': {
    screen: 'Main',
    params: { screen: 'Settings' },
    aliases: ['cài đặt', 'thiết lập', 'tùy chọn', 'cấu hình', 'tùy chỉnh', 'thiết lập'],
    description: 'Mở cài đặt',
    category: 'settings'
  },
  
  'profile': {
    screen: 'Main',
    params: { screen: 'Settings', params: { screen: 'ElderlyProfile' } },
    aliases: ['hồ sơ', 'thông tin cá nhân', 'tài khoản', 'cá nhân', 'thông tin của tôi', 'profile'],
    description: 'Xem hồ sơ cá nhân',
    category: 'settings'
  },
  
  'editprofile': {
    screen: 'Main',
    params: { screen: 'Settings', params: { screen: 'EditProfile' } },
    aliases: ['chỉnh sửa hồ sơ', 'sửa thông tin', 'cập nhật thông tin', 'thay đổi thông tin'],
    description: 'Chỉnh sửa hồ sơ',
    category: 'settings'
  },
  
  'restrictedcontent': {
    screen: 'RestrictedContentSettings',
    aliases: ['nội dung hạn chế', 'từ khóa hạn chế', 'lọc nội dung', 'bảo vệ nội dung'],
    description: 'Cài đặt nội dung hạn chế',
    category: 'settings'
  },
  
  'emergencycall': {
    screen: 'EmergencyCallSettings',
    aliases: ['cài đặt gọi cấp cứu', 'sos', 'khẩn cấp', 'cấp cứu', 'gọi khẩn cấp'],
    description: 'Cài đặt gọi cấp cứu',
    category: 'settings'
  },
  
  // === PREMIUM ===
  'premium': {
    screen: 'ElderlyPremiumInfo',
    aliases: ['nâng cấp', 'premium', 'gia đình premium', 'thông tin premium', 'tài khoản premium', 'gói premium'],
    description: 'Xem thông tin premium',
    category: 'settings'
  },
  
  // === EMERGENCY ===
  'emergency': {
    screen: 'Main',
    aliases: ['khẩn cấp', 'gọi cấp cứu', 'sos', 'cứu hộ', 'số khẩn cấp', 'cấp cứu'],
    description: 'Gọi cấp cứu',
    category: 'health'
  },
  
  // === HELP & SUPPORT ===
  'help': {
    screen: 'VoiceHelp',
    aliases: ['trợ giúp', 'hỗ trợ', 'hướng dẫn', 'cách sử dụng', 'lệnh thoại', 'giúp đỡ'],
    description: 'Xem hướng dẫn lệnh thoại',
    category: 'settings'
  },
  
  // === ADDITIONAL COMMANDS ===
  'back': {
    screen: 'Main',
    aliases: ['quay lại', 'trở lại', 'quay về', 'lùi lại', 'trước đó'],
    description: 'Quay lại màn hình trước',
    category: 'main'
  },
  
  'close': {
    screen: 'Main',
    aliases: ['đóng', 'thoát', 'tắt', 'kết thúc', 'dừng'],
    description: 'Đóng màn hình hiện tại',
    category: 'main'
  },

  // === ADDITIONAL FEATURES ===
  'logout': {
    screen: 'Main',
    params: { screen: 'Settings', params: { screen: 'ElderlySettings' } },
    aliases: ['đăng xuất', 'thoát đăng nhập', 'đăng xuất khỏi tài khoản', 'thoát'],
    description: 'Đăng xuất khỏi tài khoản',
    category: 'settings'
  },

  'about': {
    screen: 'Main',
    params: { screen: 'Settings', params: { screen: 'ElderlySettings' } },
    aliases: ['thông tin', 'về ứng dụng', 'giới thiệu', 'thông tin app'],
    description: 'Xem thông tin ứng dụng',
    category: 'settings'
  }
};

// Helper function to normalize Vietnamese text
export const normalizeVietnameseText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^\w\s]/g, ' ') // Replace special characters with spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
};

// Helper function to calculate similarity between two strings
export const calculateSimilarity = (str1: string, str2: string): number => {
  const normalized1 = normalizeVietnameseText(str1);
  const normalized2 = normalizeVietnameseText(str2);
  
  if (normalized1 === normalized2) return 1;
  
  const words1 = normalized1.split(' ');
  const words2 = normalized2.split(' ');
  
  const commonWords = words1.filter(word => words2.includes(word));
  const totalWords = Math.max(words1.length, words2.length);
  
  return commonWords.length / totalWords;
};

// Main function to process voice command and return navigation action
export const processVoiceCommand = (voiceText: string, navigation: any): VoiceNavigationResult => {
  const normalizedVoiceText = normalizeVietnameseText(voiceText);
  
  // Direct command matching
  for (const [command, config] of Object.entries(ELDERLY_VOICE_COMMANDS)) {
    // Check exact match
    if (normalizedVoiceText === normalizeVietnameseText(command)) {
      return handleNavigation(config, command, navigation);
    }
    
    // Check aliases
    const aliases = config.aliases || [];
    for (const alias of aliases) {
      const normalizedAlias = normalizeVietnameseText(alias);
      if (normalizedVoiceText.includes(normalizedAlias) || normalizedAlias.includes(normalizedVoiceText)) {
        return handleNavigation(config, command, navigation);
      }
    }
  }
  
  // Fuzzy matching
  let bestMatch: { command: string; config: any; similarity: number } | null = null;
  let maxSimilarity = 0.3; // Minimum similarity threshold
  
  for (const [command, config] of Object.entries(ELDERLY_VOICE_COMMANDS)) {
    const commandSimilarity = calculateSimilarity(normalizedVoiceText, normalizeVietnameseText(command));
    
    // Check aliases similarity
    const aliases = config.aliases || [];
    const aliasSimilarities = aliases.map(alias => 
      calculateSimilarity(normalizedVoiceText, normalizeVietnameseText(alias))
    );
    
    const maxAliasSimilarity = Math.max(...aliasSimilarities);
    const similarity = Math.max(commandSimilarity, maxAliasSimilarity);
    
    if (similarity > maxSimilarity) {
      maxSimilarity = similarity;
      bestMatch = { command, config, similarity };
    }
  }
  
  if (bestMatch) {
    return handleNavigation(bestMatch.config, bestMatch.command, navigation);
  }
  
  return {
    success: false,
    command: voiceText,
    message: 'Không hiểu lệnh. Vui lòng thử lại hoặc nói "trợ giúp" để xem danh sách lệnh.',
    confidence: 0
  };
};

// Get available commands for help
export const getAvailableCommands = (): Array<{
  command: string;
  description: string;
  category: string;
  examples: string[];
}> => {
  return Object.entries(ELDERLY_VOICE_COMMANDS).map(([command, config]) => ({
    command,
    description: config.description,
    category: config.category,
    examples: [command, ...config.aliases.slice(0, 2)] // Show first 2 aliases as examples
  }));
};

// Get commands by category
export const getCommandsByCategory = () => {
  const categories: { [key: string]: any[] } = {};
  
  Object.entries(ELDERLY_VOICE_COMMANDS).forEach(([command, config]) => {
    if (!categories[config.category]) {
      categories[config.category] = [];
    }
    categories[config.category].push({
      command,
      description: config.description,
      examples: [command, ...config.aliases.slice(0, 2)]
    });
  });
  
  return categories;
};

// Voice feedback messages
export const VOICE_FEEDBACK_MESSAGES = {
  listening: 'Đang nghe...',
  processing: 'Đang xử lý...',
  success: 'Thành công!',
  error: 'Có lỗi xảy ra',
  noMatch: 'Không hiểu lệnh. Vui lòng thử lại hoặc nói "trợ giúp" để xem danh sách lệnh.',
  permissionDenied: 'Cần quyền truy cập microphone',
  networkError: 'Lỗi kết nối mạng',
  tryAgain: 'Vui lòng thử lại'
}; 
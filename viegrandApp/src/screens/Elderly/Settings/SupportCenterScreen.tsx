import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const SupportCenterScreen = () => {
  const navigation = useNavigation<any>();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const faqData: FAQItem[] = [
    {
      question: "Làm thế nào để sử dụng tính năng gọi khẩn cấp?",
      answer: "Nhấn nút SOS màu đỏ ở giữa màn hình chính. Hệ thống sẽ tự động gọi số khẩn cấp đã cài đặt. Bạn có thể thay đổi số này trong Cài đặt > Khẩn cấp.",
      category: "Khẩn cấp"
    },
    {
      question: "Cách kết nối với người thân?",
      answer: "Người thân cần quét mã QR từ Private Key của bạn hoặc nhập Private Key để kết nối. Sau khi kết nối, họ có thể gửi tin nhắn và nhắc nhở cho bạn.",
      category: "Kết nối"
    },
    {
      question: "Làm sao để sử dụng lệnh thoại?",
      answer: "Nhấn nút micro ở giữa màn hình chính và nói lệnh như 'Gọi điện', 'Nhắn tin', 'Mở sách', 'Chơi game'. Hệ thống sẽ thực hiện lệnh tương ứng.",
      category: "Lệnh thoại"
    },
    {
      question: "Cách đọc sách và chơi game?",
      answer: "Vào mục Giải trí từ màn hình chính. Chọn 'Sách' để đọc sách hoặc 'Game' để chơi các trò chơi như Sudoku, Memory Match, Minesweeper.",
      category: "Giải trí"
    },
    {
      question: "Làm thế nào để kiểm tra sức khỏe?",
      answer: "Vào mục Sức khỏe từ màn hình chính. Chụp ảnh kết quả xét nghiệm và hệ thống sẽ phân tích các chỉ số sức khỏe cho bạn.",
      category: "Sức khỏe"
    },
    {
      question: "Cách cài đặt nhắc nhở?",
      answer: "Người thân có thể tạo nhắc nhở cho bạn thông qua ứng dụng. Bạn sẽ nhận được thông báo khi đến giờ nhắc nhở.",
      category: "Nhắc nhở"
    },
    {
      question: "Làm sao để nâng cấp lên Premium?",
      answer: "Vào Cài đặt > Premium để xem các gói dịch vụ. Chọn gói phù hợp và làm theo hướng dẫn thanh toán.",
      category: "Premium"
    },
    {
      question: "Cách thay đổi mật khẩu?",
      answer: "Vào Cài đặt > Bảo mật > Đổi mật khẩu. Nhập mật khẩu cũ và mật khẩu mới để thay đổi.",
      category: "Bảo mật"
    }
  ];

  const contactOptions = [
    {
      title: "Gọi điện hỗ trợ",
      subtitle: "1900-xxxx",
      icon: "phone",
      action: () => {
        Alert.alert(
          "Gọi hỗ trợ",
          "Bạn có muốn gọi số hỗ trợ 1900-xxxx không?",
          [
            { text: "Hủy", style: "cancel" },
            { 
              text: "Gọi", 
              onPress: () => Linking.openURL('tel:1900-xxxx')
            }
          ]
        );
      }
    },
    {
      title: "Email hỗ trợ",
      subtitle: "support@viegrand.app",
      icon: "mail",
      action: () => {
        Linking.openURL('mailto:support@viegrand.app?subject=Hỗ trợ VieGrand App');
      }
    },
    {
      title: "Chat trực tuyến",
      subtitle: "Trò chuyện với nhân viên",
      icon: "message-circle",
      action: () => {
        Alert.alert(
          "Chat trực tuyến",
          "Tính năng này sẽ được cập nhật trong phiên bản tiếp theo.",
          [{ text: "OK" }]
        );
      }
    }
  ];

  const helpResources = [
    {
      title: "Hướng dẫn sử dụng",
      subtitle: "Xem video hướng dẫn chi tiết",
      icon: "play-circle",
      action: () => {
        Alert.alert(
          "Hướng dẫn sử dụng",
          "Video hướng dẫn sẽ được cập nhật sớm.",
          [{ text: "OK" }]
        );
      }
    },
    {
      title: "Cập nhật ứng dụng",
      subtitle: "Kiểm tra phiên bản mới",
      icon: "download",
      action: () => {
        Alert.alert(
          "Cập nhật ứng dụng",
          "Ứng dụng đã được cập nhật lên phiên bản mới nhất.",
          [{ text: "OK" }]
        );
      }
    }
  ];

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const renderFAQItem = (item: FAQItem, index: number) => {
    const isExpanded = expandedFAQ === index;
    
    return (
      <TouchableOpacity
        key={index}
        style={styles.faqItem}
        onPress={() => toggleFAQ(index)}
        activeOpacity={0.7}
      >
        <View style={styles.faqHeader}>
          <View style={styles.faqContent}>
            <Text style={styles.faqQuestion}>{item.question}</Text>
            <Text style={styles.faqCategory}>{item.category}</Text>
          </View>
          <Feather 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#007AFF" 
          />
        </View>
        {isExpanded && (
          <View style={styles.faqAnswer}>
            <Text style={styles.faqAnswerText}>{item.answer}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderContactOption = (option: any, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.contactItem}
      onPress={option.action}
      activeOpacity={0.7}
    >
      <View style={styles.contactIcon}>
        <Feather name={option.icon} size={24} color="#007AFF" />
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactTitle}>{option.title}</Text>
        <Text style={styles.contactSubtitle}>{option.subtitle}</Text>
      </View>
      <Feather name="chevron-right" size={20} color="#C7C7CC" />
    </TouchableOpacity>
  );

  const renderHelpResource = (resource: any, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.helpItem}
      onPress={resource.action}
      activeOpacity={0.7}
    >
      <View style={styles.helpIcon}>
        <Feather name={resource.icon} size={24} color="#007AFF" />
      </View>
      <View style={styles.helpInfo}>
        <Text style={styles.helpTitle}>{resource.title}</Text>
        <Text style={styles.helpSubtitle}>{resource.subtitle}</Text>
      </View>
      <Feather name="chevron-right" size={20} color="#C7C7CC" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Feather name="chevron-left" size={24} color="#007AFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Trung tâm hỗ trợ</Text>
            <View style={styles.headerSpacer} />
          </View>
          <Text style={styles.headerSubtitle}>
            Tìm kiếm câu trả lời và liên hệ với chúng tôi
          </Text>
        </View>

        {/* Contact Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Liên hệ hỗ trợ</Text>
          <View style={styles.contactContainer}>
            {contactOptions.map(renderContactOption)}
          </View>
        </View>

        {/* Help Resources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tài nguyên hỗ trợ</Text>
          <View style={styles.helpContainer}>
            {helpResources.map(renderHelpResource)}
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Câu hỏi thường gặp</Text>
          <View style={styles.faqContainer}>
            {faqData.map(renderFAQItem)}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Không tìm thấy câu trả lời? Hãy liên hệ với chúng tôi
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    flex: 1,
  },
  headerSpacer: {
    width: 40,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 22,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  contactContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  helpContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  helpIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  helpInfo: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  helpSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  faqContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  faqContent: {
    flex: 1,
    marginRight: 12,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 4,
    lineHeight: 22,
  },
  faqCategory: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
});

export default SupportCenterScreen; 
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';

const TermsOfServiceScreen = () => {
  const navigation = useNavigation<any>();
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
            <Text style={styles.headerTitle}>Điều khoản dịch vụ</Text>
            <View style={styles.headerSpacer} />
          </View>
          <Text style={styles.lastUpdated}>Cập nhật lần cuối: 15/12/2024</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Chấp nhận điều khoản</Text>
            <Text style={styles.paragraph}>
              Bằng việc tải xuống, cài đặt hoặc sử dụng ứng dụng VieGrand ("Ứng dụng"), bạn đồng ý tuân thủ và bị ràng buộc bởi các điều khoản dịch vụ này ("Điều khoản"). Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, vui lòng không sử dụng Ứng dụng.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Mô tả dịch vụ</Text>
            <Text style={styles.paragraph}>
              VieGrand là một ứng dụng di động được thiết kế để hỗ trợ người cao tuổi và gia đình của họ trong việc giao tiếp, theo dõi sức khỏe, và quản lý cuộc sống hàng ngày. Ứng dụng bao gồm các tính năng như:
            </Text>
            <Text style={styles.bulletPoint}>• Giao tiếp với gia đình và bạn bè</Text>
            <Text style={styles.bulletPoint}>• Theo dõi sức khỏe và nhắc nhở thuốc</Text>
            <Text style={styles.bulletPoint}>• Gọi khẩn cấp và báo động</Text>
            <Text style={styles.bulletPoint}>• Giải trí và trò chơi</Text>
            <Text style={styles.bulletPoint}>• Đọc sách và nội dung giáo dục</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Đăng ký và tài khoản</Text>
            <Text style={styles.paragraph}>
              Để sử dụng một số tính năng của Ứng dụng, bạn có thể cần tạo tài khoản. Bạn có trách nhiệm:
            </Text>
            <Text style={styles.bulletPoint}>• Cung cấp thông tin chính xác và cập nhật</Text>
            <Text style={styles.bulletPoint}>• Bảo mật thông tin đăng nhập của bạn</Text>
            <Text style={styles.bulletPoint}>• Thông báo ngay lập tức về bất kỳ vi phạm bảo mật nào</Text>
            <Text style={styles.bulletPoint}>• Chịu trách nhiệm về tất cả hoạt động xảy ra dưới tài khoản của bạn</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Sử dụng dịch vụ</Text>
            <Text style={styles.paragraph}>
              Bạn đồng ý sử dụng Ứng dụng chỉ cho các mục đích hợp pháp và phù hợp với các điều khoản này. Bạn không được:
            </Text>
            <Text style={styles.bulletPoint}>• Sử dụng Ứng dụng cho bất kỳ mục đích bất hợp pháp nào</Text>
            <Text style={styles.bulletPoint}>• Vi phạm quyền sở hữu trí tuệ của chúng tôi hoặc bên thứ ba</Text>
            <Text style={styles.bulletPoint}>• Gửi nội dung xấu, lạm dụng hoặc gây hại</Text>
            <Text style={styles.bulletPoint}>• Cố gắng truy cập trái phép vào hệ thống của chúng tôi</Text>
            <Text style={styles.bulletPoint}>• Sử dụng Ứng dụng để quấy rối hoặc làm phiền người khác</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Quyền riêng tư</Text>
            <Text style={styles.paragraph}>
              Việc thu thập và sử dụng thông tin cá nhân của bạn được điều chỉnh bởi Chính sách Bảo mật của chúng tôi. Bằng việc sử dụng Ứng dụng, bạn đồng ý với việc thu thập và sử dụng thông tin theo Chính sách Bảo mật.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Nội dung người dùng</Text>
            <Text style={styles.paragraph}>
              Bạn giữ quyền sở hữu đối với nội dung bạn tạo hoặc chia sẻ thông qua Ứng dụng. Tuy nhiên, bạn cấp cho chúng tôi quyền sử dụng, sao chép, và hiển thị nội dung đó để cung cấp dịch vụ.
            </Text>
            <Text style={styles.paragraph}>
              Bạn đảm bảo rằng nội dung bạn chia sẻ không vi phạm quyền của bên thứ ba và tuân thủ tất cả luật pháp hiện hành.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Dịch vụ Premium</Text>
            <Text style={styles.paragraph}>
              Một số tính năng của Ứng dụng có thể yêu cầu đăng ký Premium. Các điều khoản thanh toán và hủy bỏ sẽ được hiển thị tại thời điểm đăng ký.
            </Text>
            <Text style={styles.paragraph}>
              Chúng tôi có thể thay đổi giá cả hoặc tính năng của dịch vụ Premium với thông báo trước 30 ngày.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. Từ chối trách nhiệm</Text>
            <Text style={styles.paragraph}>
              Ứng dụng được cung cấp "nguyên trạng" mà không có bảo hành nào. Chúng tôi không đảm bảo rằng Ứng dụng sẽ không bị gián đoạn hoặc không có lỗi.
            </Text>
            <Text style={styles.paragraph}>
              Chúng tôi không chịu trách nhiệm về bất kỳ thiệt hại nào phát sinh từ việc sử dụng Ứng dụng, bao gồm nhưng không giới hạn ở thiệt hại gián tiếp, ngẫu nhiên, hoặc hậu quả.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. Giới hạn trách nhiệm</Text>
            <Text style={styles.paragraph}>
              Trong phạm vi tối đa được phép theo luật pháp, trách nhiệm tổng thể của chúng tôi đối với bất kỳ khiếu nại nào liên quan đến việc sử dụng Ứng dụng sẽ không vượt quá số tiền bạn đã trả cho chúng tôi trong 12 tháng trước đó.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>10. Chấm dứt</Text>
            <Text style={styles.paragraph}>
              Chúng tôi có thể chấm dứt hoặc tạm ngưng quyền truy cập của bạn vào Ứng dụng bất cứ lúc nào, vì bất kỳ lý do gì, mà không cần thông báo trước.
            </Text>
            <Text style={styles.paragraph}>
              Khi chấm dứt, quyền sử dụng Ứng dụng của bạn sẽ ngay lập tức chấm dứt và bạn phải ngừng sử dụng Ứng dụng.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>11. Thay đổi điều khoản</Text>
            <Text style={styles.paragraph}>
              Chúng tôi có thể cập nhật các điều khoản này bất cứ lúc nào. Chúng tôi sẽ thông báo cho bạn về bất kỳ thay đổi nào bằng cách đăng các điều khoản mới trong Ứng dụng.
            </Text>
            <Text style={styles.paragraph}>
              Việc tiếp tục sử dụng Ứng dụng sau khi thay đổi có hiệu lực được coi là chấp nhận các điều khoản mới.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>12. Luật áp dụng</Text>
            <Text style={styles.paragraph}>
              Các điều khoản này sẽ được điều chỉnh và giải thích theo luật pháp Việt Nam. Bất kỳ tranh chấp nào phát sinh từ việc sử dụng Ứng dụng sẽ được giải quyết tại tòa án có thẩm quyền tại Việt Nam.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>13. Liên hệ</Text>
            <Text style={styles.paragraph}>
              Nếu bạn có bất kỳ câu hỏi nào về các điều khoản này, vui lòng liên hệ với chúng tôi tại:
            </Text>
            <Text style={styles.contactInfo}>Email: legal@viegrand.app</Text>
            <Text style={styles.contactInfo}>Điện thoại: 1900-xxxx</Text>
            <Text style={styles.contactInfo}>Địa chỉ: [Địa chỉ công ty]</Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Bằng việc sử dụng Ứng dụng VieGrand, bạn xác nhận rằng bạn đã đọc, hiểu và đồng ý với tất cả các điều khoản và điều kiện được nêu trong tài liệu này.
            </Text>
          </View>
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
  lastUpdated: {
    fontSize: 14,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
    lineHeight: 24,
  },
  paragraph: {
    fontSize: 15,
    color: '#3A3A3C',
    lineHeight: 22,
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 15,
    color: '#3A3A3C',
    lineHeight: 22,
    marginLeft: 16,
    marginBottom: 4,
  },
  contactInfo: {
    fontSize: 15,
    color: '#007AFF',
    lineHeight: 22,
    marginBottom: 4,
    fontWeight: '500',
  },
  footer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  footerText: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default TermsOfServiceScreen; 
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

const PrivacyPolicyScreen = () => {
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
            <Text style={styles.headerTitle}>Chính sách bảo mật</Text>
            <View style={styles.headerSpacer} />
          </View>
          <Text style={styles.lastUpdated}>Cập nhật lần cuối: 15/12/2024</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Giới thiệu</Text>
            <Text style={styles.paragraph}>
              VieGrand ("chúng tôi", "của chúng tôi", hoặc "công ty") cam kết bảo vệ quyền riêng tư của bạn. Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng, và bảo vệ thông tin cá nhân của bạn khi bạn sử dụng ứng dụng VieGrand.
            </Text>
            <Text style={styles.paragraph}>
              Bằng việc sử dụng Ứng dụng, bạn đồng ý với việc thu thập và sử dụng thông tin theo chính sách này.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Thông tin chúng tôi thu thập</Text>
            
            <Text style={styles.subsectionTitle}>2.1 Thông tin cá nhân</Text>
            <Text style={styles.paragraph}>
              Chúng tôi có thể thu thập các thông tin cá nhân sau đây:
            </Text>
            <Text style={styles.bulletPoint}>• Tên, email, số điện thoại</Text>
            <Text style={styles.bulletPoint}>• Thông tin hồ sơ (tuổi, giới tính, địa chỉ)</Text>
            <Text style={styles.bulletPoint}>• Thông tin sức khỏe (nhóm máu, bệnh mãn tính, dị ứng)</Text>
            <Text style={styles.bulletPoint}>• Thông tin liên hệ khẩn cấp</Text>
            <Text style={styles.bulletPoint}>• Ảnh đại diện và ảnh sức khỏe</Text>

            <Text style={styles.subsectionTitle}>2.2 Thông tin thiết bị</Text>
            <Text style={styles.paragraph}>
              Chúng tôi có thể thu thập thông tin về thiết bị của bạn:
            </Text>
            <Text style={styles.bulletPoint}>• Loại thiết bị và hệ điều hành</Text>
            <Text style={styles.bulletPoint}>• Địa chỉ IP và thông tin mạng</Text>
            <Text style={styles.bulletPoint}>• Token thiết bị cho thông báo đẩy</Text>
            <Text style={styles.bulletPoint}>• Thông tin về cách sử dụng ứng dụng</Text>

            <Text style={styles.subsectionTitle}>2.3 Thông tin sử dụng</Text>
            <Text style={styles.paragraph}>
              Chúng tôi thu thập thông tin về cách bạn sử dụng Ứng dụng:
            </Text>
            <Text style={styles.bulletPoint}>• Các tính năng bạn sử dụng</Text>
            <Text style={styles.bulletPoint}>• Thời gian sử dụng</Text>
            <Text style={styles.bulletPoint}>• Lệnh thoại và tương tác</Text>
            <Text style={styles.bulletPoint}>• Tin nhắn và cuộc gọi</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Cách chúng tôi sử dụng thông tin</Text>
            <Text style={styles.paragraph}>
              Chúng tôi sử dụng thông tin thu thập được để:
            </Text>
            <Text style={styles.bulletPoint}>• Cung cấp và duy trì dịch vụ</Text>
            <Text style={styles.bulletPoint}>• Xử lý thanh toán và quản lý tài khoản Premium</Text>
            <Text style={styles.bulletPoint}>• Gửi thông báo và cập nhật</Text>
            <Text style={styles.bulletPoint}>• Cải thiện và phát triển Ứng dụng</Text>
            <Text style={styles.bulletPoint}>• Phân tích sử dụng và tối ưu hóa hiệu suất</Text>
            <Text style={styles.bulletPoint}>• Đảm bảo an toàn và ngăn chặn gian lận</Text>
            <Text style={styles.bulletPoint}>• Tuân thủ nghĩa vụ pháp lý</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Chia sẻ thông tin</Text>
            <Text style={styles.paragraph}>
              Chúng tôi có thể chia sẻ thông tin của bạn trong các trường hợp sau:
            </Text>
            
            <Text style={styles.subsectionTitle}>4.1 Với người dùng khác</Text>
            <Text style={styles.paragraph}>
              Thông tin cơ bản của bạn (tên, ảnh đại diện) có thể được hiển thị cho người thân và bạn bè mà bạn đã kết nối.
            </Text>

            <Text style={styles.subsectionTitle}>4.2 Với nhà cung cấp dịch vụ</Text>
            <Text style={styles.paragraph}>
              Chúng tôi có thể chia sẻ thông tin với các nhà cung cấp dịch vụ bên thứ ba để:
            </Text>
            <Text style={styles.bulletPoint}>• Xử lý thanh toán</Text>
            <Text style={styles.bulletPoint}>• Gửi thông báo đẩy</Text>
            <Text style={styles.bulletPoint}>• Phân tích dữ liệu</Text>
            <Text style={styles.bulletPoint}>• Lưu trữ đám mây</Text>

            <Text style={styles.subsectionTitle}>4.3 Yêu cầu pháp lý</Text>
            <Text style={styles.paragraph}>
              Chúng tôi có thể tiết lộ thông tin nếu được yêu cầu bởi luật pháp hoặc để bảo vệ quyền và tài sản của chúng tôi hoặc người khác.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Bảo mật thông tin</Text>
            <Text style={styles.paragraph}>
              Chúng tôi thực hiện các biện pháp bảo mật phù hợp để bảo vệ thông tin cá nhân của bạn:
            </Text>
            <Text style={styles.bulletPoint}>• Mã hóa dữ liệu trong quá trình truyền tải</Text>
            <Text style={styles.bulletPoint}>• Mã hóa dữ liệu khi lưu trữ</Text>
            <Text style={styles.bulletPoint}>• Kiểm soát truy cập nghiêm ngặt</Text>
            <Text style={styles.bulletPoint}>• Giám sát bảo mật liên tục</Text>
            <Text style={styles.bulletPoint}>• Đào tạo nhân viên về bảo mật</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Quyền của bạn</Text>
            <Text style={styles.paragraph}>
              Bạn có các quyền sau đối với thông tin cá nhân của mình:
            </Text>
            <Text style={styles.bulletPoint}>• Quyền truy cập: Xem thông tin chúng tôi lưu trữ</Text>
            <Text style={styles.bulletPoint}>• Quyền sửa đổi: Cập nhật thông tin không chính xác</Text>
            <Text style={styles.bulletPoint}>• Quyền xóa: Yêu cầu xóa thông tin cá nhân</Text>
            <Text style={styles.bulletPoint}>• Quyền hạn chế: Hạn chế cách chúng tôi sử dụng thông tin</Text>
            <Text style={styles.bulletPoint}>• Quyền di chuyển: Nhận bản sao thông tin của bạn</Text>
            <Text style={styles.bulletPoint}>• Quyền phản đối: Phản đối việc xử lý thông tin</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Cookie và công nghệ theo dõi</Text>
            <Text style={styles.paragraph}>
              Chúng tôi có thể sử dụng cookie và các công nghệ tương tự để:
            </Text>
            <Text style={styles.bulletPoint}>• Ghi nhớ tùy chọn và cài đặt</Text>
            <Text style={styles.bulletPoint}>• Phân tích cách sử dụng Ứng dụng</Text>
            <Text style={styles.bulletPoint}>• Cải thiện trải nghiệm người dùng</Text>
            <Text style={styles.bulletPoint}>• Cung cấp nội dung được cá nhân hóa</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. Thông báo đẩy</Text>
            <Text style={styles.paragraph}>
              Chúng tôi có thể gửi thông báo đẩy để:
            </Text>
            <Text style={styles.bulletPoint}>• Thông báo tin nhắn mới</Text>
            <Text style={styles.bulletPoint}>• Nhắc nhở thuốc và cuộc hẹn</Text>
            <Text style={styles.bulletPoint}>• Cập nhật ứng dụng</Text>
            <Text style={styles.bulletPoint}>• Thông báo khẩn cấp</Text>
            <Text style={styles.paragraph}>
              Bạn có thể tắt thông báo đẩy trong cài đặt thiết bị hoặc ứng dụng.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. Lưu trữ dữ liệu</Text>
            <Text style={styles.paragraph}>
              Chúng tôi lưu trữ thông tin cá nhân của bạn trong thời gian cần thiết để:
            </Text>
            <Text style={styles.bulletPoint}>• Cung cấp dịch vụ</Text>
            <Text style={styles.bulletPoint}>• Tuân thủ nghĩa vụ pháp lý</Text>
            <Text style={styles.bulletPoint}>• Giải quyết tranh chấp</Text>
            <Text style={styles.bulletPoint}>• Thực thi thỏa thuận</Text>
            <Text style={styles.paragraph}>
              Khi không còn cần thiết, chúng tôi sẽ xóa hoặc ẩn danh hóa thông tin của bạn.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>10. Chuyển giao dữ liệu</Text>
            <Text style={styles.paragraph}>
              Thông tin của bạn có thể được chuyển giao và xử lý tại các quốc gia khác với quốc gia của bạn. Chúng tôi đảm bảo rằng việc chuyển giao này tuân thủ các quy định bảo vệ dữ liệu hiện hành.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>11. Trẻ em</Text>
            <Text style={styles.paragraph}>
              Ứng dụng không nhằm mục đích sử dụng cho trẻ em dưới 13 tuổi. Chúng tôi không cố ý thu thập thông tin cá nhân từ trẻ em dưới 13 tuổi. Nếu bạn là cha mẹ hoặc người giám hộ và biết rằng con bạn đã cung cấp thông tin cá nhân cho chúng tôi, vui lòng liên hệ với chúng tôi.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>12. Thay đổi chính sách</Text>
            <Text style={styles.paragraph}>
              Chúng tôi có thể cập nhật chính sách bảo mật này theo thời gian. Chúng tôi sẽ thông báo cho bạn về bất kỳ thay đổi nào bằng cách đăng chính sách mới trong Ứng dụng và cập nhật ngày "Cập nhật lần cuối".
            </Text>
            <Text style={styles.paragraph}>
              Việc tiếp tục sử dụng Ứng dụng sau khi thay đổi có hiệu lực được coi là chấp nhận chính sách mới.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>13. Liên hệ</Text>
            <Text style={styles.paragraph}>
              Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật này hoặc muốn thực hiện quyền của mình, vui lòng liên hệ với chúng tôi:
            </Text>
            <Text style={styles.contactInfo}>Email: privacy@viegrand.app</Text>
            <Text style={styles.contactInfo}>Điện thoại: 1900-xxxx</Text>
            <Text style={styles.contactInfo}>Địa chỉ: [Địa chỉ công ty]</Text>
            <Text style={styles.paragraph}>
              Chúng tôi sẽ phản hồi yêu cầu của bạn trong vòng 30 ngày.
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Bằng việc sử dụng Ứng dụng VieGrand, bạn xác nhận rằng bạn đã đọc và hiểu Chính sách Bảo mật này và đồng ý với việc thu thập, sử dụng, và chia sẻ thông tin theo các điều khoản được mô tả.
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
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 16,
    marginBottom: 8,
    lineHeight: 22,
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

export default PrivacyPolicyScreen; 
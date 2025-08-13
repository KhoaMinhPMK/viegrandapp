import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { Linking, Platform } from 'react-native';

interface PermissionGuideModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

const PermissionGuideModal = ({ visible, onClose, onOpenSettings }: PermissionGuideModalProps) => {
  const steps = [
    {
      number: '1',
      title: 'Mở Cài đặt',
      description: 'Vào Cài đặt trên điện thoại',
      icon: 'settings',
    },
    {
      number: '2',
      title: 'Tìm ứng dụng',
      description: 'Tìm và chọn "ViegrandApp"',
      icon: 'monitor',
    },
    {
      number: '3',
      title: 'Chọn Quyền',
      description: 'Nhấn vào "Quyền" hoặc "Permissions"',
      icon: 'shield',
    },
    {
      number: '4',
      title: 'Bật quyền gọi điện',
      description: 'Bật "Gọi điện thoại" hoặc "Phone"',
      icon: 'phone',
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Hướng dẫn cấp quyền</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.infoSection}>
              <View style={styles.iconContainer}>
                <Feather name="phone" size={32} color="#FF3B30" />
              </View>
              <Text style={styles.infoTitle}>Quyền gọi điện cần thiết</Text>
              <Text style={styles.infoDescription}>
                Để sử dụng tính năng gọi khẩn cấp, ứng dụng cần quyền gọi điện. 
                Vui lòng làm theo các bước bên dưới:
              </Text>
            </View>

            <View style={styles.stepsContainer}>
              {steps.map((step, index) => (
                <View key={index} style={styles.stepItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{step.number}</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <View style={styles.stepHeader}>
                      <Feather name={step.icon as any} size={20} color="#007AFF" />
                      <Text style={styles.stepTitle}>{step.title}</Text>
                    </View>
                    <Text style={styles.stepDescription}>{step.description}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.noteSection}>
              <Text style={styles.noteTitle}>Lưu ý:</Text>
              <Text style={styles.noteText}>
                • Quyền này chỉ được sử dụng cho tính năng gọi khẩn cấp{'\n'}
                • Ứng dụng không thể gọi điện mà không có quyền này{'\n'}
                • Bạn có thể tắt quyền này bất cứ lúc nào trong Cài đặt
              </Text>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Để sau</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsButton} onPress={onOpenSettings}>
              <Feather name="settings" size={20} color="#FFFFFF" />
              <Text style={styles.settingsButtonText}>Mở Cài đặt</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  infoSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
    textAlign: 'center',
  },
  infoDescription: {
    fontSize: 14,
    color: '#6D6D70',
    textAlign: 'center',
    lineHeight: 20,
  },
  stepsContainer: {
    marginVertical: 20,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  stepContent: {
    flex: 1,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginLeft: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: '#6D6D70',
    lineHeight: 20,
  },
  noteSection: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    marginVertical: 20,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    color: '#6D6D70',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  settingsButton: {
    flex: 2,
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});

export default PermissionGuideModal; 
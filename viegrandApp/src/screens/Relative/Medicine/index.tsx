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
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface ElderlyUser {
  userId: number;
  userName: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  private_key: string;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  duration: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'paused';
  elderlyUserId: number;
  elderlyName: string;
  notes?: string;
  lastTaken?: string;
  nextDose?: string;
  adherence: number; // Percentage
}

interface MedicationSchedule {
  id: string;
  medicationId: string;
  time: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  isActive: boolean;
}

const MedicineScreen = ({ navigation }: any) => {
  const [elderlyUsers, setElderlyUsers] = useState<ElderlyUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ElderlyUser | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [schedules, setSchedules] = useState<MedicationSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  
  // Form states for adding medication
  const [medicationForm, setMedicationForm] = useState({
    name: '',
    dosage: '',
    frequency: '',
    time: '',
    duration: '',
    notes: '',
  });

  // Load data on component mount
  useEffect(() => {
    loadElderlyUsers();
  }, []);

  // Load medications when user changes
  useEffect(() => {
    if (selectedUser) {
      loadMedications();
    }
  }, [selectedUser]);

  const loadElderlyUsers = async () => {
    try {
      setIsLoading(true);
      
      // Mock data for demonstration
      const mockElderlyUsers: ElderlyUser[] = [
        {
          userId: 1,
          userName: 'Nguyễn Văn A',
          email: 'elderly1@example.com',
          phone: '0123456789',
          age: 75,
          gender: 'male',
          private_key: 'key1',
        },
        {
          userId: 2,
          userName: 'Trần Thị B',
          email: 'elderly2@example.com',
          phone: '0987654321',
          age: 68,
          gender: 'female',
          private_key: 'key2',
        },
      ];

      setElderlyUsers(mockElderlyUsers);
      if (mockElderlyUsers.length > 0) {
        setSelectedUser(mockElderlyUsers[0]);
      }
    } catch (error) {
      console.error('Error loading elderly users:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách người dùng');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMedications = async () => {
    if (!selectedUser) return;

    try {
      setIsLoading(true);
      
      // Mock medications data
      const mockMedications: Medication[] = [
        {
          id: '1',
          name: 'Aspirin',
          dosage: '100mg',
          frequency: '1 lần/ngày',
          time: '08:00',
          duration: '30 ngày',
          startDate: '2024-01-01',
          endDate: '2024-01-30',
          status: 'active',
          elderlyUserId: selectedUser.userId,
          elderlyName: selectedUser.userName,
          notes: 'Uống sau khi ăn sáng',
          lastTaken: '2024-01-15 08:00',
          nextDose: '2024-01-16 08:00',
          adherence: 95,
        },
        {
          id: '2',
          name: 'Vitamin D3',
          dosage: '1000 IU',
          frequency: '1 lần/ngày',
          time: '12:00',
          duration: '90 ngày',
          startDate: '2024-01-01',
          endDate: '2024-03-30',
          status: 'active',
          elderlyUserId: selectedUser.userId,
          elderlyName: selectedUser.userName,
          notes: 'Uống trong bữa trưa',
          lastTaken: '2024-01-15 12:00',
          nextDose: '2024-01-16 12:00',
          adherence: 88,
        },
        {
          id: '3',
          name: 'Metformin',
          dosage: '500mg',
          frequency: '2 lần/ngày',
          time: '08:00, 20:00',
          duration: 'Lâu dài',
          startDate: '2023-06-01',
          endDate: '2024-12-31',
          status: 'active',
          elderlyUserId: selectedUser.userId,
          elderlyName: selectedUser.userName,
          notes: 'Uống trước bữa ăn',
          lastTaken: '2024-01-15 20:00',
          nextDose: '2024-01-16 08:00',
          adherence: 92,
        },
      ];

      setMedications(mockMedications);
    } catch (error) {
      console.error('Error loading medications:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách thuốc');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: 'active' | 'completed' | 'paused') => {
    switch (status) {
      case 'active': return '#34C759';
      case 'completed': return '#8E8E93';
      case 'paused': return '#FF9500';
      default: return '#8E8E93';
    }
  };

  const getStatusText = (status: 'active' | 'completed' | 'paused') => {
    switch (status) {
      case 'active': return 'Đang dùng';
      case 'completed': return 'Đã hoàn thành';
      case 'paused': return 'Tạm dừng';
      default: return 'Không xác định';
    }
  };

  const getAdherenceColor = (adherence: number) => {
    if (adherence >= 90) return '#34C759';
    if (adherence >= 70) return '#FF9500';
    return '#FF3B30';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const formatTime = (timeString: string) => {
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const handleAddMedication = () => {
    if (!selectedUser) {
      Alert.alert('Lỗi', 'Vui lòng chọn người dùng');
      return;
    }
    setMedicationForm({
      name: '',
      dosage: '',
      frequency: '',
      time: '',
      duration: '',
      notes: '',
    });
    setShowAddModal(true);
  };

  const handleSaveMedication = () => {
    if (!medicationForm.name || !medicationForm.dosage || !medicationForm.frequency) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    const newMedication: Medication = {
      id: Date.now().toString(),
      name: medicationForm.name,
      dosage: medicationForm.dosage,
      frequency: medicationForm.frequency,
      time: medicationForm.time,
      duration: medicationForm.duration,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active',
      elderlyUserId: selectedUser!.userId,
      elderlyName: selectedUser!.userName,
      notes: medicationForm.notes,
      adherence: 100,
    };

    setMedications(prev => [...prev, newMedication]);
    setShowAddModal(false);
    Alert.alert('Thành công', 'Đã thêm thuốc mới');
  };

  const handleMedicationPress = (medication: Medication) => {
    setSelectedMedication(medication);
    setShowScheduleModal(true);
  };

  const handleToggleMedicationStatus = (medicationId: string) => {
    setMedications(prev => prev.map(med => {
      if (med.id === medicationId) {
        const newStatus = med.status === 'active' ? 'paused' : 'active';
        return { ...med, status: newStatus };
      }
      return med;
    }));
  };

  const renderUserSelector = () => (
    <View style={styles.userSelector}>
      <Text style={styles.sectionTitle}>Chọn người dùng</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {elderlyUsers.map((user) => (
          <TouchableOpacity
            key={user.userId}
            style={[
              styles.userCard,
              selectedUser?.userId === user.userId && styles.userCardSelected
            ]}
            onPress={() => setSelectedUser(user)}
          >
            <View style={styles.userAvatar}>
              <Text style={styles.userInitials}>
                {user.userName.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
            <Text style={styles.userName}>{user.userName}</Text>
            <Text style={styles.userAge}>{user.age} tuổi</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderMedicationCard = (medication: Medication) => (
    <TouchableOpacity
      key={medication.id}
      style={styles.medicationCard}
      onPress={() => handleMedicationPress(medication)}
      activeOpacity={0.8}
    >
      <View style={styles.medicationHeader}>
        <View style={styles.medicationInfo}>
          <Text style={styles.medicationName}>{medication.name}</Text>
          <Text style={styles.medicationDosage}>{medication.dosage}</Text>
        </View>
        <View style={styles.medicationActions}>
          <TouchableOpacity
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(medication.status) }
            ]}
            onPress={() => handleToggleMedicationStatus(medication.id)}
          >
            <Text style={styles.statusText}>
              {getStatusText(medication.status)}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Feather name="more-vertical" size={16} color="#8E8E93" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.medicationDetails}>
        <View style={styles.detailRow}>
          <Feather name="clock" size={16} color="#8E8E93" />
          <Text style={styles.detailText}>{medication.frequency}</Text>
        </View>
        <View style={styles.detailRow}>
          <Feather name="calendar" size={16} color="#8E8E93" />
          <Text style={styles.detailText}>
            {formatDate(medication.startDate)} - {formatDate(medication.endDate)}
          </Text>
        </View>
        {medication.notes && (
          <View style={styles.detailRow}>
            <Feather name="file-text" size={16} color="#8E8E93" />
            <Text style={styles.detailText}>{medication.notes}</Text>
          </View>
        )}
      </View>

      <View style={styles.medicationFooter}>
        <View style={styles.adherenceContainer}>
          <Text style={styles.adherenceLabel}>Tuân thủ</Text>
          <Text style={[
            styles.adherenceValue,
            { color: getAdherenceColor(medication.adherence) }
          ]}>
            {medication.adherence}%
          </Text>
        </View>
        <View style={styles.nextDoseContainer}>
          <Text style={styles.nextDoseLabel}>Liều tiếp theo</Text>
          <Text style={styles.nextDoseValue}>
            {medication.nextDose ? formatTime(medication.nextDose.split(' ')[1]) : 'N/A'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderAddMedicationModal = () => (
    <Modal
      visible={showAddModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowAddModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Thêm thuốc mới</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowAddModal(false)}
            >
              <Feather name="x" size={24} color="#1C1C1E" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tên thuốc *</Text>
              <TextInput
                style={styles.textInput}
                value={medicationForm.name}
                onChangeText={(text) => setMedicationForm(prev => ({ ...prev, name: text }))}
                placeholder="Nhập tên thuốc"
                placeholderTextColor="#8E8E93"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Liều lượng *</Text>
              <TextInput
                style={styles.textInput}
                value={medicationForm.dosage}
                onChangeText={(text) => setMedicationForm(prev => ({ ...prev, dosage: text }))}
                placeholder="VD: 100mg, 1 viên"
                placeholderTextColor="#8E8E93"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tần suất *</Text>
              <TextInput
                style={styles.textInput}
                value={medicationForm.frequency}
                onChangeText={(text) => setMedicationForm(prev => ({ ...prev, frequency: text }))}
                placeholder="VD: 1 lần/ngày, 2 lần/ngày"
                placeholderTextColor="#8E8E93"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Thời gian</Text>
              <TextInput
                style={styles.textInput}
                value={medicationForm.time}
                onChangeText={(text) => setMedicationForm(prev => ({ ...prev, time: text }))}
                placeholder="VD: 08:00, 08:00, 20:00"
                placeholderTextColor="#8E8E93"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Thời gian dùng</Text>
              <TextInput
                style={styles.textInput}
                value={medicationForm.duration}
                onChangeText={(text) => setMedicationForm(prev => ({ ...prev, duration: text }))}
                placeholder="VD: 30 ngày, Lâu dài"
                placeholderTextColor="#8E8E93"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ghi chú</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={medicationForm.notes}
                onChangeText={(text) => setMedicationForm(prev => ({ ...prev, notes: text }))}
                placeholder="Ghi chú về cách uống thuốc"
                placeholderTextColor="#8E8E93"
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowAddModal(false)}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveMedication}
            >
              <Text style={styles.saveButtonText}>Lưu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderScheduleModal = () => (
    <Modal
      visible={showScheduleModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowScheduleModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Lịch uống thuốc</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowScheduleModal(false)}
            >
              <Feather name="x" size={24} color="#1C1C1E" />
            </TouchableOpacity>
          </View>

          {selectedMedication && (
            <ScrollView style={styles.modalBody}>
              <View style={styles.medicationSummary}>
                <Text style={styles.summaryTitle}>{selectedMedication.name}</Text>
                <Text style={styles.summaryDosage}>{selectedMedication.dosage}</Text>
                <Text style={styles.summaryFrequency}>{selectedMedication.frequency}</Text>
              </View>

              <View style={styles.scheduleSection}>
                <Text style={styles.scheduleTitle}>Lịch uống trong tuần</Text>
                {['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'].map((day, index) => (
                  <View key={index} style={styles.scheduleDay}>
                    <Text style={styles.dayText}>{day}</Text>
                    <Text style={styles.timeText}>
                      {selectedMedication.time || 'Chưa cập nhật'}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.adherenceSection}>
                <Text style={styles.adherenceTitle}>Tỷ lệ tuân thủ</Text>
                <View style={styles.adherenceBar}>
                  <View 
                    style={[
                      styles.adherenceFill,
                      { 
                        width: `${selectedMedication.adherence}%`,
                        backgroundColor: getAdherenceColor(selectedMedication.adherence)
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.adherenceText}>{selectedMedication.adherence}%</Text>
              </View>
            </ScrollView>
          )}

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowScheduleModal(false)}
            >
              <Text style={styles.cancelButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (isLoading && elderlyUsers.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Đang tải danh sách thuốc...</Text>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>Quản lý thuốc</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddMedication}
        >
          <Feather name="plus" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderUserSelector()}
        
        <View style={styles.medicationsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Danh sách thuốc</Text>
            <Text style={styles.medicationCount}>
              {medications.length} thuốc
            </Text>
          </View>
          
          {medications.length > 0 ? (
            medications.map(renderMedicationCard)
          ) : (
            <View style={styles.emptyState}>
              <Feather name="package" size={48} color="#C7C7CC" />
              <Text style={styles.emptyTitle}>Chưa có thuốc nào</Text>
              <Text style={styles.emptySubtitle}>
                Thêm thuốc mới để quản lý lịch uống thuốc
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={handleAddMedication}
              >
                <Text style={styles.emptyButtonText}>Thêm thuốc</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {renderAddMedicationModal()}
      {renderScheduleModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 16,
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
    width: 44,
    height: 44,
    borderRadius: 22,
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
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  userSelector: {
    marginBottom: 24,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    minWidth: 120,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  userCardSelected: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  userInitials: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 4,
  },
  userAge: {
    fontSize: 12,
    color: '#8E8E93',
  },
  medicationsSection: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  medicationCount: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  medicationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  medicationDosage: {
    fontSize: 14,
    color: '#8E8E93',
  },
  medicationActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  actionButton: {
    padding: 4,
  },
  medicationDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#8E8E93',
    flex: 1,
  },
  medicationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  adherenceContainer: {
    alignItems: 'center',
  },
  adherenceLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  adherenceValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  nextDoseContainer: {
    alignItems: 'center',
  },
  nextDoseLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  nextDoseValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8E8E93',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  emptyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1C1C1E',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  medicationSummary: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  summaryDosage: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  summaryFrequency: {
    fontSize: 14,
    color: '#8E8E93',
  },
  scheduleSection: {
    marginBottom: 20,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  scheduleDay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  dayText: {
    fontSize: 14,
    color: '#1C1C1E',
  },
  timeText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  adherenceSection: {
    marginBottom: 20,
  },
  adherenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  adherenceBar: {
    height: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 4,
    marginBottom: 8,
  },
  adherenceFill: {
    height: '100%',
    borderRadius: 4,
  },
  adherenceText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
});

export default MedicineScreen; 
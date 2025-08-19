import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native'
import Feather from 'react-native-vector-icons/Feather'
import { addReminder, getElderlyInPremium } from '../../services/api'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Interface cho người cao tuổi
interface ElderlyUser {
  userId: number;
  userName: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  private_key: string;
}

// Helpers: format & validate date/time without libraries
function formatDateInput(rawValue: string): string {
  const digits = rawValue.replace(/\D/g, '').slice(0, 8)
  const parts: string[] = []
  if (digits.length <= 2) return digits
  parts.push(digits.slice(0, 2))
  if (digits.length <= 4) return `${parts[0]}/${digits.slice(2)}`
  parts.push(digits.slice(2, 4))
  const year = digits.slice(4)
  return `${parts[0]}/${parts[1]}${year ? '/' + year : ''}`
}

function formatTimeInput(rawValue: string): string {
  const digits = rawValue.replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}:${digits.slice(2)}`
}

function isValidDateInput(value: string): boolean {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return false
  const [ddStr, mmStr, yyyyStr] = value.split('/')
  const dd = Number(ddStr)
  const mm = Number(mmStr)
  const yyyy = Number(yyyyStr)
  if (yyyy < 1900 || yyyy > 2100) return false
  if (mm < 1 || mm > 12) return false
  if (dd < 1 || dd > 31) return false
  const date = new Date(yyyy, mm - 1, dd)
  return date.getFullYear() === yyyy && date.getMonth() === mm - 1 && date.getDate() === dd
}

function isValidTimeInput(value: string): boolean {
  if (!/^\d{2}:\d{2}$/.test(value)) return false
  const [hhStr, mmStr] = value.split(':')
  const hh = Number(hhStr)
  const mm = Number(mmStr)
  if (hh < 0 || hh > 23) return false
  if (mm < 0 || mm > 59) return false
  return true
}

function toTwoDigits(n: number): string {
  return n.toString().padStart(2, '0')
}

function buildDateTimeForApi(dateInput: string, timeInput: string): { ngay_gio: string; thoi_gian: string } {
  const [ddStr, mmStr, yyyyStr] = dateInput.split('/')
  const [hhStr, miStr] = timeInput.split(':')
  const yyyy = Number(yyyyStr)
  const mm = Number(mmStr)
  const dd = Number(ddStr)
  const hh = Number(hhStr)
  const mi = Number(miStr)
  const ngay_gio = `${yyyy}-${toTwoDigits(mm)}-${toTwoDigits(dd)} ${toTwoDigits(hh)}:${toTwoDigits(mi)}:00`
  const thoi_gian = `${toTwoDigits(hh)}:${toTwoDigits(mi)}:00`
  return { ngay_gio, thoi_gian }
}

const reminderTypes = [
  { key: 'medicine', label: 'Uống thuốc', icon: 'package' },
  { key: 'water', label: 'Uống nước', icon: 'droplet' },
  { key: 'exercise', label: 'Tập thể dục', icon: 'activity' },
  { key: 'custom', label: 'Khác', icon: 'edit' },
]

function AddReminderScreen({ navigation }: any) {
  const [elderlyList, setElderlyList] = useState<ElderlyUser[]>([])
  const [selectedElderly, setSelectedElderly] = useState<string>('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [dateInput, setDateInput] = useState('')
  const [timeInput, setTimeInput] = useState('')
  const [type, setType] = useState(reminderTypes[0].key)
  const [loading, setLoading] = useState(false)
  const [loadingElderly, setLoadingElderly] = useState(true)

  // Load danh sách người cao tuổi từ API
  useEffect(() => {
    loadElderlyList()
  }, [])

  const loadElderlyList = async () => {
    try {
      setLoadingElderly(true)
      // Lấy user ID từ AsyncStorage
      const userData = await AsyncStorage.getItem('user')
      if (!userData) {
        Alert.alert('Lỗi', 'Không thể lấy thông tin người dùng')
        return
      }
      const user = JSON.parse(userData)
      
      const result = await getElderlyInPremium(user.id)
      if (result.success && result.data) {
        setElderlyList(result.data)
      } else {
        console.error('Failed to load elderly list:', result.message)
        Alert.alert('Lỗi', 'Không thể tải danh sách người cao tuổi: ' + result.message)
      }
    } catch (error: any) {
      console.error('Error loading elderly list:', error)
      Alert.alert('Lỗi', 'Không thể kết nối đến máy chủ')
    } finally {
      setLoadingElderly(false)
    }
  }

  const handleSave = async () => {
    if (!selectedElderly || !title || !content || !dateInput || !timeInput) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin')
      return
    }

    if (!isValidDateInput(dateInput)) {
      Alert.alert('Lỗi', 'Ngày không hợp lệ. Định dạng dd/mm/yyyy')
      return
    }

    if (!isValidTimeInput(timeInput)) {
      Alert.alert('Lỗi', 'Giờ không hợp lệ. Định dạng HH:MM (00-23:00-59)')
      return
    }

    setLoading(true)
    try {
      const elderly = elderlyList.find(e => e.userId.toString() === selectedElderly)
      if (!elderly) throw new Error('Không tìm thấy người cao tuổi')

      const { ngay_gio, thoi_gian } = buildDateTimeForApi(dateInput, timeInput)

      const payload = {
        email: elderly.email,
        ten_nguoi_dung: elderly.userName,
        noi_dung: title + (content ? `: ${content}` : ''),
        ngay_gio,
        thoi_gian,
        private_key_nguoi_nhan: elderly.private_key,
      }
      const res = await addReminder(payload)
      if (res.success) {
        Alert.alert('Thành công', 'Đã thêm nhắc nhở cho người cao tuổi!')
        navigation.goBack()
      } else {
        Alert.alert('Lỗi', res.message || 'Không thể thêm nhắc nhở')
      }
    } catch (error: any) {
      Alert.alert('Lỗi', error?.message || 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tạo nhắc nhở</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.headerIcon}>
            <Feather name="bell" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.headerSectionTitle}>
            Nhắc nhở cho người thân
          </Text>
          <Text style={styles.headerSectionSubtitle}>
            Tạo lịch nhắc nhở để chăm sóc người thân tốt hơn
          </Text>
        </View>

        {/* Elderly Selection */}
        <View style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <Feather name="users" size={20} color="#007AFF" />
            <Text style={styles.sectionTitle}>Chọn người thân</Text>
          </View>
          
          {loadingElderly ? (
            <View style={styles.loadingContainer}>
              <View style={styles.loadingSpinner} />
              <Text style={styles.loadingText}>Đang tải danh sách...</Text>
            </View>
          ) : (
            <View style={styles.elderlyGrid}>
              {elderlyList.map((elderly) => (
                <TouchableOpacity
                  key={elderly.userId}
                  style={[
                    styles.elderlyCard,
                    selectedElderly === elderly.userId.toString() && styles.selectedElderlyCard,
                  ]}
                  onPress={() => setSelectedElderly(elderly.userId.toString())}
                  activeOpacity={0.8}
                >
                  <View style={styles.elderlyAvatar}>
                    <Text style={styles.elderlyInitials}>
                      {elderly.userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </Text>
                  </View>
                  <Text style={styles.elderlyName}>{elderly.userName}</Text>
                  <Text style={styles.elderlyDetails}>
                    {elderly.age} tuổi • {elderly.gender === 'male' ? 'Nam' : 'Nữ'}
                  </Text>
                  {selectedElderly === elderly.userId.toString() && (
                    <View style={styles.selectedIndicator}>
                      <Feather name="check-circle" size={20} color="#007AFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Reminder Details */}
        <View style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <Feather name="edit-3" size={20} color="#007AFF" />
            <Text style={styles.sectionTitle}>Chi tiết nhắc nhở</Text>
          </View>

          {/* Title Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Tiêu đề</Text>
            <View style={styles.inputContainer}>
              <Feather name="tag" size={20} color="#8E8E93" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Nhập tiêu đề nhắc nhở"
                placeholderTextColor="#8E8E93"
                value={title}
                onChangeText={setTitle}
              />
            </View>
          </View>

          {/* Content Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nội dung</Text>
            <View style={styles.inputContainer}>
              <Feather name="message-circle" size={20} color="#8E8E93" style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Nhập nội dung chi tiết"
                placeholderTextColor="#8E8E93"
                value={content}
                onChangeText={setContent}
                multiline
                numberOfLines={4}
              />
            </View>
          </View>
        </View>

        {/* Date & Time */}
        <View style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <Feather name="clock" size={20} color="#007AFF" />
            <Text style={styles.sectionTitle}>Thời gian</Text>
          </View>

          <View style={styles.dateTimeRow}>
            {/* Date Input */}
            <View style={styles.dateTimeGroup}>
              <Text style={styles.inputLabel}>Ngày</Text>
              <View style={styles.inputContainer}>
                <Feather name="calendar" size={20} color="#8E8E93" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="dd/mm/yyyy"
                  placeholderTextColor="#8E8E93"
                  value={dateInput}
                  onChangeText={(text) => setDateInput(formatDateInput(text))}
                  keyboardType="numeric"
                  maxLength={10}
                  autoCorrect={false}
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Time Input */}
            <View style={styles.dateTimeGroup}>
              <Text style={styles.inputLabel}>Giờ</Text>
              <View style={styles.inputContainer}>
                <Feather name="clock" size={20} color="#8E8E93" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="HH:MM"
                  placeholderTextColor="#8E8E93"
                  value={timeInput}
                  onChangeText={(text) => setTimeInput(formatTimeInput(text))}
                  keyboardType="numeric"
                  maxLength={5}
                  autoCorrect={false}
                  autoCapitalize="none"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Reminder Type */}
        <View style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <Feather name="grid" size={20} color="#007AFF" />
            <Text style={styles.sectionTitle}>Loại nhắc nhở</Text>
          </View>

          <View style={styles.reminderTypeGrid}>
            {reminderTypes.map((t) => (
              <TouchableOpacity
                key={t.key}
                style={[
                  styles.reminderTypeCard,
                  type === t.key && styles.selectedReminderType,
                ]}
                onPress={() => setType(t.key)}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.reminderTypeIcon,
                  type === t.key && styles.selectedReminderTypeIcon
                ]}>
                  <Feather name={t.icon} size={24} color={type === t.key ? "#FFFFFF" : "#007AFF"} />
                </View>
                <Text style={[
                  styles.reminderTypeText,
                  type === t.key && styles.selectedReminderTypeText
                ]}>
                  {t.label}
                </Text>
                {type === t.key && (
                  <View style={styles.reminderTypeCheck}>
                    <Feather name="check" size={16} color="#007AFF" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.saveSection}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              (!selectedElderly || !title || !dateInput || !timeInput || loading) && styles.saveButtonDisabled
            ]}
            onPress={handleSave}
            disabled={!selectedElderly || !title || !dateInput || !timeInput || loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <View style={styles.loadingButton}>
                <View style={styles.loadingSpinner} />
                <Text style={styles.saveButtonText}>Đang tạo...</Text>
              </View>
            ) : (
              <>
                <Feather name="check" size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Tạo nhắc nhở</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerSection: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    marginBottom: 24,
    padding: 24,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    alignItems: 'center',
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerSectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSectionSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  formSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 8,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingSpinner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderTopColor: 'transparent',
    marginBottom: 8,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
  },
  elderlyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  elderlyCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 120,
    position: 'relative',
  },
  selectedElderlyCard: {
    borderColor: '#007AFF',
    backgroundColor: '#EFF6FF',
  },
  elderlyAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  elderlyInitials: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  elderlyName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
    textAlign: 'center',
  },
  elderlyDetails: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    paddingVertical: 4,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateTimeGroup: {
    flex: 1,
  },
  reminderTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  reminderTypeCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    minWidth: 100,
    position: 'relative',
  },
  selectedReminderType: {
    borderColor: '#007AFF',
    backgroundColor: '#EFF6FF',
  },
  reminderTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedReminderTypeIcon: {
    backgroundColor: '#007AFF',
  },
  reminderTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
  selectedReminderTypeText: {
    color: '#007AFF',
  },
  reminderTypeCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  saveSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  loadingButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
})

export default AddReminderScreen


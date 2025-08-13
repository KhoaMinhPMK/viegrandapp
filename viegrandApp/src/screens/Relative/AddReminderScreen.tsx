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
      {/* Nút back nổi */}
      <TouchableOpacity
        style={styles.floatingBackButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Feather name="arrow-left" size={28} color="#0D4C92" />
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Tạo nhắc nhở cho người cao tuổi</Text>
        {/* Chọn người cao tuổi */}
        <Text style={styles.label}>Chọn người cao tuổi</Text>
        {loadingElderly ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Đang tải danh sách...</Text>
          </View>
        ) : (
          <View style={styles.selectBox}>
            {elderlyList.map((elderly) => (
              <TouchableOpacity
                key={elderly.userId}
                style={[
                  styles.selectOption,
                  selectedElderly === elderly.userId.toString() && styles.selectedOption,
                ]}
                onPress={() => setSelectedElderly(elderly.userId.toString())}
              >
                <Text style={styles.selectOptionText}>{elderly.userName}</Text>
                {selectedElderly === elderly.userId.toString() && (
                  <Feather name="check" size={18} color="#0D4C92" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
        {/* Tiêu đề */}
        <Text style={styles.label}>Tiêu đề</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập tiêu đề nhắc nhở"
          value={title}
          onChangeText={setTitle}
        />
        {/* Nội dung */}
        <Text style={styles.label}>Nội dung</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Nhập nội dung chi tiết"
          value={content}
          onChangeText={setContent}
          multiline
        />
        {/* Ngày & Giờ */}
        <Text style={styles.label}>Ngày</Text>
        <TextInput
          style={styles.input}
          placeholder="dd/mm/yyyy"
          value={dateInput}
          onChangeText={(text) => setDateInput(formatDateInput(text))}
          keyboardType="numeric"
          maxLength={10}
          autoCorrect={false}
          autoCapitalize="none"
        />

        <Text style={styles.label}>Giờ</Text>
        <TextInput
          style={styles.input}
          placeholder="HH:MM"
          value={timeInput}
          onChangeText={(text) => setTimeInput(formatTimeInput(text))}
          keyboardType="numeric"
          maxLength={5}
          autoCorrect={false}
          autoCapitalize="none"
        />

        {/* Loại nhắc nhở */}
        <Text style={styles.label}>Loại nhắc nhở</Text>
        <View style={styles.selectBox}>
          {reminderTypes.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[
                styles.selectOption,
                type === t.key && styles.selectedOption,
              ]}
              onPress={() => setType(t.key)}
            >
              <Feather name={t.icon} size={18} color="#0D4C92" />
              <Text style={[styles.selectOptionText, { marginLeft: 6 }]}>{t.label}</Text>
              {type === t.key && (
                <Feather name="check" size={18} color="#0D4C92" />
              )}
            </TouchableOpacity>
          ))}
        </View>
        {/* Nút lưu */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>{loading ? 'Đang lưu...' : 'Lưu nhắc nhở'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20 },
  header: { fontSize: 22, fontWeight: 'bold', color: '#0D4C92', marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '500', marginTop: 16, marginBottom: 6, color: '#0D4C92' },
  input: { borderWidth: 1, borderColor: '#E3F2FD', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#F8FAFF' },
  selectBox: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  selectOption: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E3F2FD', borderRadius: 8, padding: 10, marginRight: 8, marginBottom: 8, backgroundColor: '#F8FAFF' },
  selectedOption: { borderColor: '#0D4C92', backgroundColor: '#E3F2FD' },
  selectOptionText: { fontSize: 15, color: '#0D4C92' },
  saveButton: { backgroundColor: '#0D4C92', borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 28 },
  saveButtonText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  loadingContainer: { padding: 20, alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#8E8E93' },
  floatingBackButton: {
    position: 'absolute',
    top: 18,
    left: 16,
    zIndex: 10,
    backgroundColor: '#fff',
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
})

export default AddReminderScreen


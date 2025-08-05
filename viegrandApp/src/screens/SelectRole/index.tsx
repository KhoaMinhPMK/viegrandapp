import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ImageBackground,
  SafeAreaView,
  Alert,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const { width } = Dimensions.get('window');

const SelectRoleScreen = ({ navigation }: any) => {
  const [selectedRole, setSelectedRole] = useState<'relative' | 'elderly' | null>(null);

  const handleContinue = () => {
    if (!selectedRole) {
      Alert.alert('Lỗi', 'Vui lòng chọn vai trò của bạn.');
      return;
    }
    
    // Navigate to the appropriate app based on selected role
    if (selectedRole === 'elderly') {
      navigation.replace('Elderly');
    } else if (selectedRole === 'relative') {
      navigation.replace('Relative');
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/background.png')}
      style={styles.backgroundImage}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Bạn tham gia với vai trò nào?</Text>
        </View>

        <View style={styles.rolesContainer}>
          <TouchableOpacity
            style={[
              styles.roleCard,
              selectedRole === 'relative' && styles.selectedCard,
            ]}
            onPress={() => setSelectedRole('relative')}>
            <Feather
              name="users"
              size={60}
              color={selectedRole === 'relative' ? '#FFFFFF' : '#0D4C92'}
            />
            <Text
              style={[
                styles.roleText,
                selectedRole === 'relative' && styles.selectedText,
              ]}>
              Người thân
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleCard,
              selectedRole === 'elderly' && styles.selectedCard,
            ]}
            onPress={() => setSelectedRole('elderly')}>
            <Feather
              name="user"
              size={60}
              color={selectedRole === 'elderly' ? '#FFFFFF' : '#0D4C92'}
            />
            <Text
              style={[
                styles.roleText,
                selectedRole === 'elderly' && styles.selectedText,
              ]}>
              Người cao tuổi
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, !selectedRole && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!selectedRole}>
          <Text style={styles.buttonText}>Tiếp tục</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    marginTop: 50,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    color: '#0D4C92',
    textAlign: 'center',
  },
  rolesContainer: {
    width: '100%',
    alignItems: 'center',
  },
  roleCard: {
    width: width * 0.7,
    height: width * 0.5,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  selectedCard: {
    backgroundColor: '#0D4C92',
    borderColor: '#0D4C92',
  },
  roleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0D4C92',
    marginTop: 15,
  },
  selectedText: {
    color: '#FFFFFF',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#0D4C92',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#A9A9A9',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SelectRoleScreen; 
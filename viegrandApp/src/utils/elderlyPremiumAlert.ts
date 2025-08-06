import { Alert } from 'react-native';

/**
 * Shows an alert informing elderly users that their relative will handle premium upgrades
 */
export const showElderlyPremiumAlert = () => {
  Alert.alert(
    'Thông báo',
    'Chức năng Premium sẽ được người thân của bạn đăng ký và quản lý. Vui lòng liên hệ với người thân để được hỗ trợ nâng cấp tài khoản.',
    [
      {
        text: 'Đã hiểu',
        style: 'default'
      }
    ],
    { cancelable: true }
  );
};

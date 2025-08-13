declare module 'react-native-qrcode-scanner' {
  import { Component, ReactNode } from 'react'
  import { ViewStyle } from 'react-native'

  interface QRCodeScannerProps {
    onRead: (e: { data: string }) => void
    topContent?: ReactNode
    bottomContent?: ReactNode
    showMarker?: boolean
    reactivate?: boolean
    reactivateTimeout?: number
    fadeIn?: boolean
    topViewStyle?: ViewStyle
    bottomViewStyle?: ViewStyle
    flashMode?: any
    cameraProps?: any
  }

  export default class QRCodeScanner extends Component<QRCodeScannerProps> {}
}

declare module 'react-native-camera' {
  export const RNCamera: any
} 
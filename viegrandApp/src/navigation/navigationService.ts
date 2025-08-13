import { createNavigationContainerRef } from '@react-navigation/native'

export const navigationRef = createNavigationContainerRef<Record<string, object | undefined>>()

export function navigate(name: string, params?: Record<string, any>) {
  if (!navigationRef.isReady()) return
  // Cast to unknown to satisfy React Navigation types without strict route map
  ;(navigationRef.navigate as unknown as (routeName: string, params?: Record<string, any>) => void)(name, params)
} 
import { useTheme } from '@1hive/1hive-ui'
import assets from '../utils/assets'

export function useAsset(iconType) {
  const theme = useTheme()

  return assets[iconType][theme._appearance]
}

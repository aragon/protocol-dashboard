import { useTheme } from '@1hive/1hive-ui'
import icons from '../utils/icons'

function useIcon(iconType) {
  const theme = useTheme()

  return icons[iconType][theme._appearance]
}

export default useIcon

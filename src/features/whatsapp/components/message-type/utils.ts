export const getMediaUrl = (mediaPath: string | null): string | null => {
  if (!mediaPath) return null
  
  const baseUrl = import.meta.env.VITE_WS_MEDIA_PATH
  if (!baseUrl) return null
  
  // Construct URL: VITE_WS_BASE_URL + "media" + mediaPath
  // Ensure baseUrl doesn't end with / and add / between "media" and path
  const cleanBaseUrl = baseUrl.replace(/\/$/, "")
  const cleanMediaPath = mediaPath.startsWith("/") ? mediaPath : `/${mediaPath}`
  const url = `${cleanBaseUrl}/media${cleanMediaPath}`
  return url
}

export const formatFileSize = (bytes: number | null): string => {
  if (!bytes) return ""
  
  const units = ["B", "KB", "MB", "GB"]
  let size = bytes
  let unitIndex = 0
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`
}


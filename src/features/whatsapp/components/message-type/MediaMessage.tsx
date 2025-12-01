import type { StoredMessage } from "../../types"
import { ImageMessage } from "./ImageMessage"
import { VideoMessage } from "./VideoMessage"
import { AudioMessage } from "./AudioMessage"
import { DocumentMessage } from "./DocumentMessage"
import { StickerMessage } from "./StickerMessage"

type MediaMessageProps = {
  message: StoredMessage
}

export const MediaMessage = ({ message }: MediaMessageProps) => {
  if (!message.mediaType) {
    return null
  }

  switch (message.mediaType.toLowerCase()) {
    case "image":
      return <ImageMessage message={message} />
    case "video":
      return <VideoMessage message={message} />
    case "audio":
    case "ptt": // Push-to-talk voice messages
      return <AudioMessage message={message} />
    case "document":
      return <DocumentMessage message={message} />
    case "sticker":
      return <StickerMessage message={message} />
    default:
      return <DocumentMessage message={message} />
  }
}


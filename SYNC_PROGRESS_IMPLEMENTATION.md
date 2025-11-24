# WhatsApp Chat Synchronization Progress Implementation

## Overview
Implemented real-time chat synchronization progress tracking for WhatsApp sessions. When the backend sends `sync_chats` events during synchronization, the frontend now displays a progress indicator at the bottom of the page.

## Changes Made

### 1. Type Definitions (`src/features/whatsapp/types/index.ts`)
- Added `SyncProgress` type to track synchronization progress:
  ```typescript
  export type SyncProgress = {
    sessionId: string
    nChats: number
    currentChat: number
    chatId: string
    messagesSynced: number
  }
  ```
- Updated `WhatsappState` to include `syncProgress: SyncProgress | null`

### 2. Redux State Management (`src/features/whatsapp/store/whatsappSlice.ts`)
- Added `syncProgress` to initial state
- Created `setSyncProgress` reducer to update sync progress
- Created `clearSyncProgress` reducer to clear sync progress
- Added `selectSyncProgress` selector to access sync progress from state
- Exported new actions and selectors

### 3. Sync Progress Display (`src/features/whatsapp/components/SyncWhatsappDialog.tsx`)
- Integrated sync progress UI directly within the dialog
- Shows progress inline after QR code is scanned and sync begins
- Displays:
  - Current chat number out of total chats
  - Linear progress bar with percentage
  - Number of messages synced
- Automatically shows when sync is in progress
- Uses Material UI components (Box, LinearProgress, Typography)
- Fully internationalized with i18n
- Located within the dialog content, not as a separate fixed component
- **Added "View Chats" button** that appears after successful sync
  - Navigates to `/dashboard/whatsapp/sessions/:id/chats`
  - Closes the dialog automatically after navigation
  - Only visible when sync is successful

### 4. WebSocket Event Listener (`src/features/whatsapp/components/SyncWhatsappDialog.tsx`)
- Added `sync_chats` event listener in `handleSubmit`
- Updates Redux state when sync progress events are received
- Properly cleans up listener on component unmount and dialog close
- Clears sync progress when dialog closes
- Progress UI is displayed inline within the dialog content

### 5. Internationalization
- **English** (`src/i18n/locales/en/whatsapp.json`):
  ```json
  "viewChats": "View Chats",
  "syncProgress": {
    "syncing": "Syncing",
    "of": "of",
    "chats": "chats",
    "messagesSynced": "Messages synced"
  }
  ```
- **Spanish** (`src/i18n/locales/es/whatsapp.json`):
  ```json
  "viewChats": "Ver Chats",
  "syncProgress": {
    "syncing": "Sincronizando",
    "of": "de",
    "chats": "chats",
    "messagesSynced": "Mensajes sincronizados"
  }
  ```

## Event Payload Structure
The backend sends events with the following structure:
```typescript
{
  sessionId: "123",
  nChats: 3,
  currentChat: 1,
  chatId: "1234567890@c.us",
  messagesSynced: 0
}
```

## User Experience
1. User initiates WhatsApp session sync in the dialog
2. After QR code is scanned, backend starts syncing chats
3. Progress indicator appears within the dialog below the QR code
4. Shows real-time progress: "Syncing 1 of 3 chats"
5. Progress bar fills as chats are synced
6. Shows message count being synced
7. When sync completes successfully, a "View Chats" button appears
8. User can click "View Chats" to navigate directly to the session's chat list
9. Dialog closes automatically after navigation

## Technical Details
- Uses WebSocket for real-time updates
- Redux for centralized state management
- Material UI for consistent styling
- Fully typed with TypeScript
- Follows project architecture (feature-first, separation of concerns)
- No direct Redux connections in pages (uses components)
- All text is internationalized

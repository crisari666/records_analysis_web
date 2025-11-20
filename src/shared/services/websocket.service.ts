import { io, Socket } from 'socket.io-client'

export class WebSocketService {
  private static instance: WebSocketService
  private socket: Socket | null = null
  private isConnected: boolean = false

  private constructor() {
    // Private constructor for singleton pattern
  }

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService()
    }
    return WebSocketService.instance
  }

  public connect(serverUrl: string, options?: any): void {
    if (this.socket) {
      return
    }

    this.socket = io(serverUrl, {
      transports: ['websocket'],
      autoConnect: true,
      ...options,
    })

    this.setupEventListeners()
  }

  private setupEventListeners(): void {
    if (!this.socket) return

    // Connection events
    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server')
      this.isConnected = true
    })

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server')
      this.isConnected = false
    })

    // Error handling
    this.socket.on('connect_error', (error: Error) => {
      console.error('Connection error:', error)
      this.handleConnectionError(error)
    })

    this.socket.on('error', (error: Error) => {
      console.error('Socket error:', error)
    })
  }

  /**
   * Subscribe to a specific event
   * @param eventName - The name of the event to listen to
   * @param callback - The callback function to execute when the event is received
   * @returns A function to unsubscribe from the event
   */
  public on<T = any>(eventName: string, callback: (data: T) => void): () => void {
    if (!this.socket) {
      return () => { }
    }

    this.socket.on(eventName, callback)

    return () => {
      if (this.socket) {
        this.socket.off(eventName, callback)
      }
    }
  }

  /**
   * Unsubscribe from a specific event
   * @param eventName - The name of the event to unsubscribe from
   * @param callback - Optional callback to remove. If not provided, all callbacks for the event are removed
   */
  public off(eventName: string, callback?: (...args: any[]) => void): void {
    if (!this.socket) return
    this.socket.off(eventName, callback)
  }

  /**
   * Emit an event to the server
   * @param eventName - The name of the event to emit
   * @param data - The data to send with the event
   */
  public emit(eventName: string, ...args: any[]): void {
    if (!this.socket || !this.isConnected) {
      console.warn('Cannot emit event: socket not connected')
      return
    }
    this.socket.emit(eventName, ...args)
  }

  /**
   * Join a room
   * @param roomName - The name of the room to join
   * @param eventName - Optional custom event name (defaults to 'joinRoom')
   */
  public joinRoom(roomName: string, eventName: string = 'joinRoom'): void {
    if (!this.socket || !this.isConnected) {
      console.warn('Cannot join room: socket not connected')
      return
    }
    this.socket.emit(eventName, roomName)
  }

  /**
   * Leave a room
   * @param roomName - The name of the room to leave
   * @param eventName - Optional custom event name (defaults to 'leaveRoom')
   */
  public leaveRoom(roomName: string, eventName: string = 'leaveRoom'): void {
    if (!this.socket || !this.isConnected) {
      console.warn('Cannot leave room: socket not connected')
      return
    }
    this.socket.emit(eventName, roomName)
  }

  private handleConnectionError(_error: Error): void {
    // Implement retry logic with exponential backoff
    setTimeout(() => {
      if (this.socket) {
        this.socket.connect()
      }
    }, 5000)
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  public isConnectedToServer(): boolean {
    return this.isConnected
  }

  /**
   * Get the underlying socket instance (use with caution)
   */
  public getSocket(): Socket | null {
    return this.socket
  }
}

export const websocketService = WebSocketService.getInstance()
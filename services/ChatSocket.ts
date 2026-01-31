
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Message {
  id: string;
  chatId: string;
  text: string;
  sender: 'me' | 'them';
  senderId?: string; // ID of the specific contact/bot who sent this
  timestamp: number;
  status: 'sent' | 'delivered' | 'read';
}

export interface ChatPreview {
  id: string;
  name: string;
  avatar?: string;
  color: string; // Tailwind color class for avatar bg
  lastMessage: string;
  timestamp: number;
  unreadCount: number;
  isOnline: boolean;
  // New Profile Fields
  isBot?: boolean;
  isGroup?: boolean;
  username?: string;
  bio?: string;
  phone?: string;
  // New Features
  muted?: boolean;
  isAdmin?: boolean;
  membersCount?: number;
  sender?: 'me' | 'them';
  memberIds?: string[]; // IDs of contacts in this group
}

export interface Call {
  id: string;
  contactId: string;
  type: 'incoming' | 'outgoing' | 'missed';
  timestamp: number;
  duration?: number; // seconds
}

export interface UserProfile {
    id: string;
    name: string;
    username: string;
    phone: string;
    bio: string;
    avatarColor: string;
    isPremium?: boolean;
    privacy?: {
        profilePhoto: 'everybody' | 'nobody';
        phoneNumber?: 'everybody' | 'nobody';
        lastSeen?: 'everybody' | 'nobody';
        stories?: 'everybody' | 'nobody';
    };
}

type Listener = (data: any) => void;

export class ChatSocket {
  private ws: WebSocket | null = null;
  private listeners: Set<Listener> = new Set();
  private url: string;
  private myUserId: string | null = null;
  private myProfile: UserProfile | null = null;
  private reconnectInterval: any = null;

  constructor(url?: string) {
    // If running in a codespace or specific env, adjust URL here, otherwise dynamic
    const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    this.url = url || `${protocol}//${host}:8080`;
    this.connect();
  }

  private connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
        return;
    }

    try {
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = () => {
        console.log('Connected to RedGram Server at', this.url);
        this.notify({ type: 'STATUS', status: 'CONNECTED' });
        if (this.reconnectInterval) {
            clearInterval(this.reconnectInterval);
            this.reconnectInterval = null;
        }
        
        // Re-announce presence if we have an ID
        if (this.myProfile) {
            // Re-register to ensure server knows we are here after reconnect
            this.registerUser(this.myProfile);
        } else if (this.myUserId) {
            this.announcePresence();
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleServerMessage(data);
        } catch (e) {
          console.error('Failed to parse WS message', e);
        }
      };

      this.ws.onerror = (e) => {
        console.warn('WebSocket error. Ensure "node server.js" is running.');
      };

      this.ws.onclose = () => {
        console.log('Disconnected. Retrying in 3s...');
        this.ws = null;
        if (!this.reconnectInterval) {
            this.reconnectInterval = setInterval(() => this.connect(), 3000);
        }
      };
    } catch (e) {
      console.error("Socket init error", e);
    }
  }

  public setUserId(id: string) {
      this.myUserId = id;
  }

  public disconnect() {
      if (this.reconnectInterval) {
          clearInterval(this.reconnectInterval);
          this.reconnectInterval = null;
      }
      if (this.ws) {
          this.ws.close();
          this.ws = null;
      }
  }

  private handleServerMessage(data: any) {
      // console.log("Received:", data);
      
      switch (data.type) {
          case 'INIT_STATE':
              // Server sends list of all known users
              if (data.users) {
                  this.notify({ type: 'USER_SYNC', users: data.users });
              }
              break;

          case 'USER_JOINED':
              if (data.profile.id !== this.myUserId) {
                  this.notify({ type: 'USER_JOINED', profile: data.profile });
              }
              break;

          case 'NEW_MESSAGE':
              // Message from server
              const msg = data.message;
              this.notify({ type: 'NEW_MESSAGE', message: msg });
              break;
            
          case 'MESSAGE_READ':
              this.notify({ 
                  type: 'MESSAGE_READ', 
                  chatId: data.chatId, 
                  messageIds: data.messageIds,
                  readerId: data.readerId
              });
              break;
      }
  }

  public registerUser(profile: UserProfile) {
      this.myUserId = profile.id;
      this.myProfile = profile;
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({
              type: 'REGISTER',
              profile: profile
          }));
      }
  }
  
  public announcePresence() {
      if (this.ws && this.ws.readyState === WebSocket.OPEN && this.myUserId) {
          this.ws.send(JSON.stringify({
              type: 'PRESENCE',
              userId: this.myUserId
          }));
      }
  }

  public subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(data: any) {
    this.listeners.forEach(l => l(data));
  }

  public sendMessage(chatId: string, text: string, toUserId?: string, isGroup?: boolean) {
    const msg: Message = {
      id: Date.now().toString(),
      chatId,
      text,
      sender: 'me',
      senderId: this.myUserId || 'me',
      timestamp: Date.now(),
      status: 'sent'
    };

    // Optimistic update for UI (Local echo)
    this.notify({ type: 'NEW_MESSAGE', message: msg });

    // Send to Server
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ 
          type: 'SEND_MESSAGE', 
          message: {
             ...msg,
             chatId: isGroup ? chatId : toUserId, // If DM, send to their UserID. If Group, send to ChatID.
             senderId: this.myUserId
          },
          isGroup
      }));
    } 
  }

  public sendReadReceipt(chatId: string, messageIds: string[]) {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({
              type: 'READ_RECEIPT',
              chatId: chatId,
              messageIds: messageIds,
              readerId: this.myUserId
          }));
      }
  }
}

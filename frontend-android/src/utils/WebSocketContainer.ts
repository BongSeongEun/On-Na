import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getWebSocketUrl } from './config';
import { getUserIdFromToken } from './auth';

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  timestamp: string;
  type: 'TEXT' | 'IMAGE' | 'FILE';
  imageUrl?: string; // 이미지 URL 추가
}

export interface ChatRoom {
  id: string;
  name: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  participants: string[];
}

export interface WebSocketEvent {
  type: 'MESSAGE' | 'ROOM_LIST' | 'ERROR' | 'CONNECTED' | 'DISCONNECTED';
  data?: any;
  error?: string;
}

class WebSocketContainer {
  private stompClient: any = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10; // 재연결 시도 횟수 증가
  private reconnectInterval: number = 2000; // 재연결 간격 단축
  private eventListeners: Map<string, Function[]> = new Map();
  private accessToken: string | null = null;
  private connectionTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  // WebSocket 서버 URL (설정 파일에서 가져옴)
  private readonly WS_URL = getWebSocketUrl();

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.on('ERROR', this.handleError.bind(this));
    this.on('DISCONNECTED', this.handleDisconnect.bind(this));
  }

  // 이벤트 리스너 등록
  public on(eventType: string, callback: Function) {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(callback);
  }

  // 이벤트 리스너 제거
  public off(eventType: string, callback: Function) {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // 이벤트 발생
  private emit(eventType: string, data?: any) {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // JWT 토큰 설정
  public setAccessToken(token: string) {
    this.accessToken = token;
  }

  // WebSocket 연결
  public connect(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        if (this.isConnected) {
          console.log('WebSocket already connected');
          resolve(true);
          return;
        }

        console.log('=== WebSocket 연결 시작 ===');
        console.log('WebSocket URL:', this.WS_URL);
        console.log('Access Token:', this.accessToken ? '있음' : '없음');
        
        if (!this.accessToken) {
          console.error('Access Token이 없습니다. 연결을 중단합니다.');
          reject(new Error('Access Token이 필요합니다.'));
          return;
        }
        
        // SockJS 옵션 설정 - 타임아웃 증가
        const sockjsOptions = {
          transports: ['websocket', 'xhr-streaming', 'xhr-polling'],
          timeout: 30000, // 30초로 증가
        };
        
        console.log('SockJS 옵션:', sockjsOptions);
        
        const socket = new SockJS(this.WS_URL, null, sockjsOptions);
        console.log('SockJS 인스턴스 생성됨');
        
        // SockJS 이벤트 리스너 추가
        socket.onopen = () => {
          console.log('=== SockJS 연결 성공 ===');
        };
        
        socket.onclose = (event) => {
          console.log('=== SockJS 연결 종료 ===', event);
          console.log('Close event code:', event.code);
          console.log('Close event reason:', event.reason);
          this.isConnected = false;
          this.emit('DISCONNECTED');
        };
        
        socket.onerror = (error) => {
          console.error('=== SockJS 에러 ===', error);
        };
        
        this.stompClient = Stomp.over(socket);
        console.log('STOMP 클라이언트 생성됨');

        // 연결 타임아웃 설정 (60초로 증가)
        this.connectionTimeout = setTimeout(() => {
          console.error('=== WebSocket 연결 타임아웃 ===');
          this.isConnected = false;
          this.emit('ERROR', { message: 'WebSocket 연결 타임아웃', error: new Error('Connection timeout') });
          reject(new Error('Connection timeout'));
        }, 60000); // 60초 타임아웃
        
        // STOMP 연결 설정 - JWT 토큰을 헤더에 추가
        const connectHeaders: any = {
          'heart-beat': '10000,10000', // 하트비트 설정
        };
        
        // JWT 토큰이 있으면 Authorization 헤더에 추가
        if (this.accessToken) {
          connectHeaders['Authorization'] = `Bearer ${this.accessToken}`;
          console.log('JWT 토큰이 헤더에 추가됨');
          console.log('토큰 길이:', this.accessToken.length);
          console.log('토큰 시작 부분:', this.accessToken.substring(0, 20) + '...');
        } else {
          console.error('Access Token이 없어서 연결이 실패할 수 있습니다.');
        }
        
        console.log('STOMP 연결 헤더:', connectHeaders);
        
        this.stompClient.connect(
          connectHeaders,
          () => {
            console.log('=== WebSocket 연결 성공 ===');
            if (this.connectionTimeout) {
              clearTimeout(this.connectionTimeout);
              this.connectionTimeout = null;
            }
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.emit('CONNECTED');
            this.setupSubscriptions();
            this.startHeartbeat();
            resolve(true);
          },
          (error: any) => {
            console.error('=== WebSocket 연결 실패 ===');
            console.error('Error details:', error);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
            
            // JWT 토큰 관련 에러 확인
            if (error.message && error.message.includes('401')) {
              console.error('JWT 토큰 인증 실패');
              this.emit('TOKEN_EXPIRED');
            }
            
            if (this.connectionTimeout) {
              clearTimeout(this.connectionTimeout);
              this.connectionTimeout = null;
            }
            this.isConnected = false;
            this.emit('ERROR', { message: 'WebSocket 연결 실패', error });
            reject(error);
          }
        );
      } catch (error) {
        console.error('=== WebSocket 초기화 실패 ===');
        console.error('Initialization error:', error);
        this.isConnected = false;
        this.emit('ERROR', { message: 'WebSocket 초기화 실패', error });
        reject(error);
      }
    });
  }

  // 하트비트 시작
  private startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected && this.stompClient) {
        try {
          // 빈 메시지로 하트비트 전송
          this.stompClient.send('/app/heartbeat', {}, '');
        } catch (error) {
          console.error('Heartbeat error:', error);
        }
      }
    }, 25000); // 25초마다 하트비트
  }

  // 구독 설정
  private setupSubscriptions() {
    if (!this.stompClient || !this.isConnected) return;

    // 개인 메시지 구독
    this.stompClient.subscribe('/user/queue/messages', (message: any) => {
      try {
        const data = JSON.parse(message.body);
        this.emit('MESSAGE', data);
      } catch (error) {
        this.emit('ERROR', { message: '메시지 파싱 실패', error });
      }
    });

    // 채팅방 목록 업데이트 구독
    this.stompClient.subscribe('/user/queue/rooms', (message: any) => {
      try {
        const data = JSON.parse(message.body);
        this.emit('ROOM_LIST', data);
      } catch (error) {
        this.emit('ERROR', { message: '채팅방 목록 파싱 실패', error });
      }
    });

    // 모든 채팅방 메시지 구독 (동적으로 roomId 추가)
    this.stompClient.subscribe('/topic/chat/room/+', (message: any) => {
      try {
        const data = JSON.parse(message.body);
        this.emit('MESSAGE', data);
      } catch (error) {
        this.emit('ERROR', { message: '채팅방 메시지 파싱 실패', error });
      }
    });

    // 안읽음 메시지 알림 구독
    this.stompClient.subscribe('/user/queue/notifications', (message: any) => {
      try {
        const data = JSON.parse(message.body);
        this.emit('NOTIFICATION', data);
      } catch (error) {
        this.emit('ERROR', { message: '알림 파싱 실패', error });
      }
    });
  }

  // 메시지 전송 (이미지 지원 추가)
  public async sendMessage(roomId: string, content: string, type: 'TEXT' | 'IMAGE' | 'FILE' = 'TEXT', imageUrl?: string): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      if (!this.isConnected || !this.stompClient) {
        reject(new Error('WebSocket이 연결되지 않았습니다.'));
        return;
      }

      try {
        // JWT 토큰에서 사용자 ID 가져오기
        const senderId = await this.getUserIdFromSession();
        
        const message = {
          roomId,
          content,
          type,
          senderId,
          timestamp: new Date().toISOString(),
          imageUrl: type === 'IMAGE' ? imageUrl : undefined
        };

        console.log('Sending message:', message);
        this.stompClient.send('/app/chat/message', {}, JSON.stringify(message));
        resolve(true);
      } catch (error) {
        console.error('Error sending message:', error);
        this.emit('ERROR', { message: '메시지 전송 실패', error });
        reject(error);
      }
    });
  }

  // 이미지 전송
  public async sendImage(roomId: string, imageUrl: string): Promise<boolean> {
    return this.sendMessage(roomId, '이미지를 전송했습니다.', 'IMAGE', imageUrl);
  }

  // 사용자 세션 조회
  public async getUserIdFromSession(): Promise<string> {
    try {
      const userId = await getUserIdFromToken();
      if (userId) {
        console.log('User ID from token:', userId);
        return userId.toString();
      } else {
        console.warn('No user ID found in token');
        return 'unknown';
      }
    } catch (error) {
      console.error('Error getting user ID from token:', error);
      return 'unknown';
    }
  }

  // 채팅방 입장
  public joinRoom(roomId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.isConnected || !this.stompClient) {
        reject(new Error('WebSocket이 연결되지 않았습니다.'));
        return;
      }

      try {
        console.log('Joining room:', roomId);
        this.stompClient.send('/app/chat/join', {}, roomId);
        resolve(true);
      } catch (error) {
        console.error('Error joining room:', error);
        this.emit('ERROR', { message: '채팅방 입장 실패', error });
        reject(error);
      }
    });
  }

  // 채팅방 퇴장
  public leaveRoom(roomId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.isConnected || !this.stompClient) {
        reject(new Error('WebSocket이 연결되지 않았습니다.'));
        return;
      }

      try {
        console.log('Leaving room:', roomId);
        this.stompClient.send('/app/chat/leave', {}, roomId);
        resolve(true);
      } catch (error) {
        console.error('Error leaving room:', error);
        this.emit('ERROR', { message: '채팅방 퇴장 실패', error });
        reject(error);
      }
    });
  }

  // 채팅방 목록 요청
  public requestRoomList(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.isConnected || !this.stompClient) {
        reject(new Error('WebSocket이 연결되지 않았습니다.'));
        return;
      }

      try {
        console.log('Requesting room list');
        this.stompClient.send('/app/chat/rooms', {}, JSON.stringify({}));
        resolve(true);
      } catch (error) {
        console.error('Error requesting room list:', error);
        this.emit('ERROR', { message: '채팅방 목록 요청 실패', error });
        reject(error);
      }
    });
  }

  // 연결 해제
  public disconnect(): void {
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    if (this.stompClient) {
      this.stompClient.disconnect();
    }
    this.isConnected = false;
    this.emit('DISCONNECTED');
  }

  // 에러 처리
  private handleError(error: any) {
    console.error('WebSocket 에러:', error);
    
    // JWT 토큰 만료 에러 처리
    if (error.message && error.message.includes('401')) {
      // 토큰 갱신 로직 호출
      this.emit('TOKEN_EXPIRED');
    }
  }

  // 연결 해제 처리
  private handleDisconnect() {
    this.isConnected = false;
    
    // 자동 재연결 시도
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        console.log(`재연결 시도 ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        this.connect().catch(() => {
          // 재연결 실패 시 추가 처리
        });
      }, this.reconnectInterval);
    } else {
      console.log('최대 재연결 시도 횟수 초과');
    }
  }

  // 연결 상태 확인
  public getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

// 싱글톤 인스턴스 생성
export const webSocketContainer = new WebSocketContainer();
export default webSocketContainer; 
import { useEffect, useState, useCallback, useRef } from 'react';
import webSocketContainer, { ChatMessage, ChatRoom, WebSocketEvent } from './WebSocketContainer';

interface UseWebSocketReturn {
  isConnected: boolean;
  messages: ChatMessage[];
  rooms: ChatRoom[];
  sendMessage: (roomId: string, content: string, type?: 'TEXT' | 'IMAGE' | 'FILE') => Promise<boolean>;
  sendImage: (roomId: string, imageUrl: string) => Promise<boolean>;
  joinRoom: (roomId: string) => Promise<boolean>;
  leaveRoom: (roomId: string) => Promise<boolean>;
  requestRoomList: () => Promise<boolean>;
  connect: () => Promise<boolean>;
  disconnect: () => void;
  error: string | null;
  addMessageHandler: (id: string, handler: Function) => void;
  removeMessageHandler: (id: string) => void;
  addRoomHandler: (id: string, handler: Function) => void;
  removeRoomHandler: (id: string) => void;
  addNotificationHandler: (id: string, handler: Function) => void;
  removeNotificationHandler: (id: string) => void;
}

export const useWebSocket = (accessToken?: string): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const messageHandlers = useRef<Map<string, Function>>(new Map());
  const roomHandlers = useRef<Map<string, Function>>(new Map());
  const notificationHandlers = useRef<Map<string, Function>>(new Map());

  // WebSocket 이벤트 핸들러들
  const handleConnected = useCallback(() => {
    setIsConnected(true);
    setError(null);
    console.log('WebSocket 연결됨');
  }, []);

  const handleDisconnected = useCallback(() => {
    setIsConnected(false);
    console.log('WebSocket 연결 해제됨');
  }, []);

  const handleMessage = useCallback((data: ChatMessage) => {
    setMessages(prev => {
      // 중복 메시지 방지
      const exists = prev.find(msg => msg.id === data.id);
      if (exists) return prev;
      
      return [...prev, data];
    });
    
    // 등록된 메시지 핸들러들 실행
    messageHandlers.current.forEach(handler => handler(data));
  }, []);

  const handleRoomList = useCallback((data: ChatRoom[]) => {
    setRooms(data);
    
    // 등록된 룸 핸들러들 실행
    roomHandlers.current.forEach(handler => handler(data));
  }, []);

  const handleNotification = useCallback((data: any) => {
    // 등록된 알림 핸들러들 실행
    notificationHandlers.current.forEach(handler => handler(data));
  }, []);

  const handleError = useCallback((error: any) => {
    setError(error.message || 'WebSocket 에러가 발생했습니다.');
    console.error('WebSocket 에러:', error);
  }, []);

  const handleTokenExpired = useCallback(() => {
    setError('토큰이 만료되었습니다. 다시 로그인해주세요.');
    // 토큰 갱신 로직을 여기에 추가할 수 있습니다.
  }, []);

  // WebSocket 이벤트 리스너 등록
  useEffect(() => {
    webSocketContainer.on('CONNECTED', handleConnected);
    webSocketContainer.on('DISCONNECTED', handleDisconnected);
    webSocketContainer.on('MESSAGE', handleMessage);
    webSocketContainer.on('ROOM_LIST', handleRoomList);
    webSocketContainer.on('NOTIFICATION', handleNotification);
    webSocketContainer.on('ERROR', handleError);
    webSocketContainer.on('TOKEN_EXPIRED', handleTokenExpired);

    return () => {
      webSocketContainer.off('CONNECTED', handleConnected);
      webSocketContainer.off('DISCONNECTED', handleDisconnected);
      webSocketContainer.off('MESSAGE', handleMessage);
      webSocketContainer.off('ROOM_LIST', handleRoomList);
      webSocketContainer.off('NOTIFICATION', handleNotification);
      webSocketContainer.off('ERROR', handleError);
      webSocketContainer.off('TOKEN_EXPIRED', handleTokenExpired);
    };
  }, [handleConnected, handleDisconnected, handleMessage, handleRoomList, handleNotification, handleError, handleTokenExpired]);

  // 액세스 토큰 설정
  useEffect(() => {
    if (accessToken) {
      webSocketContainer.setAccessToken(accessToken);
    }
  }, [accessToken]);

  // 메시지 핸들러 등록 함수
  const addMessageHandler = useCallback((id: string, handler: Function) => {
    messageHandlers.current.set(id, handler);
  }, []);

  // 메시지 핸들러 제거 함수
  const removeMessageHandler = useCallback((id: string) => {
    messageHandlers.current.delete(id);
  }, []);

  // 룸 핸들러 등록 함수
  const addRoomHandler = useCallback((id: string, handler: Function) => {
    roomHandlers.current.set(id, handler);
  }, []);

  // 룸 핸들러 제거 함수
  const removeRoomHandler = useCallback((id: string) => {
    roomHandlers.current.delete(id);
  }, []);

  // 알림 핸들러 등록 함수
  const addNotificationHandler = useCallback((id: string, handler: Function) => {
    notificationHandlers.current.set(id, handler);
  }, []);

  // 알림 핸들러 제거 함수
  const removeNotificationHandler = useCallback((id: string) => {
    notificationHandlers.current.delete(id);
  }, []);

  // WebSocket 연결
  const connect = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      const result = await webSocketContainer.connect();
      return result;
    } catch (error: any) {
      setError(error.message || '연결에 실패했습니다.');
      return false;
    }
  }, []);

  // WebSocket 연결 해제
  const disconnect = useCallback(() => {
    webSocketContainer.disconnect();
  }, []);

  // 메시지 전송
  const sendMessage = useCallback(async (
    roomId: string, 
    content: string, 
    type: 'TEXT' | 'IMAGE' | 'FILE' = 'TEXT'
  ): Promise<boolean> => {
    try {
      setError(null);
      const result = await webSocketContainer.sendMessage(roomId, content, type);
      return result;
    } catch (error: any) {
      setError(error.message || '메시지 전송에 실패했습니다.');
      return false;
    }
  }, []);

  // 이미지 전송
  const sendImage = useCallback(async (roomId: string, imageUrl: string): Promise<boolean> => {
    try {
      setError(null);
      const result = await webSocketContainer.sendImage(roomId, imageUrl);
      return result;
    } catch (error: any) {
      setError(error.message || '이미지 전송에 실패했습니다.');
      return false;
    }
  }, []);

  // 채팅방 입장
  const joinRoom = useCallback(async (roomId: string): Promise<boolean> => {
    try {
      setError(null);
      const result = await webSocketContainer.joinRoom(roomId);
      return result;
    } catch (error: any) {
      setError(error.message || '채팅방 입장에 실패했습니다.');
      return false;
    }
  }, []);

  // 채팅방 퇴장
  const leaveRoom = useCallback(async (roomId: string): Promise<boolean> => {
    try {
      setError(null);
      const result = await webSocketContainer.leaveRoom(roomId);
      return result;
    } catch (error: any) {
      setError(error.message || '채팅방 퇴장에 실패했습니다.');
      return false;
    }
  }, []);

  // 채팅방 목록 요청
  const requestRoomList = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      const result = await webSocketContainer.requestRoomList();
      return result;
    } catch (error: any) {
      setError(error.message || '채팅방 목록 요청에 실패했습니다.');
      return false;
    }
  }, []);

  return {
    isConnected,
    messages,
    rooms,
    sendMessage,
    sendImage,
    joinRoom,
    leaveRoom,
    requestRoomList,
    connect,
    disconnect,
    error,
    // 추가 유틸리티 함수들
    addMessageHandler,
    removeMessageHandler,
    addRoomHandler,
    removeRoomHandler,
    addNotificationHandler,
    removeNotificationHandler,
  };
};

export default useWebSocket; 
// WebSocket 서버 설정
export const WEBSOCKET_CONFIG = {
  // 개발 환경 (React Native 에뮬레이터용)
  DEV: {
    WS_URL: 'http://10.0.2.2:8080/ws', // Android 에뮬레이터용 (http 사용)
    API_URL: 'http://10.0.2.2:8080/api',
  },
  // iOS 시뮬레이터용
  DEV_IOS: {
    WS_URL: 'http://localhost:8080/ws', // iOS 시뮬레이터용 (http 사용)
    API_URL: 'http://localhost:8080/api',
  },
  // 실제 디바이스용 (서버 IP 주소로 변경 필요)
  DEV_DEVICE: {
    WS_URL: 'http://192.168.55.115:8080/ws', // 실제 서버 IP로 변경 (http 사용)
    API_URL: 'http://192.168.55.115:8080/api',
  },
  // 스테이징 환경
  STAGING: {
    WS_URL: 'http://your-staging-server:8080/ws',
    API_URL: 'http://your-staging-server:8080/api',
  },
  // 프로덕션 환경
  PRODUCTION: {
    WS_URL: 'https://your-production-server.com/ws',
    API_URL: 'https://your-production-server.com/api',
  },
};

// 현재 환경 설정 (플랫폼에 맞게 변경)
export const CURRENT_ENV = 'DEV'; // 'DEV_IOS' 또는 'DEV_DEVICE'로 변경 가능

// WebSocket 연결 설정
export const WS_CONNECTION_CONFIG = {
  // 재연결 시도 횟수
  MAX_RECONNECT_ATTEMPTS: 5,
  // 재연결 간격 (밀리초)
  RECONNECT_INTERVAL: 3000,
  // 연결 타임아웃 (밀리초)
  CONNECTION_TIMEOUT: 10000,
  // 하트비트 간격 (밀리초)
  HEARTBEAT_INTERVAL: 30000,
};

// 채팅 설정
export const CHAT_CONFIG = {
  // 메시지 최대 길이
  MAX_MESSAGE_LENGTH: 1000,
  // 메시지 전송 타임아웃 (밀리초)
  SEND_TIMEOUT: 5000,
  // 메시지 로딩 지연 (밀리초)
  LOADING_DELAY: 500,
};

// 현재 환경의 WebSocket URL 가져오기
export const getWebSocketUrl = (): string => {
  return WEBSOCKET_CONFIG[CURRENT_ENV as keyof typeof WEBSOCKET_CONFIG].WS_URL;
};

// 현재 환경의 API URL 가져오기
export const getApiUrl = (): string => {
  return WEBSOCKET_CONFIG[CURRENT_ENV as keyof typeof WEBSOCKET_CONFIG].API_URL;
}; 
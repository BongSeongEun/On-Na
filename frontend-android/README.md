# On-Na Frontend Android

React Native를 사용한 모바일 애플리케이션입니다.

## 🚀 시작하기

### 필수 요구사항

- Node.js 18 이상
- React Native CLI
- Android Studio (Android 개발용)
- Xcode (iOS 개발용, macOS만)

### 설치 및 실행

```bash
# 의존성 설치
npm install

# Android 실행
npm run android

# iOS 실행
npm run ios

# Metro 서버 시작
npm start
```

## 💬 WebSocket 채팅 기능

이 프로젝트는 WebSocket을 사용한 실시간 채팅 기능을 포함하고 있습니다.

### 주요 기능

- **실시간 메시지 전송/수신**: WebSocket을 통한 양방향 실시간 통신
- **채팅방 관리**: 채팅방 목록 조회, 입장/퇴장
- **자동 재연결**: 네트워크 연결 끊김 시 자동 재연결
- **JWT 인증**: 보안을 위한 JWT 토큰 기반 인증
- **에러 처리**: 연결 실패, 토큰 만료 등의 에러 처리

### 사용법

#### 1. WebSocket Container 사용

```typescript
import webSocketContainer from './src/utils/WebSocketContainer';

// JWT 토큰 설정
webSocketContainer.setAccessToken('your-jwt-token');

// WebSocket 연결
await webSocketContainer.connect();

// 메시지 전송
await webSocketContainer.sendMessage('roomId', 'Hello World');

// 채팅방 입장
await webSocketContainer.joinRoom('roomId');

// 연결 해제
webSocketContainer.disconnect();
```

#### 2. useWebSocket 훅 사용

```typescript
import useWebSocket from './src/utils/useWebSocket';

const MyComponent = () => {
  const {
    isConnected,
    messages,
    rooms,
    sendMessage,
    joinRoom,
    leaveRoom,
    connect,
    disconnect,
    error
  } = useWebSocket('your-jwt-token');

  useEffect(() => {
    // WebSocket 연결
    connect();
  }, []);

  const handleSendMessage = async () => {
    await sendMessage('roomId', 'Hello World');
  };

  return (
    <View>
      <Text>연결 상태: {isConnected ? '연결됨' : '연결 안됨'}</Text>
      {error && <Text>에러: {error}</Text>}
    </View>
  );
};
```

#### 3. 채팅 컴포넌트 사용

```typescript
import ChatRoomList from './src/components/ChatRoomList';
import ChatRoom from './src/components/ChatRoom';

// 채팅방 목록
<ChatRoomList 
  accessToken="your-jwt-token"
  onRoomSelect={(roomId, roomName) => {
    // 채팅방 선택 처리
  }}
/>

// 채팅방
<ChatRoom
  roomId="room-id"
  roomName="채팅방 이름"
  accessToken="your-jwt-token"
  onBack={() => {
    // 뒤로가기 처리
  }}
/>
```

### 백엔드 설정

백엔드에서는 Spring Boot와 STOMP를 사용하여 WebSocket 서버를 구현했습니다.

#### 주요 엔드포인트

- **WebSocket 연결**: `/ws`
- **메시지 전송**: `/app/chat/message`
- **채팅방 입장**: `/app/chat/join`
- **채팅방 퇴장**: `/app/chat/leave`
- **채팅방 목록 요청**: `/app/chat/rooms`

#### 구독 토픽

- **개인 메시지**: `/user/queue/messages`
- **채팅방 목록**: `/user/queue/rooms`
- **채팅방 메시지**: `/topic/chat/room`

### 환경 설정

`src/utils/config.ts` 파일에서 WebSocket 서버 URL과 기타 설정을 변경할 수 있습니다.

```typescript
export const WEBSOCKET_CONFIG = {
  DEV: {
    WS_URL: 'ws://localhost:8080/ws',
    API_URL: 'http://localhost:8080/api',
  },
  // 다른 환경 설정...
};
```

### 보안 고려사항

1. **JWT 토큰 관리**: 토큰 만료 시 자동 갱신 로직 구현 필요
2. **CORS 설정**: 프로덕션 환경에서는 특정 도메인으로 제한
3. **SSL/TLS**: 프로덕션 환경에서는 WSS(WebSocket Secure) 사용
4. **인증 검증**: 서버에서 JWT 토큰 유효성 검증 필요

## 📁 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── ChatRoom.tsx    # 채팅방 컴포넌트
│   └── ChatRoomList.tsx # 채팅방 목록 컴포넌트
├── pages/              # 페이지 컴포넌트
│   └── ChatPage.tsx    # 채팅 페이지
├── utils/              # 유틸리티 함수
│   ├── WebSocketContainer.ts # WebSocket 관리
│   ├── useWebSocket.ts # WebSocket 훅
│   └── config.ts       # 설정 파일
└── types/              # TypeScript 타입 정의
```

## 🔧 개발 가이드

### 새로운 채팅 기능 추가

1. `WebSocketContainer.ts`에 새로운 메서드 추가
2. `useWebSocket.ts`에 해당 기능을 훅으로 노출
3. 필요한 컴포넌트에서 훅 사용

### 에러 처리

WebSocket 연결 실패, 메시지 전송 실패 등의 에러는 자동으로 처리되며, 사용자에게 적절한 알림이 표시됩니다.

### 성능 최적화

- 메시지 중복 방지
- 자동 스크롤 최적화
- 메모리 누수 방지를 위한 이벤트 리스너 정리

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

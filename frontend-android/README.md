# On-Na 채팅 앱

카카오톡과 같은 실시간 채팅 기능을 제공하는 React Native 앱입니다.

## 주요 기능

### 🚀 실시간 채팅
- **WebSocket 기반 실시간 메시지 전송**
- **자동 재연결 기능** - 연결이 끊어져도 자동으로 재연결
- **하트비트 시스템** - 연결 상태를 지속적으로 모니터링
- **연결 상태 표시** - 실시간으로 연결 상태를 확인

### 💬 메시지 기능
- **텍스트 메시지 전송** - 일반 텍스트 메시지 전송
- **이미지 전송** - 갤러리에서 이미지 선택하여 전송
- **메시지 타임스탬프** - 각 메시지의 전송 시간 표시
- **메시지 구분** - 내 메시지와 상대방 메시지를 시각적으로 구분

### 📱 채팅방 관리
- **채팅방 목록** - 사용자가 속한 모든 채팅방 표시
- **안읽음 메시지 카운트** - 읽지 않은 메시지 개수를 실시간으로 표시
- **마지막 메시지 미리보기** - 채팅방 목록에서 마지막 메시지 내용 표시
- **실시간 업데이트** - 새 메시지가 오면 채팅방 목록이 자동으로 업데이트

### 🔔 알림 시스템
- **실시간 알림** - 채팅방에 있지 않아도 새 메시지 알림
- **안읽음 상태 관리** - 채팅방 입장 시 안읽음 카운트 자동 초기화
- **푸시 알림 지원** - 백그라운드에서도 메시지 알림 수신

## 기술 스택

### Frontend (React Native)
- **React Native 0.79.2** - 크로스 플랫폼 모바일 앱 개발
- **TypeScript** - 타입 안전성 보장
- **WebSocket (STOMP)** - 실시간 양방향 통신
- **Axios** - HTTP API 통신
- **React Navigation** - 화면 네비게이션
- **Emotion** - 스타일링
- **React Native Image Picker** - 이미지 선택 기능

### Backend (Spring Boot)
- **Spring Boot** - 서버 프레임워크
- **Spring WebSocket** - WebSocket 지원
- **STOMP** - 메시징 프로토콜
- **JWT** - 인증 토큰
- **JPA/Hibernate** - 데이터베이스 ORM
- **MySQL** - 데이터베이스

## 설치 및 실행

### Frontend 설정

1. **의존성 설치**
```bash
cd frontend-android
npm install
```

2. **Android 권한 설정**
- `android/app/src/main/AndroidManifest.xml`에 이미지 접근 권한이 추가되어 있습니다.

3. **앱 실행**
```bash
# Android
npm run android

# iOS
npm run ios
```

### Backend 설정

1. **서버 실행**
```bash
cd backend
./gradlew bootRun
```

2. **데이터베이스 설정**
- MySQL 데이터베이스가 필요합니다.
- `application.yml`에서 데이터베이스 연결 정보를 설정하세요.

## 주요 컴포넌트

### WebSocket 연결 관리
- `WebSocketContainer.ts` - WebSocket 연결 및 메시지 처리
- `useWebSocket.ts` - React Hook으로 WebSocket 기능 제공

### 채팅 화면
- `Chatting.tsx` - 실시간 채팅 화면
- `Chat_list.tsx` - 채팅방 목록 화면

### 백엔드 API
- `ChatController.java` - WebSocket 메시지 처리
- `ChatService.java` - 비즈니스 로직 처리
- `WebSocketConfig.java` - WebSocket 설정

## 기능 상세 설명

### 실시간 연결 관리
```typescript
// WebSocket 연결 상태 모니터링
const { isConnected, connect, disconnect } = useWebSocket(accessToken);

// 자동 재연결
useEffect(() => {
  if (!isConnected) {
    connect();
  }
}, [isConnected]);
```

### 메시지 전송
```typescript
// 텍스트 메시지 전송
await sendMessage(roomId, "안녕하세요!");

// 이미지 전송
await sendImage(roomId, imageUri);
```

### 안읽음 메시지 관리
```typescript
// 실시간 안읽음 카운트 업데이트
const notificationHandler = (notification) => {
  if (notification.type === 'NEW_MESSAGE') {
    // 안읽음 카운트 증가
    updateUnreadCount(notification.roomId);
  }
};
```

## 문제 해결

### WebSocket 연결 타임아웃
- 서버가 실행 중인지 확인
- 네트워크 연결 상태 확인
- 방화벽 설정 확인

### 이미지 전송 실패
- Android 권한이 올바르게 설정되었는지 확인
- 갤러리 접근 권한 허용

### 안읽음 카운트가 업데이트되지 않음
- WebSocket 연결 상태 확인
- 서버 로그에서 알림 전송 확인

## 개발 환경

- **Node.js**: 18+
- **React Native**: 0.79.2
- **Java**: 11+
- **Spring Boot**: 3.x
- **MySQL**: 8.0+

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

package com.example.onna.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;
import lombok.extern.slf4j.Slf4j;

@Configuration
@EnableWebSocketMessageBroker
@Slf4j
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // 클라이언트가 서버로 메시지를 보낼 때 사용할 prefix
        config.setApplicationDestinationPrefixes("/app");
        
        // 서버가 클라이언트에게 메시지를 보낼 때 사용할 prefix
        config.enableSimpleBroker("/topic", "/queue");
        
        // 사용자별 메시지 prefix
        config.setUserDestinationPrefix("/user");
        
        log.info("WebSocket Message Broker configured");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // WebSocket 연결 엔드포인트 등록
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // CORS 설정 (프로덕션에서는 특정 도메인으로 제한)
                .withSockJS() // SockJS 지원
                .setHeartbeatTime(25000) // 하트비트 간격 설정
                .setDisconnectDelay(5000) // 연결 해제 지연 설정
                .setInterceptors(new HandshakeInterceptor() {
                    @Override
                    public boolean beforeHandshake(org.springframework.http.server.ServerHttpRequest request,
                                                org.springframework.http.server.ServerHttpResponse response,
                                                org.springframework.web.socket.WebSocketHandler wsHandler,
                                                java.util.Map<String, Object> attributes) throws Exception {
                        log.info("WebSocket handshake request from: {}", request.getRemoteAddress());
                        log.info("Request headers: {}", request.getHeaders());
                        return true;
                    }

                    @Override
                    public void afterHandshake(org.springframework.http.server.ServerHttpRequest request,
                                            org.springframework.http.server.ServerHttpResponse response,
                                            org.springframework.web.socket.WebSocketHandler wsHandler,
                                            Exception exception) {
                        log.info("WebSocket handshake completed for: {}", request.getRemoteAddress());
                    }
                });
        
        log.info("WebSocket STOMP endpoints registered: /ws");
    }

    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registration) {
        registration.setMessageSizeLimit(64 * 1024) // 64KB
                  .setSendBufferSizeLimit(512 * 1024) // 512KB
                  .setSendTimeLimit(20000); // 20초
        
        log.info("WebSocket transport configured");
    }

    // STOMP 연결 이벤트 핸들러
    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        log.info("=== STOMP 연결 성공 ===");
        log.info("Session ID: {}", headerAccessor.getSessionId());
        log.info("User: {}", headerAccessor.getUser());
        log.info("Headers: {}", headerAccessor.toNativeHeaderMap());
    }

    // STOMP 연결 해제 이벤트 핸들러
    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        log.info("=== STOMP 연결 해제 ===");
        log.info("Session ID: {}", headerAccessor.getSessionId());
    }

    // STOMP 구독 이벤트 핸들러
    @EventListener
    public void handleWebSocketSubscribeListener(SessionSubscribeEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        log.info("=== STOMP 구독 ===");
        log.info("Session ID: {}", headerAccessor.getSessionId());
        log.info("Destination: {}", headerAccessor.getDestination());
    }
}
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
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.AbstractMessageChannel;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;
import lombok.extern.slf4j.Slf4j;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.util.Map;

@Configuration
@EnableWebSocketMessageBroker
@Slf4j
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Value("${jwt.secret}")
    private String jwtSecret;

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
                        
                        // Authorization 헤더에서 JWT 토큰 추출
                        String authHeader = request.getHeaders().getFirst("Authorization");
                        if (authHeader != null && authHeader.startsWith("Bearer ")) {
                            String token = authHeader.substring(7);
                            try {
                                // JWT 토큰 파싱 (JJWT 0.12.3 버전에 맞는 API 사용)
                                Claims claims = Jwts.parser()
                                    .verifyWith(Keys.hmacShaKeyFor(jwtSecret.getBytes()))
                                    .build()
                                    .parseSignedClaims(token)
                                    .getPayload();
                                
                                String userId = claims.getSubject();
                                attributes.put("userId", userId);
                                log.info("JWT token parsed successfully, userId: {}", userId);
                            } catch (Exception e) {
                                log.warn("Invalid JWT token during handshake: {}", e.getMessage());
                                // JWT 토큰이 유효하지 않아도 연결은 허용 (나중에 처리)
                                attributes.put("userId", "anonymous");
                            }
                        } else {
                            log.info("No Authorization header found, allowing connection as anonymous");
                            attributes.put("userId", "anonymous");
                        }
                        
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

// JWT 토큰 인터셉터
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@Slf4j
class JwtChannelInterceptor implements ChannelInterceptor {
    
    @Value("${jwt.secret}")
    private String jwtSecret;
    
    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        
        if (accessor != null && accessor.getCommand() != null) {
            log.info("STOMP Command: {}", accessor.getCommand());
            
            // CONNECT 명령에서 JWT 토큰 처리
            if (accessor.getCommand().name().equals("CONNECT")) {
                String authHeader = accessor.getFirstNativeHeader("Authorization");
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    String token = authHeader.substring(7);
                    try {
                        Claims claims = Jwts.parser()
                            .verifyWith(Keys.hmacShaKeyFor(jwtSecret.getBytes()))
                            .build()
                            .parseSignedClaims(token)
                            .getPayload();
                        
                        String userId = claims.getSubject();
                        accessor.setUser(() -> userId);
                        log.info("User authenticated via JWT: {}", userId);
                    } catch (Exception e) {
                        log.warn("Invalid JWT token in STOMP connect: {}", e.getMessage());
                        // JWT 토큰이 유효하지 않아도 연결은 허용
                        accessor.setUser(() -> "anonymous");
                    }
                } else {
                    log.info("No Authorization header in STOMP connect, using anonymous user");
                    accessor.setUser(() -> "anonymous");
                }
            }
        }
        
        return message;
    }
}
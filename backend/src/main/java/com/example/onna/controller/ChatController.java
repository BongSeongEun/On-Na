package com.example.onna.controller;

import com.example.onna.dto.ChatMessageDto;
import com.example.onna.model.ChatMessage;
import com.example.onna.repository.ChatMessageRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@Slf4j
@Controller
@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @MessageMapping("/chat.send")
    public void sendMessage(ChatMessageDto message) {
        ChatMessage entity = new ChatMessage();
        entity.setRoomId(message.getRoomId());
        entity.setSenderId(message.getSenderId());
        entity.setMessage(message.getMessage());
        entity.setRead(false);
        entity.setTimestamp(LocalDateTime.now());
        chatMessageRepository.save(entity);

        messagingTemplate.convertAndSend("/topic/chat/" + message.getRoomId(), message);
    }

    @PostMapping("/send")
    public ResponseEntity<ChatMessageDto> sendMessageHttp(@RequestBody ChatMessageDto message) {
        ChatMessage entity = new ChatMessage();
        entity.setRoomId(message.getRoomId());
        entity.setSenderId(message.getSenderId());
        entity.setMessage(message.getMessage());
        entity.setRead(false);
        entity.setTimestamp(LocalDateTime.now());
        chatMessageRepository.save(entity);

        // WebSocket으로도 전송
        messagingTemplate.convertAndSend("/topic/chat/" + message.getRoomId(), message);
        
        return ResponseEntity.ok(message);
    }
}


package com.example.onna.controller;

import com.example.onna.dto.ChatMessageDto;
import com.example.onna.model.ChatMessage;
import com.example.onna.repository.ChatMessageRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

@Slf4j
@Controller
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
}


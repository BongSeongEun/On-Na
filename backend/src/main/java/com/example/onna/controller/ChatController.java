package com.example.onna.controller;

import com.example.onna.dto.ChatMessageDTO;
import com.example.onna.model.ChatMessage;
import com.example.onna.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Slf4j
@Controller
@RequiredArgsConstructor
public class ChatController {
    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    // 메시지 전송
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(ChatMessageDTO dto) {
        ChatMessage message = chatService.saveMessage(dto.getChatRoomId(), dto.getSenderId(), dto.getContent());
        dto.setMessageId(message.getId());
        messagingTemplate.convertAndSend("/topic/chatroom." + dto.getChatRoomId(), dto);
    }

    // 읽음 처리
    @MessageMapping("/chat.readMessage")
    public void readMessage(ChatMessageDTO dto) {
        chatService.markAsRead(dto.getMessageId(), dto.getSenderId());
    }
}

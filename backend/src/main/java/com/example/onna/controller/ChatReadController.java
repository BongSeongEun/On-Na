package com.example.onna.controller;

import com.example.onna.repository.ChatMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chat")
public class ChatReadController {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @PostMapping("/read/{roomId}/{userId}")
    public ResponseEntity<Void> markAsRead(@PathVariable String roomId, @PathVariable Long userId) {
        chatMessageRepository.markMessagesAsRead(roomId, userId);
        return ResponseEntity.ok().build();
    }
}

package com.example.onna.controller;

import com.example.onna.model.ChatMessage;
import com.example.onna.model.ChatRoom;
import com.example.onna.service.ChatService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat")
public class ChatRestController {
    private final ChatService chatService;

    @PostMapping("/room")
    public ChatRoom createRoom(@RequestBody CreateRoomRequest req) {
        return chatService.createRoom(req.getName(), req.getUserIds());
    }

    @GetMapping("/rooms/{userId}")
    public List<ChatRoom> getMyRooms(@PathVariable Long userId) {
        return chatService.getMyRooms(userId);
    }

    @GetMapping("/messages/{roomId}")
    public List<ChatMessage> getMessages(@PathVariable Long roomId) {
        return chatService.getMessages(roomId);
    }
}

@Data
class CreateRoomRequest {
    private String name;
    private List<Long> userIds;
}

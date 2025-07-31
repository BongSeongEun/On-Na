package com.example.onna.controller;

import com.example.onna.dto.ChatMessageDto;
import com.example.onna.dto.ChatRoomDto;
import com.example.onna.service.ChatService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat")
public class ChatRestController {
    private final ChatService chatService;

    @PostMapping("/room")
    public ChatRoomDto createRoom(@RequestBody CreateRoomRequest req) {
        // Long을 String으로 변환
        List<String> participantIds = req.getUserIds().stream()
                .map(String::valueOf)
                .collect(Collectors.toList());
        return chatService.createRoom(req.getName(), participantIds);
    }

    @GetMapping("/rooms/{userId}")
    public List<ChatRoomDto> getMyRooms(@PathVariable String userId) {
        return chatService.getUserRooms(userId);
    }

    @GetMapping("/messages/{roomId}")
    public List<ChatMessageDto> getMessages(@PathVariable String roomId) {
        return chatService.getRoomMessages(roomId);
    }

    // 테스트용 샘플 데이터 생성
    @PostMapping("/sample-data")
    public String createSampleData() {
        chatService.createSampleRooms();
        return "Sample data created successfully";
    }
}

@Data
class CreateRoomRequest {
    private String name;
    private List<Long> userIds;
}

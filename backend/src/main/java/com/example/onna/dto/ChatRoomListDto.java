package com.example.onna.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoomListDto {
    private String roomId;
    private Long userId;
    private String userName;
    private String lastMessage;
    private String timestamp;
    private int unreadCount;
} 
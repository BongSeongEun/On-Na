package com.example.onna.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDto {
    private String roomId;
    private Long senderId;
    private String message;
    private String timestamp;
    private boolean read;
}


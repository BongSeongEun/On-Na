package com.example.onna.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JsonBackReference
    private ChatRoom chatRoom;
    private Long senderId;
    private String content;
    private LocalDateTime sentAt = LocalDateTime.now();
    @OneToMany(mappedBy = "message", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<ChatMessageRead> reads = new ArrayList<>();
}

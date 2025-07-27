package com.example.onna.model;

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
public class ChatRoom {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private LocalDateTime createdAt = LocalDateTime.now();
    @OneToMany(mappedBy = "chatRoom", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<ChatRoomMember> members = new ArrayList<>();
}
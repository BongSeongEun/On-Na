package com.example.onna.repository;

import com.example.onna.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findBysocialId(String socialId);
    Boolean existsByEmail(String email);
    Optional<User> findByEmail(String email);
}
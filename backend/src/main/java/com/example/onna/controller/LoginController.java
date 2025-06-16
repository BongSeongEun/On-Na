package com.example.onna.controller;

import com.example.onna.dto.JwtResponse;
import com.example.onna.dto.LoginDTO;
import com.example.onna.model.User;
import com.example.onna.repository.UserRepository;
import com.example.onna.service.SocialLoginService;
import com.example.onna.utils.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class LoginController {
    private final SocialLoginService socialLoginService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public LoginController(SocialLoginService socialLoginService, UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.socialLoginService = socialLoginService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/kakao")
    public Map<String, String> kakaoLogin(@RequestBody Map<String, String> body) {
        String kakaoAccessToken = body.get("kakaoAccessToken");
        String jwt = socialLoginService.kakaoLogin(kakaoAccessToken);
        return Map.of("token", jwt);
    }

    @PostMapping("/google")
    public Map<String, String> googleLogin(@RequestBody Map<String, String> body) {
        String googleAccessToken = body.get("googleAccessToken");
        String jwt = socialLoginService.googleLogin(googleAccessToken);
        return Map.of("token", jwt);
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest().body("이미 존재하는 이메일입니다.");
        }
        user.setEmail(user.getEmail());
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setNickname(user.getNickname());
        userRepository.save(user);
        return ResponseEntity.ok("회원가입 성공");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDTO loginDTO) {
        User user = userRepository.findByEmail(loginDTO.getEmail())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        if (!passwordEncoder.matches(loginDTO.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("비밀번호가 틀렸습니다.");
        }

        String accessToken = jwtUtil.generateAccessToken(user.getUserId());
        String refreshToken = jwtUtil.generateRefreshToken(user.getUserId());

        // refreshToken은 DB 또는 Redis에 저장 추천
        user.setRefresh_token(refreshToken);
        userRepository.save(user);

        return ResponseEntity.ok(new JwtResponse(accessToken, refreshToken));
    }

}

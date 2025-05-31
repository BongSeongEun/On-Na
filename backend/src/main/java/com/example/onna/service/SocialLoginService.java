package com.example.onna.service;

import com.example.onna.model.User;
import com.example.onna.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Date;
import java.util.Map;

@Service
public class SocialLoginService {

    private final UserRepository userRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${jwt.secret}")
    private String secretKey;
    @Value("${jwt.expiration}")
    private Long expiration;

    public SocialLoginService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public String kakaoLogin(String kakaoAccessToken) {
        Map kakaoUser = getKakaoUser(kakaoAccessToken);
        String kakaoId = kakaoUser.get("id").toString();
        Map<String, Object> kakaoAccount = (Map) kakaoUser.get("kakao_account");
        String email = (String) kakaoAccount.get("email");
        String nickname = (String) ((Map) kakaoAccount.get("profile")).get("nickname");

        User user = userRepository.findBysocialId(kakaoId)
                .orElseGet(() -> userRepository.save(new User(kakaoId, email, nickname)));

        return generateToken(user.getUserId());
    }

    private Map getKakaoUser(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        HttpEntity<?> entity = new HttpEntity<>(headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                "https://kapi.kakao.com/v2/user/me",
                HttpMethod.GET, entity, Map.class
        );

        return response.getBody();
    }

    public String googleLogin(String googleAccessToken) {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(googleAccessToken);
        HttpEntity<?> entity = new HttpEntity<>(headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                "https://www.googleapis.com/oauth2/v3/userinfo", HttpMethod.GET, entity, Map.class);
        Map<String, Object> body = response.getBody();

        String googleId = (String) body.get("sub");
        String email = (String) body.get("email");
        String name = (String) body.get("name");

        User user = userRepository.findBysocialId(googleId)
                .orElseGet(() -> userRepository.save(new User(googleId, email, name)));

        return generateToken(user.getUserId());
    }

    private String generateToken(Long userId) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .setSubject(userId.toString())
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(SignatureAlgorithm.HS256, secretKey.getBytes())
                .compact();
    }
}

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

import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Date;
import java.util.Map;

@Service
public class KakaoLoginService {

    private final UserRepository userRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${jwt.secret}")
    private String secretKey;
    @Value("${jwt.expiration}")
    private Long expiration;

    String access_token;
    String refresh_token;
    String requestURL = "https://kauth.kakao.com/oauth/token";

    public KakaoLoginService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }


    public String kakaoLogin(String kakaoAccessToken) {
        Map kakaoUser = getKakaoUser(kakaoAccessToken);
        Long kakaoId = Long.valueOf(kakaoUser.get("id").toString());
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

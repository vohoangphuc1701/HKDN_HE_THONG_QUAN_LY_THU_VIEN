package com.library.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * Cấu hình WebSocket STOMP thời gian thực
 * Phục vụ đồng bộ tức thời khi Thủ thư quét mã QR bàn giao sách hoặc nhận trả sách tại quầy:
 * - Kênh '/topic/scan-station': Cập nhật trực tiếp lên màn hình Trạm quét tại quầy (TV5 & TV6)
 * - Kênh '/topic/orders': Cập nhật trạng thái đơn mượn/phiếu trả thời gian thực cho Sinh viên & Thủ thư
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Bật Simple Broker cho các kênh broadcast (/topic) và gửi riêng từng user (/queue)
        registry.enableSimpleBroker("/topic", "/queue");
        // Tiền tố cho các message từ Client gửi lên @MessageMapping trên Server
        registry.setApplicationDestinationPrefixes("/app");
        // Tiền tố cho message gửi đích danh từng người dùng
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Hỗ trợ cả kết nối WebSocket thuần và SockJS fallback
        registry.addEndpoint("/ws", "/ws-qr")
                .setAllowedOriginPatterns("*");

        registry.addEndpoint("/ws", "/ws-qr")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}


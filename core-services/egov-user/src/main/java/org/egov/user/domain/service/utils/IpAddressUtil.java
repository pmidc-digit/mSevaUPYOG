package org.egov.user.domain.service.utils;

import org.apache.commons.lang3.StringUtils;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;

public class IpAddressUtil {

    private static final String[] IP_HEADER_CANDIDATES = {
            "X-Forwarded-For",
            "x-real-ip",
            "X-Real-IP",
            "Proxy-Client-IP",
            "WL-Proxy-Client-IP",
            "HTTP_CLIENT_IP",
            "HTTP_X_FORWARDED_FOR"
    };

    /**
     * Extracts the client IP from current HttpServletRequest in RequestContextHolder
     */
    public static String getClientIp() {
        ServletRequestAttributes attr =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attr != null) {
            return getClientIp(attr.getRequest());
        }
        return "";
    }

    /**
     * Extracts the client IP from a given HttpServletRequest
     */
    public static String getClientIp(HttpServletRequest request) {
        if (request == null) {
            return "";
        }
        for (String header : IP_HEADER_CANDIDATES) {
            String ip = request.getHeader(header);
            if (StringUtils.isNotBlank(ip) && !"unknown".equalsIgnoreCase(ip.trim())) {
                if (ip.contains(",")) {
                    ip = ip.split(",")[0].trim();
                }
                return sanitizeIp(ip);
            }
        }
        return sanitizeIp(request.getRemoteAddr());
    }

    /**
     * Sanitizes and bounds IP length to fit within varchar(45) / varchar(50) columns
     */
    public static String sanitizeIp(String ip) {
        if (StringUtils.isBlank(ip)) {
            return "";
        }
        ip = ip.trim();
        if (ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        if ("0:0:0:0:0:0:0:1".equals(ip)) {
            ip = "127.0.0.1";
        }
        if (ip.length() > 45) {
            ip = ip.substring(0, 45);
        }
        return ip;
    }
}

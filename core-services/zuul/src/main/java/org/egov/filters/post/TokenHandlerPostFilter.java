package org.egov.filters.post;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.context.RequestContext;
import lombok.extern.slf4j.Slf4j;
import org.egov.model.SessionData;
import org.egov.model.TokenHandlerContext;
import org.egov.service.SessionStoreService;
import org.egov.util.CookieUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

/**
 * Post-filter to handle session creation and cookie management
 * Converts auth token response to session cookie
 */
@Component
@Slf4j
public class TokenHandlerPostFilter extends ZuulFilter {

    @Autowired
    private SessionStoreService sessionStoreService;

    @Autowired
    private ObjectMapper objectMapper;

    @Value("${zuul.token.handler.enabled:true}")
    private Boolean tokenHandlerEnabled;

    @Value("${zuul.token.handler.cookie.name:SESSION_ID}")
    private String cookieName;

    @Value("${zuul.token.handler.cookie.domain:}")
    private String cookieDomain;

    @Value("${zuul.token.handler.cookie.path:/}")
    private String cookiePath;

    @Value("${zuul.token.handler.cookie.secure:false}")
    private Boolean cookieSecure;

    @Value("${zuul.token.handler.cookie.httponly:true}")
    private Boolean cookieHttpOnly;

    @Value("${zuul.token.handler.cookie.samesite:Lax}")
    private String cookieSameSite;

    private static final String TOKEN_HANDLER_CONTEXT_KEY = "tokenHandlerContext";
    private static final String USER_INFO_KEY = "userInfo";
    private static final int FILTER_ORDER = 10;

    @Override
    public String filterType() {
        return "post";
    }

    @Override
    public int filterOrder() {
        return FILTER_ORDER;
    }

    @Override
    public boolean shouldFilter() {
        if (!tokenHandlerEnabled) {
            return false;
        }

        RequestContext ctx = RequestContext.getCurrentContext();
        TokenHandlerContext context = (TokenHandlerContext) ctx.get(TOKEN_HANDLER_CONTEXT_KEY);

        // Only filter login and logout requests
        return context != null && (context.isLoginRequest() || context.isLogoutRequest());
    }

    @Override
    public Object run() {
        RequestContext ctx = RequestContext.getCurrentContext();
        TokenHandlerContext context = (TokenHandlerContext) ctx.get(TOKEN_HANDLER_CONTEXT_KEY);

        try {
            if (context.isLoginRequest()) {
                handleLoginResponse(ctx, context);
            } else if (context.isLogoutRequest()) {
                handleLogoutResponse(ctx, context);
            }
        } catch (Exception e) {
            log.error("Error in TokenHandlerPostFilter", e);
        }

        return null;
    }

    /**
     * Handle login response - extract auth token and create session
     */
    private void handleLoginResponse(RequestContext ctx, TokenHandlerContext context) throws IOException {
        HttpServletResponse response = ctx.getResponse();
        HttpServletRequest request = ctx.getRequest();

        // Check if response is successful (2xx status)
        int statusCode = ctx.getResponseStatusCode();
        if (statusCode < 200 || statusCode >= 300) {
            log.debug("Login failed with status: {}", statusCode);
            return;
        }

        // Extract auth token from response body
        String authToken = extractAuthTokenFromResponse(ctx);
        if (authToken == null) {
            log.warn("No auth token found in login response");
            return;
        }

        // Extract user information
        String userId = extractUserIdFromResponse(ctx);
        String tenantId = extractTenantIdFromResponse(ctx);
        String userType = extractUserTypeFromResponse(ctx);

        // Get client information
        String ipAddress = getClientIpAddress(request);
        String userAgent = request.getHeader("User-Agent");

        // Create session
        SessionData sessionData = sessionStoreService.createSession(
                authToken,
                userId,
                tenantId,
                userType,
                ipAddress,
                userAgent
        );

        // Set session cookie with SameSite attribute
        Cookie sessionCookie = createSessionCookie(sessionData.getSessionId());
        CookieUtil.addSameSiteAttribute(response, sessionCookie, cookieSameSite);

        context.setSessionId(sessionData.getSessionId());
        context.setAuthToken(authToken);
        context.setSessionData(sessionData);
        context.setSessionCreated(true);

        log.info("Created session and set cookie for user: {}", userId);
    }

    /**
     * Handle logout response - delete session and clear cookie
     */
    private void handleLogoutResponse(RequestContext ctx, TokenHandlerContext context) {
        HttpServletResponse response = ctx.getResponse();

        // Delete session from Redis
        if (context.getSessionId() != null) {
            sessionStoreService.deleteSession(context.getSessionId());
            log.info("Deleted session: {}", context.getSessionId());
        } else if (context.getAuthToken() != null) {
            sessionStoreService.deleteSessionByAuthToken(context.getAuthToken());
            log.info("Deleted session by auth token");
        }

        // Clear session cookie with SameSite attribute
        Cookie clearCookie = createClearCookie();
        CookieUtil.addSameSiteAttribute(response, clearCookie, cookieSameSite);

        log.debug("Cleared session cookie");
    }

    /**
     * Extract auth token from response body
     */
    private String extractAuthTokenFromResponse(RequestContext ctx) throws IOException {
        InputStream responseDataStream = ctx.getResponseDataStream();
        if (responseDataStream == null) {
            return null;
        }

        // --- Read response body (Java 8 compatible) ---
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        byte[] data = new byte[1024];
        int nRead;
        while ((nRead = responseDataStream.read(data, 0, data.length)) != -1) {
            buffer.write(data, 0, nRead);
        }
        buffer.flush();
        String responseBody = new String(buffer.toByteArray(), StandardCharsets.UTF_8);

        // Reset response body for downstream filters
        ctx.setResponseBody(responseBody);

        try {
            JsonNode jsonNode = objectMapper.readTree(responseBody);

            // Possible token field names
            String[] tokenFields = {"access_token", "accessToken", "authToken", "token"};
            for (String field : tokenFields) {
                JsonNode tokenNode = jsonNode.get(field);
                if (tokenNode != null && !tokenNode.isNull()) {
                    return tokenNode.asText();
                }
            }

            // Check nested structures
            JsonNode userInfoNode = jsonNode.get("UserRequest");
            if (userInfoNode != null) {
                for (String field : tokenFields) {
                    JsonNode tokenNode = userInfoNode.get(field);
                    if (tokenNode != null && !tokenNode.isNull()) {
                        return tokenNode.asText();
                    }
                }
            }

            JsonNode responseInfoNode = jsonNode.get("ResponseInfo");
            if (responseInfoNode != null) {
                for (String field : tokenFields) {
                    JsonNode tokenNode = responseInfoNode.get(field);
                    if (tokenNode != null && !tokenNode.isNull()) {
                        return tokenNode.asText();
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error parsing response body for auth token", e);
        }

        return null;
    }

    /**
     * Extract user ID from response
     */
    private String extractUserIdFromResponse(RequestContext ctx) {
        try {
            Object userInfo = ctx.get(USER_INFO_KEY);
            if (userInfo != null) {
                JsonNode userNode = objectMapper.valueToTree(userInfo);
                JsonNode userIdNode = userNode.get("uuid");
                if (userIdNode != null) {
                    return userIdNode.asText();
                }
            }
        } catch (Exception e) {
            log.debug("Could not extract user ID", e);
        }
        return "unknown";
    }

    /**
     * Extract tenant ID from response
     */
    private String extractTenantIdFromResponse(RequestContext ctx) {
        try {
            Object userInfo = ctx.get(USER_INFO_KEY);
            if (userInfo != null) {
                JsonNode userNode = objectMapper.valueToTree(userInfo);
                JsonNode tenantIdNode = userNode.get("tenantId");
                if (tenantIdNode != null) {
                    return tenantIdNode.asText();
                }
            }
        } catch (Exception e) {
            log.debug("Could not extract tenant ID", e);
        }
        return "default";
    }

    /**
     * Extract user type from response
     */
    private String extractUserTypeFromResponse(RequestContext ctx) {
        try {
            Object userInfo = ctx.get(USER_INFO_KEY);
            if (userInfo != null) {
                JsonNode userNode = objectMapper.valueToTree(userInfo);
                JsonNode typeNode = userNode.get("type");
                if (typeNode != null) {
                    return typeNode.asText();
                }
            }
        } catch (Exception e) {
            log.debug("Could not extract user type", e);
        }
        return "CITIZEN";
    }

    /**
     * Create session cookie
     */
    private Cookie createSessionCookie(String sessionId) {
        Cookie cookie = new Cookie(cookieName, sessionId);
        cookie.setPath(cookiePath);
        cookie.setHttpOnly(cookieHttpOnly);
        cookie.setSecure(cookieSecure);
        cookie.setMaxAge(sessionStoreService.getSessionTimeout().intValue());

        if (cookieDomain != null && !cookieDomain.isEmpty()) {
            cookie.setDomain(cookieDomain);
        }

        // Note: SameSite attribute needs to be set via response header
        // as Cookie class doesn't support it directly in older servlet versions

        return cookie;
    }

    /**
     * Create cookie to clear session
     */
    private Cookie createClearCookie() {
        Cookie cookie = new Cookie(cookieName, "");
        cookie.setPath(cookiePath);
        cookie.setHttpOnly(cookieHttpOnly);
        cookie.setSecure(cookieSecure);
        cookie.setMaxAge(0); // Expire immediately

        if (cookieDomain != null && !cookieDomain.isEmpty()) {
            cookie.setDomain(cookieDomain);
        }

        return cookie;
    }

    /**
     * Get client IP address
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String[] headers = {
                "X-Forwarded-For",
                "Proxy-Client-IP",
                "WL-Proxy-Client-IP",
                "HTTP_X_FORWARDED_FOR",
                "HTTP_X_FORWARDED",
                "HTTP_X_CLUSTER_CLIENT_IP",
                "HTTP_CLIENT_IP",
                "HTTP_FORWARDED_FOR",
                "HTTP_FORWARDED",
                "HTTP_VIA",
                "REMOTE_ADDR"
        };

        for (String header : headers) {
            String ip = request.getHeader(header);
            if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
                // X-Forwarded-For can contain multiple IPs, take the first one
                if (ip.contains(",")) {
                    ip = ip.split(",")[0].trim();
                }
                return ip;
            }
        }

        return request.getRemoteAddr();
    }
}

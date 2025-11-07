package org.egov.filters.pre;

import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.context.RequestContext;
import lombok.extern.slf4j.Slf4j;
import org.egov.model.SessionData;
import org.egov.model.TokenHandlerContext;
import org.egov.service.SessionStoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import java.util.Arrays;

/**
 * Pre-filter to handle cookie-based authentication
 * Converts session cookie to auth token for downstream services
 */
@Component
@Slf4j
public class TokenHandlerPreFilter extends ZuulFilter {

    @Autowired
    private SessionStoreService sessionStoreService;

    @Value("${zuul.token.handler.enabled:true}")
    private Boolean tokenHandlerEnabled;

    @Value("${zuul.token.handler.cookie.name:SESSION_ID}")
    private String cookieName;

    @Value("${zuul.token.handler.login.path:/user/oauth/token,/user/_login}")
    private String loginPaths;

    @Value("${zuul.token.handler.logout.path:/user/_logout}")
    private String logoutPaths;

    private static final String AUTH_TOKEN_KEY = "authToken";
    private static final String TOKEN_HANDLER_CONTEXT_KEY = "tokenHandlerContext";
    private static final int FILTER_ORDER = 2; // Run before AuthFilter (which is order 3)

    @Override
    public String filterType() {
        return "pre";
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
        HttpServletRequest request = ctx.getRequest();
        String uri = request.getRequestURI();

        // Don't filter health check and actuator endpoints
        if (uri.contains("/health") || uri.contains("/actuator")) {
            return false;
        }

        return true;
    }

    @Override
    public Object run() {
        RequestContext ctx = RequestContext.getCurrentContext();
        HttpServletRequest request = ctx.getRequest();
        String uri = request.getRequestURI();

        TokenHandlerContext context = TokenHandlerContext.builder()
                .isLoginRequest(isLoginRequest(uri))
                .isLogoutRequest(isLogoutRequest(uri))
                .build();

        try {
            if (context.isLoginRequest()) {
                handleLoginRequest(ctx, context);
            } else if (context.isLogoutRequest()) {
                handleLogoutRequest(ctx, context);
            } else {
                handleNormalRequest(ctx, context);
            }
        } catch (Exception e) {
            log.error("Error in TokenHandlerPreFilter", e);
        }

        // Store context for post filter
        ctx.set(TOKEN_HANDLER_CONTEXT_KEY, context);

        return null;
    }

    /**
     * Handle login request - extract auth token if present for session creation in post filter
     */
    private void handleLoginRequest(RequestContext ctx, TokenHandlerContext context) {
        log.debug("Processing login request");
        // Auth token will be in the response, post filter will handle session creation
        // Just mark this as login request for post filter
    }

    /**
     * Handle logout request - extract session from cookie and prepare for deletion
     */
    private void handleLogoutRequest(RequestContext ctx, TokenHandlerContext context) {
        log.debug("Processing logout request");
        HttpServletRequest request = ctx.getRequest();

        // Try to get session from cookie
        String sessionId = getSessionIdFromCookie(request);
        if (sessionId != null) {
            context.setSessionId(sessionId);
            SessionData sessionData = sessionStoreService.getSession(sessionId);
            if (sessionData != null) {
                context.setSessionData(sessionData);
                context.setAuthToken(sessionData.getAuthToken());
                // Set auth token in context for logout processing
                ctx.set(AUTH_TOKEN_KEY, sessionData.getAuthToken());
                log.debug("Extracted auth token from session for logout");
            }
        }

        // Also check if auth token is directly in request (backward compatibility)
        if (context.getAuthToken() == null) {
            String authToken = extractAuthTokenFromRequest(ctx);
            if (authToken != null) {
                context.setAuthToken(authToken);
                context.setOriginalAuthToken(authToken);
            }
        }
    }

    /**
     * Handle normal request - convert session cookie to auth token
     */
    private void handleNormalRequest(RequestContext ctx, TokenHandlerContext context) {
        HttpServletRequest request = ctx.getRequest();

        // First, try to get session from cookie
        String sessionId = getSessionIdFromCookie(request);
        if (sessionId != null) {
            log.debug("Found session cookie: {}", sessionId);
            SessionData sessionData = sessionStoreService.getSession(sessionId);

            if (sessionData != null && sessionStoreService.isSessionValid(sessionId)) {
                // Valid session found - extract auth token and set in context
                String authToken = sessionData.getAuthToken();
                ctx.set(AUTH_TOKEN_KEY, authToken);

                context.setSessionId(sessionId);
                context.setAuthToken(authToken);
                context.setSessionData(sessionData);

                log.debug("Successfully retrieved auth token from session");
            } else {
                log.warn("Invalid or expired session: {}", sessionId);
                // Session expired or invalid - let request proceed without auth token
                // Backend will handle authentication failure
            }
        } else {
            // No session cookie - check if auth token is directly in request (backward compatibility)
            String authToken = extractAuthTokenFromRequest(ctx);
            if (authToken != null) {
                log.debug("Using auth token from request (backward compatibility)");
                ctx.set(AUTH_TOKEN_KEY, authToken);
                context.setAuthToken(authToken);
                context.setOriginalAuthToken(authToken);
            } else {
                log.debug("No session cookie or auth token found in request");
            }
        }
    }

    /**
     * Extract session ID from cookie
     */
    private String getSessionIdFromCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }

        return Arrays.stream(cookies)
                .filter(cookie -> cookieName.equals(cookie.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }

    /**
     * Extract auth token from request body/headers (for backward compatibility)
     */
    private String extractAuthTokenFromRequest(RequestContext ctx) {
        HttpServletRequest request = ctx.getRequest();

        // Check Authorization header
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }

        // Check custom auth token header
        String authToken = request.getHeader("auth-token");
        if (authToken != null) {
            return authToken;
        }

        // Check request parameter
        authToken = request.getParameter("authToken");
        if (authToken != null) {
            return authToken;
        }

        // For POST requests, auth token might be in request body
        // This will be handled by downstream services
        return null;
    }

    /**
     * Check if request is a login request
     */
    private boolean isLoginRequest(String uri) {
        if (loginPaths == null || loginPaths.isEmpty()) {
            return false;
        }

        String[] paths = loginPaths.split(",");
        for (String path : paths) {
            if (uri.contains(path.trim())) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if request is a logout request
     */
    private boolean isLogoutRequest(String uri) {
        if (logoutPaths == null || logoutPaths.isEmpty()) {
            return false;
        }

        String[] paths = logoutPaths.split(",");
        for (String path : paths) {
            if (uri.contains(path.trim())) {
                return true;
            }
        }
        return false;
    }
}

package org.egov.util;

import lombok.experimental.UtilityClass;
import lombok.extern.slf4j.Slf4j;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Arrays;
import java.util.Optional;

/**
 * Utility class for cookie management
 */
@UtilityClass
@Slf4j
public class CookieUtil {

    /**
     * Get cookie value by name
     */
    public static Optional<String> getCookieValue(HttpServletRequest request, String cookieName) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null || cookieName == null) {
            return Optional.empty();
        }

        return Arrays.stream(cookies)
                .filter(cookie -> cookieName.equals(cookie.getName()))
                .map(Cookie::getValue)
                .findFirst();
    }

    /**
     * Get cookie by name
     */
    public static Optional<Cookie> getCookie(HttpServletRequest request, String cookieName) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null || cookieName == null) {
            return Optional.empty();
        }

        return Arrays.stream(cookies)
                .filter(cookie -> cookieName.equals(cookie.getName()))
                .findFirst();
    }

    /**
     * Create a cookie with standard settings
     */
    public static Cookie createCookie(String name, String value, String path, String domain,
                                      boolean httpOnly, boolean secure, int maxAge) {
        Cookie cookie = new Cookie(name, value);
        cookie.setPath(path);
        cookie.setHttpOnly(httpOnly);
        cookie.setSecure(secure);
        cookie.setMaxAge(maxAge);

        if (domain != null && !domain.isEmpty()) {
            cookie.setDomain(domain);
        }

        return cookie;
    }

    /**
     * Create a session cookie
     */
    public static Cookie createSessionCookie(String name, String value, String path, String domain,
                                             boolean httpOnly, boolean secure, int maxAge) {
        return createCookie(name, value, path, domain, httpOnly, secure, maxAge);
    }

    /**
     * Create a cookie to clear/delete existing cookie
     */
    public static Cookie createClearCookie(String name, String path, String domain) {
        Cookie cookie = new Cookie(name, "");
        cookie.setPath(path);
        cookie.setMaxAge(0); // Expire immediately
        cookie.setHttpOnly(true);

        if (domain != null && !domain.isEmpty()) {
            cookie.setDomain(domain);
        }

        return cookie;
    }

    /**
     * Add SameSite attribute to cookie via Set-Cookie header
     * This is needed because Cookie class doesn't support SameSite in older servlet versions
     */
    public static void addSameSiteAttribute(HttpServletResponse response, Cookie cookie, String sameSite) {
        StringBuilder headerValue = new StringBuilder();
        headerValue.append(cookie.getName()).append("=").append(cookie.getValue());
        headerValue.append("; Path=").append(cookie.getPath());

        if (cookie.getMaxAge() >= 0) {
            headerValue.append("; Max-Age=").append(cookie.getMaxAge());
        }

        if (cookie.getDomain() != null) {
            headerValue.append("; Domain=").append(cookie.getDomain());
        }

        if (cookie.isHttpOnly()) {
            headerValue.append("; HttpOnly");
        }

        if (cookie.getSecure()) {
            headerValue.append("; Secure");
        }

        if (sameSite != null && !sameSite.isEmpty()) {
            headerValue.append("; SameSite=").append(sameSite);
        }

        response.addHeader("Set-Cookie", headerValue.toString());
    }

    /**
     * Check if cookie exists
     */
    public static boolean hasCookie(HttpServletRequest request, String cookieName) {
        return getCookie(request, cookieName).isPresent();
    }

    /**
     * Delete cookie by name
     */
    public static void deleteCookie(HttpServletResponse response, String name, String path, String domain) {
        Cookie clearCookie = createClearCookie(name, path, domain);
        response.addCookie(clearCookie);
        log.debug("Deleted cookie: {}", name);
    }
}

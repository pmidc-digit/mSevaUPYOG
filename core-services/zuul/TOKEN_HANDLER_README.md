# Token Handler Pattern Implementation

## Overview

The Token Handler pattern has been implemented in the Zuul API Gateway to provide cookie-based session management instead of sending authentication tokens in request bodies. This enhances security by storing sensitive tokens server-side in Redis while using session IDs in HTTP-only cookies for client communication.

## Architecture

### Flow Diagram

```
┌─────────────┐                    ┌──────────────┐                    ┌─────────────┐
│   Client    │                    │  Zuul Gateway│                    │Auth Service │
│  (Browser)  │                    │   (Filters)  │                    │             │
└──────┬──────┘                    └──────┬───────┘                    └──────┬──────┘
       │                                   │                                   │
       │ 1. Login Request                  │                                   │
       │ POST /user/oauth/token            │                                   │
       ├──────────────────────────────────►│                                   │
       │   (username, password)            │                                   │
       │                                   │ 2. Forward to Auth Service        │
       │                                   ├──────────────────────────────────►│
       │                                   │                                   │
       │                                   │ 3. Auth Token Response            │
       │                                   │◄──────────────────────────────────┤
       │                                   │   {access_token: "xyz..."}        │
       │                                   │                                   │
       │                                   │ 4. Store in Redis                 │
       │                                   │    sessionId -> SessionData       │
       │                                   │    authToken -> sessionId         │
       │                                   │                                   │
       │ 5. Cookie Response                │                                   │
       │◄──────────────────────────────────┤                                   │
       │   Set-Cookie: SESSION_ID=abc123   │                                   │
       │                                   │                                   │
       │                                   │                                   │
       │ 6. API Request with Cookie        │                                   │
       ├──────────────────────────────────►│                                   │
       │   Cookie: SESSION_ID=abc123       │                                   │
       │                                   │                                   │
       │                                   │ 7. Retrieve from Redis            │
       │                                   │    sessionId -> authToken         │
       │                                   │                                   │
       │                                   │ 8. Forward with Auth Token        │
       │                                   ├──────────────────────────────────►│
       │                                   │   {authToken: "xyz..."}           │
       │                                   │                                   │
       │ 9. Response                       │                                   │
       │◄──────────────────────────────────┤                                   │
       │                                   │                                   │
```

## Components

### 1. Model Classes

#### SessionData (`org.egov.model.SessionData`)
Stores session information in Redis:
- `sessionId`: Unique session identifier
- `authToken`: Authentication token from auth service
- `userId`: User's unique identifier
- `tenantId`: Tenant context
- `userType`: Type of user (CITIZEN, EMPLOYEE, etc.)
- `createdAt`: Session creation timestamp
- `lastAccessedAt`: Last activity timestamp
- `expiresAt`: Expiration timestamp
- `ipAddress`: Client IP address
- `userAgent`: Client user agent string

#### TokenHandlerContext (`org.egov.model.TokenHandlerContext`)
Context object passed between pre and post filters:
- `sessionId`: Current session ID
- `authToken`: Current auth token
- `sessionData`: Full session data
- `isLoginRequest`: Flag for login requests
- `isLogoutRequest`: Flag for logout requests
- `sessionCreated`: Flag indicating new session
- `originalAuthToken`: Original token for backward compatibility

### 2. Service Layer

#### SessionStoreService (`org.egov.service.SessionStoreService`)
Manages Redis session operations:

**Key Methods:**
- `createSession()`: Creates new session and bidirectional Redis mappings
- `getSession()`: Retrieves session by ID and updates last accessed time
- `getSessionByAuthToken()`: Retrieves session using auth token
- `updateSessionAuthToken()`: Updates session with refreshed token
- `refreshSession()`: Extends session timeout
- `deleteSession()`: Removes session and cleanup
- `deleteSessionByAuthToken()`: Removes session by token
- `isSessionValid()`: Validates session expiration

**Redis Key Patterns:**
- `session:{sessionId}` → SessionData object
- `authtoken:{authToken}` → sessionId (for reverse lookup)

### 3. Zuul Filters

#### TokenHandlerPreFilter (`org.egov.filters.pre.TokenHandlerPreFilter`)
**Order**: 2 (runs before AuthFilter which is order 3)

**Responsibilities:**
1. **Normal Requests**: Extract session ID from cookie → retrieve auth token from Redis → inject into request context
2. **Login Requests**: Mark as login for post-filter processing
3. **Logout Requests**: Extract session ID → retrieve auth token → prepare for deletion
4. **Backward Compatibility**: Allow auth token in headers/parameters if no cookie present

**Configuration:**
```properties
zuul.token.handler.enabled=true
zuul.token.handler.cookie.name=SESSION_ID
zuul.token.handler.login.path=/user/oauth/token,/user/_login
zuul.token.handler.logout.path=/user/_logout
```

#### TokenHandlerPostFilter (`org.egov.filters.post.TokenHandlerPostFilter`)
**Order**: 10

**Responsibilities:**
1. **Login Response**: Extract auth token from response → create session → store in Redis → set session cookie
2. **Logout Response**: Delete session from Redis → clear cookie

**Cookie Configuration:**
```properties
zuul.token.handler.cookie.domain=
zuul.token.handler.cookie.path=/
zuul.token.handler.cookie.secure=false
zuul.token.handler.cookie.httponly=true
zuul.token.handler.cookie.samesite=Lax
```

### 4. Configuration

#### RedisConfig (`org.egov.config.RedisConfig`)
Configures Redis connection and serialization:
- Lettuce connection factory
- String serializer for keys
- JSON serializer for values (with Java 8 time support)
- ObjectMapper with JavaTimeModule

### 5. Utilities

#### CookieUtil (`org.egov.util.CookieUtil`)
Helper methods for cookie operations:
- `getCookieValue()`: Extract cookie value from request
- `createSessionCookie()`: Create session cookie with standard attributes
- `createClearCookie()`: Create cookie for deletion (Max-Age=0)
- `addSameSiteAttribute()`: **Used by TokenHandlerPostFilter** - Add SameSite attribute via Set-Cookie header (required because javax.servlet.http.Cookie doesn't support SameSite in older versions)
- `deleteCookie()`: Remove cookie

**Usage in TokenHandlerPostFilter:**
```java
// Login response - create session cookie
Cookie sessionCookie = createSessionCookie(sessionData.getSessionId());
CookieUtil.addSameSiteAttribute(response, sessionCookie, cookieSameSite);

// Logout response - clear session cookie
Cookie clearCookie = createClearCookie();
CookieUtil.addSameSiteAttribute(response, clearCookie, cookieSameSite);
```

This approach ensures proper SameSite attribute is set via the Set-Cookie header for enhanced CSRF protection.

## Configuration Properties

Add to `application.properties`:

```properties
# Redis Configuration
spring.redis.host=redis.backbone
spring.redis.port=6379
spring.redis.database=0
spring.redis.password=

# Token Handler Configuration
zuul.token.handler.enabled=true
zuul.token.handler.session.timeout=3600

# Cookie Configuration
zuul.token.handler.cookie.name=SESSION_ID
zuul.token.handler.cookie.domain=
zuul.token.handler.cookie.path=/
zuul.token.handler.cookie.secure=false
zuul.token.handler.cookie.httponly=true
zuul.token.handler.cookie.samesite=Lax

# Path Configuration
zuul.token.handler.login.path=/user/oauth/token,/user/_login
zuul.token.handler.logout.path=/user/_logout
```

### Configuration Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `zuul.token.handler.enabled` | `true` | Enable/disable token handler |
| `zuul.token.handler.session.timeout` | `3600` | Session timeout in seconds |
| `zuul.token.handler.cookie.name` | `SESSION_ID` | Cookie name |
| `zuul.token.handler.cookie.domain` | Empty | Cookie domain (empty = current domain) |
| `zuul.token.handler.cookie.path` | `/` | Cookie path |
| `zuul.token.handler.cookie.secure` | `false` | HTTPS only (set to `true` in production) |
| `zuul.token.handler.cookie.httponly` | `true` | Prevent JavaScript access |
| `zuul.token.handler.cookie.samesite` | `Lax` | SameSite policy (Lax, Strict, None) |
| `zuul.token.handler.login.path` | `/user/oauth/token,/user/_login` | Login endpoint paths |
| `zuul.token.handler.logout.path` | `/user/_logout` | Logout endpoint paths |

## Request Flow Details

### Login Flow

1. **Client** sends login credentials to `/user/oauth/token`
2. **TokenHandlerPreFilter** detects login request, marks context
3. Request forwarded to **Auth Service**
4. **Auth Service** validates credentials, returns auth token
5. **TokenHandlerPostFilter** intercepts response:
   - Extracts auth token from response
   - Generates unique session ID
   - Creates SessionData with user info
   - Stores in Redis: `session:{sessionId}` and `authtoken:{token}`
   - Sets HTTP-only cookie: `SESSION_ID={sessionId}`
6. **Client** receives cookie (auth token not exposed to JavaScript)

### Authenticated Request Flow

1. **Client** sends request with session cookie
2. **TokenHandlerPreFilter**:
   - Extracts session ID from cookie
   - Queries Redis: `session:{sessionId}` → SessionData
   - Validates session (not expired)
   - Extracts auth token from SessionData
   - Injects auth token into request context
   - Updates last accessed timestamp
3. Request proceeds through **AuthFilter** (existing filter)
4. Request forwarded to backend service with auth token
5. Response returned to client (cookie maintained)

### Logout Flow

1. **Client** sends logout request with session cookie
2. **TokenHandlerPreFilter**:
   - Extracts session ID from cookie
   - Retrieves auth token from Redis
   - Marks as logout request
3. Request forwarded to **Auth Service**
4. **TokenHandlerPostFilter**:
   - Deletes session from Redis
   - Clears cookie (Max-Age=0)
5. **Client** session terminated

### Backward Compatibility

The implementation maintains backward compatibility:
- If no session cookie present, checks for auth token in:
  - `Authorization: Bearer {token}` header
  - `auth-token` header
  - `authToken` query parameter
- Existing clients using token-in-body continue to work
- New clients can use cookie-based sessions

## Security Considerations

### Benefits

1. **Token Protection**: Auth tokens never exposed to JavaScript (HTTP-only cookies)
2. **XSS Mitigation**: Tokens cannot be stolen via XSS attacks
3. **CSRF Protection**: SameSite cookie attribute prevents CSRF
4. **Session Management**: Centralized session control with timeout/revocation
5. **IP Tracking**: Session includes IP address for audit
6. **Audit Trail**: Session stores user agent and timestamps

### Production Recommendations

1. **Enable HTTPS**: Set `zuul.token.handler.cookie.secure=true`
2. **Configure Domain**: Set appropriate cookie domain for multi-subdomain support
3. **Session Timeout**: Adjust based on security requirements (shorter = more secure)
4. **Redis Security**: Use Redis password and encryption
5. **SameSite Strict**: Consider `SameSite=Strict` for high-security applications
6. **Monitor Sessions**: Implement session monitoring and anomaly detection

## Redis Data Structure

### Session Storage

```json
Key: "session:a1b2c3d4e5f6..."
Value: {
  "sessionId": "a1b2c3d4e5f6...",
  "authToken": "eyJhbGciOiJIUzI1NiIs...",
  "userId": "user-uuid-123",
  "tenantId": "pb.amritsar",
  "userType": "CITIZEN",
  "createdAt": "2025-11-03T10:30:00Z",
  "lastAccessedAt": "2025-11-03T10:35:00Z",
  "expiresAt": "2025-11-03T11:30:00Z",
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0..."
}
TTL: 3600 seconds
```

### Reverse Mapping

```
Key: "authtoken:eyJhbGciOiJIUzI1NiIs..."
Value: "a1b2c3d4e5f6..."
TTL: 3600 seconds
```

## Testing

### Test Login Flow

```bash
# Login
curl -X POST http://localhost:8080/user/oauth/token \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test@example.com",
    "password": "password123",
    "tenantId": "pb.amritsar"
  }' \
  -c cookies.txt

# Verify cookie was set
cat cookies.txt

# Make authenticated request
curl -X GET http://localhost:8080/user/v1/_search \
  -b cookies.txt

# Logout
curl -X POST http://localhost:8080/user/_logout \
  -b cookies.txt
```

### Test Redis Storage

```bash
# Connect to Redis
redis-cli

# List all sessions
KEYS session:*

# View session data
GET session:a1b2c3d4e5f6...

# Check reverse mapping
GET authtoken:eyJhbGciOiJIUzI1NiIs...

# Check TTL
TTL session:a1b2c3d4e5f6...
```

## Troubleshooting

### Cookie Not Being Set

1. Check filter is enabled: `zuul.token.handler.enabled=true`
2. Verify login path matches: `zuul.token.handler.login.path`
3. Check response status (must be 2xx)
4. Verify auth token in response body
5. Check logs for filter execution

### Session Not Found

1. Verify Redis connectivity
2. Check session timeout (may have expired)
3. Verify cookie name matches configuration
4. Check Redis key pattern: `KEYS session:*`
5. Verify session ID in cookie matches Redis

### Auth Token Not Injected

1. Check pre-filter order (must be before AuthFilter)
2. Verify session ID extraction from cookie
3. Check Redis for session data
4. Verify session not expired
5. Check logs for filter execution

### CORS Issues with Cookies

1. Ensure `Access-Control-Allow-Credentials: true` header
2. Set specific origin (not wildcard) in CORS config
3. Verify cookie domain/path configuration
4. Check SameSite attribute for cross-site requests

## Migration Guide

### Migrating Existing Clients

**Option 1: Gradual Migration (Recommended)**
1. Deploy token handler with backward compatibility enabled
2. Update client applications one by one to use cookies
3. Monitor Redis for session creation patterns
4. Once all clients migrated, remove backward compatibility

**Option 2: Big Bang Migration**
1. Update all client applications simultaneously
2. Deploy token handler
3. Invalidate existing tokens
4. Force re-login for all users

### Client Application Changes

**Before (Token in Body):**
```javascript
// Store token in localStorage
localStorage.setItem('authToken', response.access_token);

// Send token in request
fetch('/api/endpoint', {
  method: 'POST',
  body: JSON.stringify({
    authToken: localStorage.getItem('authToken'),
    // ... other data
  })
});
```

**After (Cookie-Based):**
```javascript
// No need to store token (handled by browser)

// Send request with credentials
fetch('/api/endpoint', {
  method: 'POST',
  credentials: 'include', // Include cookies
  body: JSON.stringify({
    // ... data only, no authToken
  })
});
```

## Monitoring and Metrics

### Recommended Metrics

1. **Session Creation Rate**: Track login frequency
2. **Active Sessions**: Current session count in Redis
3. **Session Expiration**: Track timeout vs explicit logout
4. **Failed Session Lookups**: May indicate attacks or expiration issues
5. **Redis Performance**: Monitor Redis latency and memory

### Health Checks

```bash
# Check Redis connectivity
curl http://localhost:8080/actuator/health

# Check active sessions
redis-cli DBSIZE

# Check filter status (via logs)
grep "TokenHandlerPreFilter" zuul.log
```

## Performance Considerations

1. **Redis Latency**: Each request requires 1 Redis read (session lookup)
2. **Network Overhead**: Minimal cookie overhead (~100 bytes)
3. **Memory Usage**: ~500 bytes per session in Redis
4. **Scaling**: Redis can be clustered for high availability
5. **Caching**: Session data cached in request context within single request

## Future Enhancements

1. **Session Refresh**: Automatic token refresh before expiration
2. **Multi-Device Support**: Track multiple sessions per user
3. **Geolocation Tracking**: Enhanced audit with location data
4. **Anomaly Detection**: Detect suspicious session patterns
5. **Session Transfer**: Support for session migration across devices
6. **Rate Limiting**: Per-session rate limiting
7. **Session Analytics**: Detailed session usage analytics

## References

- [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [Cookie Security Best Practices](https://owasp.org/www-community/controls/SecureCookieAttribute)
- [Redis Session Store Pattern](https://redis.io/docs/manual/patterns/session-store/)
- [Zuul Filter Documentation](https://github.com/Netflix/zuul/wiki/How-it-Works)

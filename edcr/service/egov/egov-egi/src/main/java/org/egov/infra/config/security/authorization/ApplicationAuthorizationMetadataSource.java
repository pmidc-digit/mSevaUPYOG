/*
 * eGov SmartCity eGovernance suite is licensed under the GNU GPL v3.
 */
package org.egov.infra.config.security.authorization;

import static org.egov.infra.security.utils.SecurityConstants.LOGIN_URI;
import static org.egov.infra.security.utils.SecurityConstants.PUBLIC_URI;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.function.Supplier;
import java.util.stream.Collectors;

import org.egov.infra.admin.master.entity.Action;
import org.egov.infra.admin.master.service.ActionService;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.authorization.AuthorizationResult;
import org.springframework.security.core.Authentication;

import jakarta.servlet.http.HttpServletRequest;

/** Database-backed URL authorization for Spring Security 7. */
public class ApplicationAuthorizationMetadataSource implements AuthorizationManager<HttpServletRequest> {

    private List<String> excludePatterns = new ArrayList<>();
    private ActionService actionService;

    public void setExcludePatterns(List<String> excludePatterns) {
        this.excludePatterns = excludePatterns;
    }

    public void setActionService(ActionService actionService) {
        this.actionService = actionService;
    }

    @Override
    public AuthorizationResult authorize(Supplier<? extends Authentication> authentication,
            HttpServletRequest request) {
        String url = request.getRequestURI().substring(request.getContextPath().length());
        if (url.startsWith(LOGIN_URI) || url.startsWith(PUBLIC_URI) || isPatternExcluded(url))
            return new AuthorizationDecision(true);

        String contextRoot = request.getContextPath().replace("/", "");
        Action action = actionService.getActionByUrlAndContextRoot(url, contextRoot);
        if (action == null)
            return new AuthorizationDecision(true);

        if (action.getRoles() == null || action.getRoles().isEmpty())
            return new AuthorizationDecision(true);

        Authentication current = authentication.get();
        if (current == null || !current.isAuthenticated())
            return new AuthorizationDecision(false);

        Set<String> requiredRoles = action.getRoles().stream().map(role -> role.getName()).collect(Collectors.toSet());
        boolean granted = current.getAuthorities().stream()
                .anyMatch(authority -> requiredRoles.contains(authority.getAuthority()));
        return new AuthorizationDecision(granted);
    }

    private boolean isPatternExcluded(String url) {
        return excludePatterns.stream().map(String::trim).anyMatch(url::startsWith);
    }
}

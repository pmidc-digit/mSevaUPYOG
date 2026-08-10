package org.egov.user.security;

import org.egov.user.security.oauth2.custom.CustomTokenEnhancer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.oauth2.provider.ClientDetails;
import org.springframework.security.oauth2.provider.ClientDetailsService;
import org.springframework.security.oauth2.provider.client.BaseClientDetails;
import org.springframework.security.oauth2.provider.client.InMemoryClientDetailsService;
import org.springframework.security.oauth2.provider.token.DefaultTokenServices;
import org.springframework.security.oauth2.provider.token.TokenStore;

import java.util.HashMap;
import java.util.Map;

import static org.egov.user.config.UserServiceConstants.USER_CLIENT_ID;

@Configuration
public class OAuthConfig {

    @Value("${access.token.validity.in.minutes}")
    private int accessTokenValidityInMinutes;

    @Value("${refresh.token.validity.in.minutes}")
    private int refreshTokenValidityInMinutes;

    @Autowired
    private AuthenticationManager customAuthenticationManager;

    @Autowired
    private CustomTokenEnhancer customTokenEnhancer;

    @Autowired
    private TokenStore tokenStore;

    @Bean
    public ClientDetailsService clientDetailsService() {
        InMemoryClientDetailsService clientDetailsService = new InMemoryClientDetailsService();
        Map<String, ClientDetails> clientDetailsStore = new HashMap<>();

        BaseClientDetails clientDetails = new BaseClientDetails(
            USER_CLIENT_ID,
            "",
            "read,write",
            "authorization_code,refresh_token,password",
            "ROLE_APP,ROLE_CITIZEN,ROLE_ADMIN,ROLE_EMPLOYEE"
        );
        clientDetails.setClientSecret("egov-user-secret");
        clientDetails.setAccessTokenValiditySeconds(accessTokenValidityInMinutes * 60);
        clientDetails.setRefreshTokenValiditySeconds(refreshTokenValidityInMinutes * 60);

        clientDetailsStore.put(USER_CLIENT_ID, clientDetails);
        clientDetailsService.setClientDetailsStore(clientDetailsStore);
        return clientDetailsService;
    }

    @Bean
    public DefaultTokenServices customTokenServices() {
        DefaultTokenServices tokenServices = new DefaultTokenServices();
        tokenServices.setTokenEnhancer(customTokenEnhancer);
        tokenServices.setTokenStore(tokenStore);
        tokenServices.setSupportRefreshToken(true);
        tokenServices.setReuseRefreshToken(true);
        tokenServices.setAuthenticationManager(customAuthenticationManager);
        tokenServices.setClientDetailsService(clientDetailsService());
        return tokenServices;
    }
}

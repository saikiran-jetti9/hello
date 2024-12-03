package com.beeja.api.financemanagementservice.config.filters;

import com.beeja.api.financemanagementservice.Utils.Constants;
import com.beeja.api.financemanagementservice.Utils.JwtUtils;
import com.beeja.api.financemanagementservice.Utils.UserContext;
import com.beeja.api.financemanagementservice.client.AccountClient;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.filter.OncePerRequestFilter;

@Slf4j
@Component
public class AuthorizationFilter extends OncePerRequestFilter {

  @Autowired AccountClient accountClient;

  @Autowired AuthUrlProperties authUrlProperties;

  @Autowired JwtProperties jwtProperties;

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    if (request.getRequestURI().startsWith("/finance/actuator/")
        || request.getRequestURI().equals("/finance/api-docs/swagger-config")
        || request.getRequestURI().startsWith("/finance/swagger-ui")
        || request.getRequestURI().startsWith("/finance/openApi.yaml")
        || request.getRequestURI().startsWith("/finance/v3/api-docs")) {
      filterChain.doFilter(request, response);
      return;
    }

    String accessToken = request.getHeader(Constants.AUTHORIZATION);
    String tokenInterspectionUrl = authUrlProperties.getTokenUri();

    accessToken = accessToken.substring(7);
    if (isValidAccessToken(accessToken, tokenInterspectionUrl)) {
      log.info(Constants.USER_SUCCESSFULLY_AUTHENTICATED);
      filterChain.doFilter(request, response);
    } else {
      log.error(Constants.USER_FAILED_AUTHENTICATE);
      response.setStatus(HttpServletResponse.SC_FORBIDDEN);
      response.getWriter().write(Constants.ACCESS_DENIED);
    }
  }

  private boolean isValidAccessToken(String accessToken, String tokenInterceptionURI) {
    String finalUrl = tokenInterceptionURI + Constants.ACCESS_TOKEN + accessToken;
    RestTemplate restTemplate = new RestTemplate();
    try {
      if (accessToken.startsWith("eyJh")) {
        return validateJWT(accessToken);
      } else {
        ResponseEntity<String> response = restTemplate.getForEntity(finalUrl, String.class);
        if (!response.getStatusCode().is2xxSuccessful()) {
          log.error(Constants.ERROR_AUTH_PROVIDER_SENT_INVALID_RESPONSE);
          return false;
        }
        String email = getEmailFromAccessToken(response.getBody());
        String issuedClientId = getIssuedClientId(response.getBody());
        String clientId = authUrlProperties.getClientId();
        if (!clientId.equals(issuedClientId)) {
          log.error(Constants.CLIENT_ID_NOT_MATCHED_BEEJA_AUTH);
          return false;
        }
        return checkUserPresenceAndSetActive(email, accessToken);
      }
    } catch (HttpClientErrorException e) {
      log.error("HTTP Error: {}", e.getStatusCode());
      return false;
    } catch (Exception e) {
      log.error("Token Validation Exception: {}", e.getMessage());
      return false;
    }
  }

  private boolean validateJWT(String accessToken) throws Exception {
    Claims claims = JwtUtils.decodeJWT(accessToken, jwtProperties.getSecret());
    String email = claims.get("sub").toString();
    return checkUserPresenceAndSetActive(email, accessToken);
  }

  private boolean checkUserPresenceAndSetActive(String email, String accessToken) {
    ResponseEntity<LinkedHashMap<String, Object>> userIsPresent =
        (ResponseEntity<LinkedHashMap<String, Object>>) accountClient.getEmployeeByEmail(email);
    LinkedHashMap<String, Object> responseBody = userIsPresent.getBody();
    if (userIsPresent.getStatusCode().is2xxSuccessful() && responseBody != null) {
      Boolean userIsActive = (Boolean) responseBody.get("active");
      if (userIsActive) {
        setLoggedInUser(responseBody, accessToken);
      }
      return userIsActive;
    }
    return false;
  }

  private void setLoggedInUser(LinkedHashMap<String, Object> responseBody, String accessToken) {
    String email = responseBody.get("email").toString();
    String firstName = responseBody.get("firstName").toString();
    String employeeId = responseBody.get("employeeId").toString();
    Map<String, Object> userOrganization = getUserOrganization(responseBody);
    Set<String> permissions = getPermissions(responseBody);
    UserContext.setLoggedInUser(
            email, firstName, employeeId, userOrganization, permissions, accessToken
    );
  }

  private Map<String, Object> getUserOrganization(LinkedHashMap<String, Object> responseBody) {
    Map<String, Object> userOrganization = new HashMap<>();
    Map<String, Object> organizations = (Map<String, Object>) responseBody.get("organizations");
    if (organizations != null) {
      userOrganization.put(Constants.ID, organizations.get("id"));
      userOrganization.put(Constants.NAME, organizations.get("name"));
      userOrganization.put(Constants.EMAIL, organizations.get("email"));
    }
    return userOrganization;
  }

  private Set<String> getPermissions(LinkedHashMap<String, Object> responseBody) {
    Set<String> permissions = new HashSet<>();
    Collection<LinkedHashMap<String, Object>> roles =
        (Collection<LinkedHashMap<String, Object>>) responseBody.get("roles");
    if (roles != null) {
      for (LinkedHashMap<String, Object> role : roles) {
        Collection<String> rolePermissions = (Collection<String>) role.get("permissions");
        if (rolePermissions != null) {
          permissions.addAll(rolePermissions);
        }
      }
    }
    return permissions;
  }

  private String getEmailFromAccessToken(String accessTokenAttributes) {
    ObjectMapper objectMapper = new ObjectMapper();
    try {
      JsonNode accessTokenJson = objectMapper.readTree(accessTokenAttributes);
      return accessTokenJson.get("email").asText();
    } catch (IOException e) {
      log.error("Error reading access token attributes: {}", e.getMessage());
      return null;
    }
  }

  private String getIssuedClientId(String accessTokenAttributes) {
    ObjectMapper objectMapper = new ObjectMapper();
    try {
      JsonNode accessTokenJson = objectMapper.readTree(accessTokenAttributes);
      return accessTokenJson.get("azp").asText();
    } catch (IOException e) {
      log.error("Error reading access token attributes: {}", e.getMessage());
      return null;
    }
  }
}

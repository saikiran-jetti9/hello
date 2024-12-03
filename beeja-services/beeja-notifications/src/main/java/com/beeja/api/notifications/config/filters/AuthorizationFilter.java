package com.beeja.api.notifications.config.filters;

import com.beeja.api.notifications.client.AccountClient;
import com.beeja.api.notifications.properties.ClientUrls;
import com.beeja.api.notifications.utils.BTokenVerificationContext;
import com.beeja.api.notifications.utils.Constants;
import com.beeja.api.notifications.utils.JwtUtils;
import com.beeja.api.notifications.utils.UserContext;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Control will come here before hitting any controller And request will reach controller only if
 * accessTokens are valid. <br>
 * Initially it will check for {@code bToken} for <b>open endpoints</b>, then check for {@code
 * authorization token} for remaining requests
 */
@Slf4j
@Component
public class AuthorizationFilter extends OncePerRequestFilter {

  @Autowired AccountClient accountClient;

  @Autowired ClientUrls clientUrls;

  @Autowired AuthUrlProperties authUrlProperties;

  @Autowired JwtProperties jwtProperties;

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    String beejaToken = request.getHeader("bToken");
    if (beejaToken != null && request.getRequestURI().startsWith("/notifications/v1/open/")) {
      RestTemplate restTemplate = new RestTemplate();
      ResponseEntity<String> tokenResponse;
      try {
        tokenResponse =
            restTemplate.getForEntity(
                clientUrls.getAccountsService() + "/v1/tokens/verify/" + beejaToken, String.class);
      } catch (Exception e) {
        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        response
            .getWriter()
            .write(Constants.B_TOKEN_VERIFICATION_REQUEST_FAILED_FROM_ACC + e.getMessage());
        return;
      }
      if (tokenResponse.getStatusCode() == HttpStatus.OK) {
        String responseBody = tokenResponse.getBody();
        try {
          ObjectMapper objectMapper = new ObjectMapper();
          JsonNode jsonNode = objectMapper.readTree(responseBody);

          boolean isValid = jsonNode.get("isValid").asBoolean();
          if (isValid) {
            BTokenVerificationContext.setTokenContext(
                jsonNode.get("isValid").asBoolean(),
                jsonNode.get("organizationId").asText(),
                jsonNode.get("tokenType").asText(),
                jsonNode.get("organizationName").asText());
            filterChain.doFilter(request, response);
            return;
          } else {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write(Constants.BTOKEN_EXPIRED_OR_INVALID);
            return;
          }
        } catch (Exception e) {
          return;
        }
      }
    }

    if (request.getRequestURI().startsWith("/notifications/actuator/")
        || request.getRequestURI().equals("/notifications/api-docs/swagger-config")
        || request.getRequestURI().startsWith("/notifications/swagger-ui/")
        || request.getRequestURI().startsWith("/notifications/openApi.yaml")) {
      filterChain.doFilter(request, response);
      return;
    }

    String accessToken = request.getHeader("authorization");
    if (accessToken == null) {
      response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
      response.getWriter().write(Constants.ACCESS_TOKEN_NULL_ERROR);
      return;
    }
    String tokenInterspectionUrl = authUrlProperties.getTokenUri();

    accessToken = accessToken.substring(7);
    if (isValidAccessToken(accessToken, tokenInterspectionUrl)) {
      filterChain.doFilter(request, response);
    } else {
      response.setStatus(HttpServletResponse.SC_FORBIDDEN);
      response.getWriter().write(Constants.BEEJA_AUTH_ERROR);
    }
  }

  private boolean isValidAccessToken(String accessToken, String tokenInterceptionURI) {
    String finalUrl = tokenInterceptionURI + "?access_token=" + accessToken;
    RestTemplate restTemplate = new RestTemplate();

    try {
      if (accessToken.startsWith("eyJh")) {
        return validateJWT(accessToken);
      } else {
        ResponseEntity<String> response = restTemplate.getForEntity(finalUrl, String.class);
        if (!response.getStatusCode().is2xxSuccessful()) {
          return false;
        }
        String email = getEmailFromAccessToken(response.getBody());
        String issuedClientId = getIssuedClientId(response.getBody());
        String clientId = authUrlProperties.getClientId();
        if (!clientId.equals(issuedClientId)) {
          return false;
        }
        if (!checkUserPresenceAndSetActive(email)) {
          return false;
        }
      }
      return true;
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
    return checkUserPresenceAndSetActive(email);
  }

  private boolean checkUserPresenceAndSetActive(String email) {
    ResponseEntity<LinkedHashMap<String, Object>> userIsPresent = (ResponseEntity<LinkedHashMap<String, Object>>) accountClient.getEmployeeByEmail(email);
    LinkedHashMap<String, Object> responseBody = userIsPresent.getBody();
    if (userIsPresent.getStatusCode().is2xxSuccessful() && responseBody != null) {
      Boolean userIsActive = (Boolean) responseBody.get("active");
      if (userIsActive) {
        setLoggedInUser(responseBody);
      }
      return userIsActive;
    }
    return false;
  }

  private void setLoggedInUser(LinkedHashMap<String, Object> responseBody) {
    String email = responseBody.get("email").toString();
    String firstName = responseBody.get("firstName").toString();
    String employeeId = responseBody.get("employeeId").toString();
    Map<String, Object> userOrganization = getUserOrganization(responseBody);
    Set<String> permissions = getPermissions(responseBody);
    UserContext.setLoggedInUser(email, firstName, employeeId, userOrganization, permissions);
  }

  private Map<String, Object> getUserOrganization(LinkedHashMap<String, Object> responseBody) {
    Map<String, Object> userOrganization = new HashMap<>();
    Map<String, Object> organizations = (Map<String, Object>) responseBody.get("organizations");
    if (organizations != null) {
      userOrganization.put("id", organizations.get("id"));
      userOrganization.put("name", organizations.get("name"));
      userOrganization.put("email", organizations.get("email"));
    }
    return userOrganization;
  }

  private Set<String> getPermissions(LinkedHashMap<String, Object> responseBody) {
    Set<String> permissions = new HashSet<>();
    Collection<LinkedHashMap<String, Object>> roles = (Collection<LinkedHashMap<String, Object>>) responseBody.get("roles");
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

package com.beeja.api.employeemanagement.config.filters;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.beeja.api.employeemanagement.client.AccountClient;
import com.beeja.api.employeemanagement.model.clients.accounts.OrganizationDTO;
import com.beeja.api.employeemanagement.model.clients.accounts.RoleDTO;
import com.beeja.api.employeemanagement.model.clients.accounts.UserDTO;
import com.beeja.api.employeemanagement.utils.JwtUtils;
import com.beeja.api.employeemanagement.utils.UserContext;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.*;

@Component
@Slf4j
public class AuthorizationFilter extends OncePerRequestFilter {

  @Autowired AccountClient accountClient;

  @Autowired AuthUrlProperties authUrlProperties;

  @Autowired JwtProperties jwtProperties;

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {

    if (request.getRequestURI().startsWith("/employees/actuator/")
        || request.getRequestURI().equals("/employees/api-docs/swagger-config")
        || request.getRequestURI().startsWith("/employees/swagger-ui/")
        || request.getRequestURI().startsWith("/employees/openApi.yaml")) {
      filterChain.doFilter(request, response);
      return;
    }

    String accessToken = request.getHeader("authorization");
    String tokenInterspectionUrl = authUrlProperties.getTokenUri();

    accessToken = accessToken.substring(7);
    if (isValidAccessToken(accessToken, tokenInterspectionUrl)) {
      filterChain.doFilter(request, response);
    } else {
      response.setStatus(HttpServletResponse.SC_FORBIDDEN);
      response.getWriter().write("Access Denied");
    }
  }

  private boolean isValidAccessToken(String accessToken, String tokenInterceptionURI) {
    String finalUrl = tokenInterceptionURI + "?access_token=" + accessToken;
    RestTemplate restTemplate = new RestTemplate();
    try {
      if (accessToken.startsWith("eyJhb")) {
        ObjectMapper objectMapper = new ObjectMapper();
        Claims claims = JwtUtils.decodeJWT(accessToken, jwtProperties.getSecret());
        String email = claims.get("sub").toString();
        ResponseEntity<LinkedHashMap<String, Object>> userIsPresent =
            (ResponseEntity<LinkedHashMap<String, Object>>) accountClient.getEmployeeByEmail(email);
        LinkedHashMap<String, Object> responseBodyMap = userIsPresent.getBody();
        UserDTO responseBody = objectMapper.convertValue(responseBodyMap, UserDTO.class);

        if (userIsPresent.getStatusCode().is2xxSuccessful() && responseBody != null) {
          boolean userIsActive = responseBody.isActive();
          if (userIsActive) {
            Set<RoleDTO> roles = responseBody.getRoles();
            Set<String> permissions = new HashSet<>();
            for (RoleDTO role : roles) {
              Collection<String> rolePermissions = role.getPermissions();
              if (rolePermissions != null) {
                permissions.addAll(rolePermissions);
              }
            }

            Map<String, Object> userOrganization = new HashMap<>();
            OrganizationDTO organizations = responseBody.getOrganizations();

            if (organizations != null) {
              userOrganization.put("id", organizations.getId());
              userOrganization.put("name", organizations.getName());
              userOrganization.put("email", organizations.getEmail());
            }
            UserContext.setLoggedInUser(
                responseBody.getEmail(),
                responseBody.getFirstName(),
                responseBody.getEmployeeId(),
                responseBody.getOrganizations(),
                permissions,
                responseBody,
                "Bearer " + accessToken);
          }
          return userIsActive;
        }
      }
      ResponseEntity<String> response = restTemplate.getForEntity(finalUrl, String.class);
      if (!response.getStatusCode().is2xxSuccessful()) {
        return false;
      }
      ObjectMapper objectMapper = new ObjectMapper();
      JsonNode accessTokenAttributes = objectMapper.readTree(response.getBody());
      String email = accessTokenAttributes.get("email").asText();
      String issuedClientId = accessTokenAttributes.get("azp").asText();

      String clientId = authUrlProperties.getClientId();
      if (!clientId.equals(issuedClientId)) {
        return false;
      }

      ResponseEntity<LinkedHashMap<String, Object>> userIsPresent =
          (ResponseEntity<LinkedHashMap<String, Object>>) accountClient.getEmployeeByEmail(email);
      LinkedHashMap<String, Object> responseBodyMap = userIsPresent.getBody();
      UserDTO responseBody = objectMapper.convertValue(responseBodyMap, UserDTO.class);

      if (userIsPresent.getStatusCode().is2xxSuccessful() && responseBody != null) {
        boolean userIsActive = responseBody.isActive();
        if (userIsActive) {
          Set<RoleDTO> roles = responseBody.getRoles();
          Set<String> permissions = new HashSet<>();
          for (RoleDTO role : roles) {
            Collection<String> rolePermissions = role.getPermissions();
            if (rolePermissions != null) {
              permissions.addAll(rolePermissions);
            }
          }

          Map<String, Object> userOrganization = new HashMap<>();
          OrganizationDTO organizations = responseBody.getOrganizations();

          if (organizations != null) {
            userOrganization.put("id", organizations.getId());
            userOrganization.put("name", organizations.getName());
            userOrganization.put("email", organizations.getEmail());
          }
          UserContext.setLoggedInUser(
              responseBody.getEmail(),
              responseBody.getFirstName(),
              responseBody.getEmployeeId(),
              responseBody.getOrganizations(),
              permissions,
              responseBody,
              "Bearer " + accessToken);
        }
        return userIsActive;
      }
      return false;
    } catch (HttpClientErrorException e) {
      log.error("HTTP Error: {}", e.getStatusCode());
      return false;
    } catch (Exception e) {
      log.error("Token Validation Exception: {}", e.getMessage());
      return false;
    }
  }
}

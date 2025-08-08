package com.openclassrooms.starterjwt.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.payload.request.LoginRequest;
import com.openclassrooms.starterjwt.payload.request.SignupRequest;
import com.openclassrooms.starterjwt.payload.response.JwtResponse;
import com.openclassrooms.starterjwt.payload.response.MessageResponse;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import static org.junit.jupiter.api.Assertions.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@TestPropertySource(locations = "classpath:application.properties")
public class AuthControllerIntTest {

    @Autowired
    private WebApplicationContext context;
    
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    private SignupRequest signupRequest;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {

        // Setup MockMvc with security configuration
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();

        // Setup signup request
        signupRequest = new SignupRequest();
        signupRequest.setEmail("test@test.com");
        signupRequest.setFirstName("John");
        signupRequest.setLastName("Doe");
        signupRequest.setPassword("password123");

        // Setup login request
        loginRequest = new LoginRequest();
        loginRequest.setEmail("yoga@studio.com");
        loginRequest.setPassword("test!1234");
    }

    @Test
    void testRegisterUser_Success() throws Exception {
        // Act
        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isOk())
                .andReturn();

        // Assert
        String responseContent = result.getResponse().getContentAsString();
        assertThat(responseContent).contains("User registered successfully!");

        // Verify user was saved to database
        assertTrue(userRepository.existsByEmail("test@test.com"));
        User savedUser = userRepository.findByEmail("test@test.com").orElse(null);
        assertNotNull(savedUser);
        assertEquals("John", savedUser.getFirstName());
        assertEquals("Doe", savedUser.getLastName());
        assertTrue(passwordEncoder.matches("password123", savedUser.getPassword()));
        assertFalse(savedUser.isAdmin());
    }

    @Test
    void testRegisterUser_EmailAlreadyTaken() throws Exception {
        // Arrange - Create a user with the same email
        User existingUser = new User();
        existingUser.setEmail("test@test.com");
        existingUser.setFirstName("Existing");
        existingUser.setLastName("User");
        existingUser.setPassword(passwordEncoder.encode("existingPassword"));
        existingUser.setAdmin(false);
        userRepository.save(existingUser);

        // Act
        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isBadRequest())
                .andReturn();

        // Assert
        String responseContent = result.getResponse().getContentAsString();
        assertThat(responseContent).contains("Error: Email is already taken!");

        // Verify database wasn't changed
        User unchangedUser = userRepository.findByEmail("test@test.com").orElse(null);
        assertNotNull(unchangedUser);
        assertEquals("Existing", unchangedUser.getFirstName());
    }

    @Test
    void testAuthenticateUser_Success() throws Exception {
        // Arrange - Create user for successful authentication
        User testUser = new User();
        testUser.setEmail("yoga@studio.com");
        testUser.setFirstName("Yoga");
        testUser.setLastName("Studio");
        testUser.setPassword(passwordEncoder.encode("test!1234"));
        testUser.setAdmin(false);
        userRepository.save(testUser);
        
        // Act
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        // Assert
        String responseContent = result.getResponse().getContentAsString();
        JwtResponse response = objectMapper.readValue(responseContent, JwtResponse.class);
        assertNotNull(response.getToken());
        assertEquals("Bearer", response.getType());

        assertEquals("yoga@studio.com", response.getUsername());
        assertFalse(response.getAdmin());
    }

    @Test
    void testAuthenticateUser_InvalidCredentials() throws Exception {
        // Arrange - Create a user with different password
        User user = new User();
        user.setEmail("test@test.com");
        user.setFirstName("John");
        user.setLastName("Doe");
        user.setPassword(passwordEncoder.encode("differentPassword"));
        user.setAdmin(false);
        userRepository.save(user);

        // Act & Assert - Should fail authentication
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testAuthenticateUser_UserNotFound() throws Exception {
        // Act & Assert - No user in database
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized());
    }
}

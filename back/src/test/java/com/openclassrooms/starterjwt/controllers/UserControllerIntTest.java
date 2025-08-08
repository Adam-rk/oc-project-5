package com.openclassrooms.starterjwt.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;

import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@TestPropertySource(locations = "classpath:application.properties")
public class UserControllerIntTest {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testUser;
    private User otherUser;

    @BeforeEach
    void setUp() {
        // Setup MockMvc with security configuration
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();

        // Create a test user
        testUser = new User();
        testUser.setEmail("test@test.com");
        testUser.setFirstName("John");
        testUser.setLastName("Doe");
        testUser.setPassword(passwordEncoder.encode("password123"));
        testUser.setAdmin(false);
        testUser = userRepository.save(testUser);

        // Create another user for unauthorized test
        otherUser = new User();
        otherUser.setEmail("other@test.com");
        otherUser.setFirstName("Jane");
        otherUser.setLastName("Smith");
        otherUser.setPassword(passwordEncoder.encode("password123"));
        otherUser.setAdmin(false);
        otherUser = userRepository.save(otherUser);
    }

    @Test
    @WithMockUser
    void testFindById_Success() throws Exception {
        // Act
        MvcResult result = mockMvc.perform(get("/api/user/{id}", testUser.getId()))
                .andExpect(status().isOk())
                .andReturn();

        // Assert
        String responseContent = result.getResponse().getContentAsString();
        assertThat(responseContent).contains(testUser.getEmail());
        assertThat(responseContent).contains(testUser.getFirstName());
        assertThat(responseContent).contains(testUser.getLastName());
    }

    @Test
    @WithMockUser
    void testFindById_NotFound() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/user/{id}", 999L))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void testFindById_BadRequest() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/user/{id}", "invalid-id"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "test@test.com")
    void testDelete_Success() throws Exception {
        // Act
        mockMvc.perform(delete("/api/user/{id}", testUser.getId()))
                .andExpect(status().isOk());

        // Assert - Verify user was deleted from database
        assertFalse(userRepository.existsById(testUser.getId()));
    }

    @Test
    @WithMockUser(username = "test@test.com")
    void testDelete_NotFound() throws Exception {
        // Act & Assert
        mockMvc.perform(delete("/api/user/{id}", 999L))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "test@test.com")
    void testDelete_BadRequest() throws Exception {
        // Act & Assert
        mockMvc.perform(delete("/api/user/{id}", "invalid-id"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "test@test.com")
    void testDelete_Unauthorized() throws Exception {
        // Act & Assert - Try to delete another user
        mockMvc.perform(delete("/api/user/{id}", otherUser.getId()))
                .andExpect(status().isUnauthorized());
    }
}

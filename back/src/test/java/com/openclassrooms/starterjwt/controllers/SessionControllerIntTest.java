package com.openclassrooms.starterjwt.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.starterjwt.dto.SessionDto;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import com.openclassrooms.starterjwt.services.SessionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@TestPropertySource(locations = "classpath:application.properties")
public class SessionControllerIntTest {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Session testSession;
    private Teacher testTeacher;
    private User testUser;
    private SessionDto sessionDto;

    @BeforeEach
    void setUp() {
        // Setup MockMvc with security configuration
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();

        // Create a test teacher
        testTeacher = new Teacher();
        testTeacher.setFirstName("Yoga");
        testTeacher.setLastName("Teacher");
        testTeacher = teacherRepository.save(testTeacher);

        // Create a test user
        testUser = new User();
        testUser.setEmail("test@test.com");
        testUser.setFirstName("John");
        testUser.setLastName("Doe");
        testUser.setPassword(passwordEncoder.encode("password123"));
        testUser.setAdmin(false);
        testUser = userRepository.save(testUser);

        // Create a test session
        testSession = new Session();
        testSession.setName("Test Yoga Session");
        testSession.setDate(new Date());
        testSession.setDescription("A test yoga session for integration testing");
        testSession.setTeacher(testTeacher);
        testSession.setUsers(new ArrayList<>());
        testSession = sessionRepository.save(testSession);

        // Create session DTO for testing
        sessionDto = new SessionDto();
        sessionDto.setName("New Yoga Session");
        sessionDto.setDate(new Date());
        sessionDto.setDescription("A new yoga session for testing");
        sessionDto.setTeacher_id(testTeacher.getId());
        sessionDto.setUsers(new ArrayList<>());
    }

    @Test
    @WithMockUser
    void testFindById_Success() throws Exception {
        // Act
        MvcResult result = mockMvc.perform(get("/api/session/{id}", testSession.getId()))
                .andExpect(status().isOk())
                .andReturn();

        // Assert
        String responseContent = result.getResponse().getContentAsString();
        assertThat(responseContent).contains(testSession.getName());
        assertThat(responseContent).contains(testSession.getDescription());
    }

    @Test
    @WithMockUser
    void testFindById_NotFound() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/session/{id}", 999L))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void testFindById_BadRequest() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/session/{id}", "invalid-id"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void testFindAll() throws Exception {
        // Act
        MvcResult result = mockMvc.perform(get("/api/session"))
                .andExpect(status().isOk())
                .andReturn();

        // Assert
        String responseContent = result.getResponse().getContentAsString();
        assertThat(responseContent).contains(testSession.getName());
    }

    @Test
    @WithMockUser
    void testCreate() throws Exception {
        // Act
        MvcResult result = mockMvc.perform(post("/api/session")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(sessionDto)))
                .andExpect(status().isOk())
                .andReturn();

        // Assert
        String responseContent = result.getResponse().getContentAsString();
        assertThat(responseContent).contains(sessionDto.getName());
        assertThat(responseContent).contains(sessionDto.getDescription());

        // Verify session was saved to database
        List<Session> sessions = sessionRepository.findAll();
        assertTrue(sessions.stream().anyMatch(s -> s.getName().equals(sessionDto.getName())));
    }

    @Test
    @WithMockUser
    void testUpdate_Success() throws Exception {
        // Arrange
        sessionDto.setName("Updated Session Name");
        sessionDto.setDescription("Updated session description");

        // Act
        MvcResult result = mockMvc.perform(put("/api/session/{id}", testSession.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(sessionDto)))
                .andExpect(status().isOk())
                .andReturn();

        // Assert
        String responseContent = result.getResponse().getContentAsString();
        assertThat(responseContent).contains("Updated Session Name");
        assertThat(responseContent).contains("Updated session description");

        // Verify session was updated in database
        Session updatedSession = sessionRepository.findById(testSession.getId()).orElse(null);
        assertNotNull(updatedSession);
        assertEquals("Updated Session Name", updatedSession.getName());
        assertEquals("Updated session description", updatedSession.getDescription());
    }

    @Test
    @WithMockUser
    void testUpdate_BadRequest() throws Exception {
        // Act & Assert
        mockMvc.perform(put("/api/session/{id}", "invalid-id")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(sessionDto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void testDelete_Success() throws Exception {
        // Act
        mockMvc.perform(delete("/api/session/{id}", testSession.getId()))
                .andExpect(status().isOk());

        // Assert - Verify session was deleted from database
        assertFalse(sessionRepository.existsById(testSession.getId()));
    }

    @Test
    @WithMockUser
    void testDelete_NotFound() throws Exception {
        // Act & Assert
        mockMvc.perform(delete("/api/session/{id}", 999L))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void testDelete_BadRequest() throws Exception {
        // Act & Assert
        mockMvc.perform(delete("/api/session/{id}", "invalid-id"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void testParticipate_Success() throws Exception {
        // Act
        mockMvc.perform(post("/api/session/{id}/participate/{userId}", testSession.getId(), testUser.getId()))
                .andExpect(status().isOk());

        // Assert - Verify user was added to session participants
        Session updatedSession = sessionRepository.findById(testSession.getId()).orElse(null);
        assertNotNull(updatedSession);
        assertTrue(updatedSession.getUsers().stream().anyMatch(u -> u.getId().equals(testUser.getId())));
    }

    @Test
    @WithMockUser
    void testParticipate_BadRequest() throws Exception {
        // Act & Assert - Invalid session ID
        mockMvc.perform(post("/api/session/{id}/participate/{userId}", "invalid-id", testUser.getId()))
                .andExpect(status().isBadRequest());

        // Act & Assert - Invalid user ID
        mockMvc.perform(post("/api/session/{id}/participate/{userId}", testSession.getId(), "invalid-id"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void testParticipate_AlreadyParticipating() throws Exception {
        // Arrange - Add user to session first
        mockMvc.perform(post("/api/session/{id}/participate/{userId}", testSession.getId(), testUser.getId()))
                .andExpect(status().isOk());

        // Act & Assert - Try to add again
        mockMvc.perform(post("/api/session/{id}/participate/{userId}", testSession.getId(), testUser.getId()))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void testNoLongerParticipate_Success() throws Exception {
        // Arrange - Add user to session first
        mockMvc.perform(post("/api/session/{id}/participate/{userId}", testSession.getId(), testUser.getId()))
                .andExpect(status().isOk());

        // Act
        mockMvc.perform(delete("/api/session/{id}/participate/{userId}", testSession.getId(), testUser.getId()))
                .andExpect(status().isOk());

        // Assert - Verify user was removed from session participants
        Session updatedSession = sessionRepository.findById(testSession.getId()).orElse(null);
        assertNotNull(updatedSession);
        assertFalse(updatedSession.getUsers().stream().anyMatch(u -> u.getId().equals(testUser.getId())));
    }

    @Test
    @WithMockUser
    void testNoLongerParticipate_BadRequest() throws Exception {
        // Act & Assert - Invalid session ID
        mockMvc.perform(delete("/api/session/{id}/participate/{userId}", "invalid-id", testUser.getId()))
                .andExpect(status().isBadRequest());

        // Act & Assert - Invalid user ID
        mockMvc.perform(delete("/api/session/{id}/participate/{userId}", testSession.getId(), "invalid-id"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void testNoLongerParticipate_NotParticipating() throws Exception {
        // Act & Assert - User not participating
        mockMvc.perform(delete("/api/session/{id}/participate/{userId}", testSession.getId(), testUser.getId()))
                .andExpect(status().isBadRequest());
    }
}

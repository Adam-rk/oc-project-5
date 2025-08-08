package com.openclassrooms.starterjwt.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@TestPropertySource(locations = "classpath:application.properties")
public class TeacherControllerIntTest {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TeacherRepository teacherRepository;

    private Teacher testTeacher;

    @BeforeEach
    void setUp() {
        // Setup MockMvc with security configuration
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();

        // Create a test teacher
        testTeacher = new Teacher();
        testTeacher.setFirstName("John");
        testTeacher.setLastName("Doe");
        testTeacher = teacherRepository.save(testTeacher);
    }

    @Test
    @WithMockUser
    void testFindById_Success() throws Exception {
        // Act
        MvcResult result = mockMvc.perform(get("/api/teacher/{id}", testTeacher.getId()))
                .andExpect(status().isOk())
                .andReturn();

        // Assert
        String responseContent = result.getResponse().getContentAsString();
        assertThat(responseContent).contains(testTeacher.getFirstName());
        assertThat(responseContent).contains(testTeacher.getLastName());
    }

    @Test
    @WithMockUser
    void testFindById_NotFound() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/teacher/{id}", 999L))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void testFindById_BadRequest() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/teacher/{id}", "invalid-id"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void testFindAll() throws Exception {
        // Create another teacher to ensure we have multiple in the list
        Teacher anotherTeacher = new Teacher();
        anotherTeacher.setFirstName("Jane");
        anotherTeacher.setLastName("Smith");
        teacherRepository.save(anotherTeacher);

        // Act
        MvcResult result = mockMvc.perform(get("/api/teacher"))
                .andExpect(status().isOk())
                .andReturn();

        // Assert
        String responseContent = result.getResponse().getContentAsString();
        assertThat(responseContent).contains(testTeacher.getFirstName());
        assertThat(responseContent).contains(testTeacher.getLastName());
        assertThat(responseContent).contains(anotherTeacher.getFirstName());
        assertThat(responseContent).contains(anotherTeacher.getLastName());
    }
}

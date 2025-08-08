package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.dto.TeacherDto;
import com.openclassrooms.starterjwt.mapper.TeacherMapper;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.services.TeacherService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TeacherControllerUnitTest {

    @Mock
    private TeacherService teacherService;

    @Mock
    private TeacherMapper teacherMapper;

    @InjectMocks
    private TeacherController teacherController;

    private Teacher teacher1;
    private Teacher teacher2;
    private TeacherDto teacherDto1;
    private TeacherDto teacherDto2;
    private List<Teacher> teacherList;
    private List<TeacherDto> teacherDtoList;

    @BeforeEach
    void setUp() {
        // Set up test data
        teacher1 = Teacher.builder()
                .id(1L)
                .firstName("John")
                .lastName("Doe")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        teacher2 = Teacher.builder()
                .id(2L)
                .firstName("Jane")
                .lastName("Smith")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        teacherDto1 = new TeacherDto();
        teacherDto1.setId(1L);
        teacherDto1.setFirstName("John");
        teacherDto1.setLastName("Doe");
        teacherDto1.setCreatedAt(LocalDateTime.now());
        teacherDto1.setUpdatedAt(LocalDateTime.now());

        teacherDto2 = new TeacherDto();
        teacherDto2.setId(2L);
        teacherDto2.setFirstName("Jane");
        teacherDto2.setLastName("Smith");
        teacherDto2.setCreatedAt(LocalDateTime.now());
        teacherDto2.setUpdatedAt(LocalDateTime.now());

        teacherList = Arrays.asList(teacher1, teacher2);
        teacherDtoList = Arrays.asList(teacherDto1, teacherDto2);
    }

    @Test
    void testFindById_Success() {
        // Arrange
        when(teacherService.findById(1L)).thenReturn(teacher1);
        when(teacherMapper.toDto(teacher1)).thenReturn(teacherDto1);

        // Act
        ResponseEntity<?> response = teacherController.findById("1");

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(teacherDto1, response.getBody());
        verify(teacherService).findById(1L);
        verify(teacherMapper).toDto(teacher1);
    }

    @Test
    void testFindById_NotFound() {
        // Arrange
        when(teacherService.findById(999L)).thenReturn(null);

        // Act
        ResponseEntity<?> response = teacherController.findById("999");

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNull(response.getBody());
        verify(teacherService).findById(999L);
        verify(teacherMapper, never()).toDto(any(Teacher.class));
    }

    @Test
    void testFindById_BadRequest() {
        // Act
        ResponseEntity<?> response = teacherController.findById("invalid-id");

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNull(response.getBody());
        verify(teacherService, never()).findById(anyLong());
        verify(teacherMapper, never()).toDto(any(Teacher.class));
    }

    @Test
    void testFindAll_Success() {
        // Arrange
        when(teacherService.findAll()).thenReturn(teacherList);
        when(teacherMapper.toDto(teacherList)).thenReturn(teacherDtoList);

        // Act
        ResponseEntity<?> response = teacherController.findAll();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(teacherDtoList, response.getBody());
        verify(teacherService).findAll();
        verify(teacherMapper).toDto(teacherList);
    }

    @Test
    void testFindAll_EmptyList() {
        // Arrange
        List<Teacher> emptyList = new ArrayList<>();
        List<TeacherDto> emptyDtoList = new ArrayList<>();
        
        when(teacherService.findAll()).thenReturn(emptyList);
        when(teacherMapper.toDto(emptyList)).thenReturn(emptyDtoList);

        // Act
        ResponseEntity<?> response = teacherController.findAll();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(emptyDtoList, response.getBody());
        verify(teacherService).findAll();
        verify(teacherMapper).toDto(emptyList);
    }
}

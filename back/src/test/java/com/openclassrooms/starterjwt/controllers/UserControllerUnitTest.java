package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.dto.UserDto;
import com.openclassrooms.starterjwt.mapper.UserMapper;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.services.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserControllerUnitTest {

    @Mock
    private UserService userService;

    @Mock
    private UserMapper userMapper;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @Mock
    private UserDetails userDetails;

    @InjectMocks
    private UserController userController;

    private User user;
    private UserDto userDto;

    @BeforeEach
    void setUp() {
        // Set up test data
        user = new User();
        user.setId(1L);
        user.setEmail("test@test.com");
        user.setFirstName("John");
        user.setLastName("Doe");
        user.setPassword("password123");
        user.setAdmin(false);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        userDto = new UserDto();
        userDto.setId(1L);
        userDto.setEmail("test@test.com");
        userDto.setFirstName("John");
        userDto.setLastName("Doe");
        userDto.setAdmin(false);
        userDto.setCreatedAt(LocalDateTime.now());
        userDto.setUpdatedAt(LocalDateTime.now());
    }

    @Test
    void testFindById_Success() {
        // Arrange
        when(userService.findById(1L)).thenReturn(user);
        when(userMapper.toDto(user)).thenReturn(userDto);

        // Act
        ResponseEntity<?> response = userController.findById("1");

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(userDto, response.getBody());
        verify(userService).findById(1L);
        verify(userMapper).toDto(user);
    }

    @Test
    void testFindById_NotFound() {
        // Arrange
        when(userService.findById(999L)).thenReturn(null);

        // Act
        ResponseEntity<?> response = userController.findById("999");

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNull(response.getBody());
        verify(userService).findById(999L);
        verify(userMapper, never()).toDto(any(User.class));
    }

    @Test
    void testFindById_BadRequest() {
        // Act
        ResponseEntity<?> response = userController.findById("invalid-id");

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNull(response.getBody());
        verify(userService, never()).findById(anyLong());
        verify(userMapper, never()).toDto(any(User.class));
    }

    @Test
    void testSave_Success() {
        // Arrange
        when(userService.findById(1L)).thenReturn(user);
        when(userDetails.getUsername()).thenReturn("test@test.com");
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        // Act
        ResponseEntity<?> response = userController.save("1");

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(userService).findById(1L);
        verify(userService).delete(1L);
    }

    @Test
    void testSave_NotFound() {
        // Arrange
        when(userService.findById(999L)).thenReturn(null);

        // Act
        ResponseEntity<?> response = userController.save("999");

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(userService).findById(999L);
        verify(userService, never()).delete(anyLong());
    }

    @Test
    void testSave_BadRequest() {
        // Act
        ResponseEntity<?> response = userController.save("invalid-id");

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verify(userService, never()).findById(anyLong());
        verify(userService, never()).delete(anyLong());
    }

    @Test
    void testSave_Unauthorized() {
        // Arrange
        when(userService.findById(1L)).thenReturn(user);
        when(userDetails.getUsername()).thenReturn("different@test.com"); // Different email
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        // Act
        ResponseEntity<?> response = userController.save("1");

        // Assert
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        verify(userService).findById(1L);
        verify(userService, never()).delete(anyLong());
    }
}

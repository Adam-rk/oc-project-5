package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.exception.BadRequestException;
import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SessionServiceTest {

    @Mock
    private SessionRepository sessionRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private SessionService sessionService;

    private Session session;
    private User user;

    @BeforeEach
    void setUp() {
        // Initialize test data
        session = new Session();
        session.setId(1L);
        session.setName("Test Session");
        session.setDescription("Test Description");
        session.setUsers(new ArrayList<>());

        user = new User();
        user.setId(1L);
        user.setEmail("test@test.com");
    }

    @Test
    void testCreate() {
        // Arrange
        when(sessionRepository.save(any(Session.class))).thenReturn(session);

        // Act
        Session result = sessionService.create(session);

        // Assert
        assertNotNull(result);
        assertEquals(session.getId(), result.getId());
        assertEquals(session.getName(), result.getName());
        verify(sessionRepository, times(1)).save(session);
    }

    @Test
    void testDelete() {
        // Act
        sessionService.delete(1L);

        // Assert
        verify(sessionRepository, times(1)).deleteById(1L);
    }

    @Test
    void testFindAll() {
        // Arrange
        List<Session> sessions = Arrays.asList(session);
        when(sessionRepository.findAll()).thenReturn(sessions);

        // Act
        List<Session> result = sessionService.findAll();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(session.getId(), result.get(0).getId());
        verify(sessionRepository, times(1)).findAll();
    }

    @Test
    void testGetById_ExistingId() {
        // Arrange
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));

        // Act
        Session result = sessionService.getById(1L);

        // Assert
        assertNotNull(result);
        assertEquals(session.getId(), result.getId());
        verify(sessionRepository, times(1)).findById(1L);
    }

    @Test
    void testGetById_NonExistingId() {
        // Arrange
        when(sessionRepository.findById(99L)).thenReturn(Optional.empty());

        // Act
        Session result = sessionService.getById(99L);

        // Assert
        assertNull(result);
        verify(sessionRepository, times(1)).findById(99L);
    }

    @Test
    void testUpdate() {
        // Arrange
        Session updatedSession = new Session();
        updatedSession.setName("Updated Session");
        updatedSession.setDescription("Updated Description");
        
        when(sessionRepository.save(any(Session.class))).thenReturn(updatedSession);

        // Act
        Session result = sessionService.update(1L, updatedSession);

        // Assert
        assertNotNull(result);
        assertEquals(updatedSession.getName(), result.getName());
        assertEquals(updatedSession.getDescription(), result.getDescription());
        assertEquals(1L, updatedSession.getId());
        verify(sessionRepository, times(1)).save(updatedSession);
    }

    @Test
    void testParticipate_Success() {
        // Arrange
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        // Act
        sessionService.participate(1L, 1L);

        // Assert
        verify(sessionRepository, times(1)).findById(1L);
        verify(userRepository, times(1)).findById(1L);
        verify(sessionRepository, times(1)).save(session);
        assertTrue(session.getUsers().contains(user));
    }

    @Test
    void testParticipate_SessionNotFound() {
        // Arrange
        when(sessionRepository.findById(99L)).thenReturn(Optional.empty());
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        // Act & Assert
        assertThrows(NotFoundException.class, () -> sessionService.participate(99L, 1L));
        verify(sessionRepository, times(1)).findById(99L);
        verify(userRepository, times(1)).findById(1L);
        verify(sessionRepository, never()).save(any());
    }

    @Test
    void testParticipate_UserNotFound() {
        // Arrange
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(NotFoundException.class, () -> sessionService.participate(1L, 99L));
        verify(sessionRepository, times(1)).findById(1L);
        verify(userRepository, times(1)).findById(99L);
        verify(sessionRepository, never()).save(any());
    }

    @Test
    void testParticipate_AlreadyParticipating() {
        // Arrange
        session.getUsers().add(user);
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        // Act & Assert
        assertThrows(BadRequestException.class, () -> sessionService.participate(1L, 1L));
        verify(sessionRepository, times(1)).findById(1L);
        verify(userRepository, times(1)).findById(1L);
        verify(sessionRepository, never()).save(any());
    }

    @Test
    void testNoLongerParticipate_Success() {
        // Arrange
        session.getUsers().add(user);
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));

        // Act
        sessionService.noLongerParticipate(1L, 1L);

        // Assert
        verify(sessionRepository, times(1)).findById(1L);
        verify(sessionRepository, times(1)).save(session);
        assertFalse(session.getUsers().contains(user));
    }

    @Test
    void testNoLongerParticipate_SessionNotFound() {
        // Arrange
        when(sessionRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(NotFoundException.class, () -> sessionService.noLongerParticipate(99L, 1L));
        verify(sessionRepository, times(1)).findById(99L);
        verify(sessionRepository, never()).save(any());
    }

    @Test
    void testNoLongerParticipate_NotParticipating() {
        // Arrange
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));

        // Act & Assert
        assertThrows(BadRequestException.class, () -> sessionService.noLongerParticipate(1L, 1L));
        verify(sessionRepository, times(1)).findById(1L);
        verify(sessionRepository, never()).save(any());
    }
}

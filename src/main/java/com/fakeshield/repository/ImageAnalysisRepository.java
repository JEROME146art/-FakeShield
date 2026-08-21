package com.fakeshield.repository;

import com.fakeshield.model.ImageAnalysis;
import com.fakeshield.model.NewsStatus;
import com.fakeshield.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImageAnalysisRepository extends JpaRepository<ImageAnalysis, Long> {

    List<ImageAnalysis> findAllByOrderByIdDesc();

    Long countByStatus(NewsStatus status);

    List<ImageAnalysis> findByUserOrderByIdDesc(User user);

    Long countByUser(User user);

    Long countByUserAndStatus(User user, NewsStatus status);

    // Navigates user.id automatically without raw @Query strings
    List<ImageAnalysis> findByUserIdOrderByIdDesc(Long userId);

    Long countByUserId(Long userId);

    Long countByUserIdAndStatus(Long userId, NewsStatus status);
}
package com.fakeshield.repository;

import com.fakeshield.model.ImageAnalysis;
import com.fakeshield.model.NewsStatus;
import com.fakeshield.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImageAnalysisRepository extends JpaRepository<ImageAnalysis, Long> {

    @Query("SELECT i FROM ImageAnalysis i ORDER BY i.id DESC")
    List<ImageAnalysis> findLatestImages();

    Long countByStatus(NewsStatus status);

    // User history
    List<ImageAnalysis> findByUserOrderByIdDesc(User user);

    Long countByUser(User user);

    Long countByUserAndStatus(User user, NewsStatus status);

    // Safer alternatives by userId (if needed)
    @Query("SELECT i FROM ImageAnalysis i WHERE i.user.id = :userId ORDER BY i.id DESC")
    List<ImageAnalysis> findByUserIdOrderByIdDesc(@Param("userId") Long userId);

    @Query("SELECT COUNT(i) FROM ImageAnalysis i WHERE i.user.id = :userId")
    Long countByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(i) FROM ImageAnalysis i WHERE i.user.id = :userId AND i.status = :status")
    Long countByUserIdAndStatus(@Param("userId") Long userId, @Param("status") NewsStatus status);
}
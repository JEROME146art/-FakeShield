package com.fakeshield.repository;

import com.fakeshield.model.ImageAnalysis;
import com.fakeshield.model.NewsStatus;
import com.fakeshield.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImageAnalysisRepository extends JpaRepository<ImageAnalysis, Long> {

    @Query("SELECT i FROM ImageAnalysis i ORDER BY i.id DESC")
    List<ImageAnalysis> findLatestImages();

    Long countByStatus(NewsStatus status);

    // ✅ NEW: Find analyses by user
    List<ImageAnalysis> findByUserOrderByIdDesc(User user);

    // ✅ NEW: Count analyses by user
    Long countByUser(User user);

    // ✅ NEW: Count user's analyses by status
    Long countByUserAndStatus(User user, NewsStatus status);
}
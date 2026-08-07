package com.fakeshield.repository;

import com.fakeshield.model.ImageAnalysis;
import com.fakeshield.model.NewsStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImageAnalysisRepository extends JpaRepository<ImageAnalysis, Long> {

    List<ImageAnalysis> findByStatus(NewsStatus status);

    long countByStatus(NewsStatus status);

    @Query("SELECT i FROM ImageAnalysis i ORDER BY i.uploadedAt DESC")
    List<ImageAnalysis> findLatestImages();

    @Query("SELECT i FROM ImageAnalysis i WHERE i.credibilityScore < :threshold")
    List<ImageAnalysis> findLowCredibilityImages(double threshold);
}
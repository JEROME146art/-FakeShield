package com.fakeshield.repository;

import com.fakeshield.model.News;
import com.fakeshield.model.NewsStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NewsRepository extends JpaRepository<News, Long> {

    // Find by status
    List<News> findByStatus(NewsStatus status);

    // Count by status
    long countByStatus(NewsStatus status);

    // Find by platform
    List<News> findByPlatform(String platform);

    // Find latest news sorted by date
    @Query("SELECT n FROM News n ORDER BY n.submittedAt DESC")
    List<News> findLatestNews();

    // Search by keyword in title or content
    @Query("SELECT n FROM News n WHERE " +
            "LOWER(n.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(n.content) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<News> searchByKeyword(String keyword);

    // Find low credibility news
    @Query("SELECT n FROM News n WHERE n.credibilityScore < :threshold " +
            "ORDER BY n.credibilityScore ASC")
    List<News> findLowCredibilityNews(double threshold);
}
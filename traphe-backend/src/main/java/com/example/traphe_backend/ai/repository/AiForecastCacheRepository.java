package com.example.traphe_backend.ai.repository;

import com.example.traphe_backend.ai.entity.AiForecastCache;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface AiForecastCacheRepository extends JpaRepository<AiForecastCache, UUID> {

    /** Lấy toàn bộ dự báo của 1 chi nhánh trong 1 khoảng ngày */
    List<AiForecastCache> findByBranchIdAndForecastDateBetweenOrderByForecastDate(
            UUID branchId, LocalDate from, LocalDate to);

    /** Lấy dự báo hôm nay cho tất cả chi nhánh (branchId = null) */
    List<AiForecastCache> findByForecastDateBetweenOrderByIngredientNameAsc(
            LocalDate from, LocalDate to);

    /** Xoá cache cũ trước khi rebuild */
    @Modifying
    @Query("DELETE FROM AiForecastCache c WHERE c.branchId = :branchId AND c.forecastDate BETWEEN :from AND :to")
    void deleteByBranchIdAndForecastDateBetween(@Param("branchId") UUID branchId, @Param("from") LocalDate from, @Param("to") LocalDate to);

    @Modifying
    @Query("DELETE FROM AiForecastCache c WHERE c.forecastDate BETWEEN :from AND :to")
    void deleteByForecastDateBetween(@Param("from") LocalDate from, @Param("to") LocalDate to);
}

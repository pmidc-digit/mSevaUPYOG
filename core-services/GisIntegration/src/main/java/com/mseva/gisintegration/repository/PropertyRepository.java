
package com.mseva.gisintegration.repository;

import com.mseva.gisintegration.model.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Integer> {

    @Query("SELECT p FROM Property p WHERE p.propertyid = :propertyid AND p.tenantid = :tenantid")
    java.util.List<Property> findByPropertyid(@Param("propertyid") String propertyid, @Param("tenantid") String tenantid);

    @Query("SELECT p FROM Property p WHERE p.propertyid = :propertyid")
    java.util.List<Property> findAllByPropertyid(String propertyid);

    @Query("SELECT p FROM Property p WHERE p.surveyid = :surveyid AND p.tenantid = :tenantid")
    java.util.List<Property> findBySurveyid(@Param("surveyid") String surveyid, @Param("tenantid") String tenantid);

    @Query("SELECT p FROM Property p WHERE p.surveyid = :surveyid AND p.propertyid = :propertyid AND p.tenantid = :tenantid")
    java.util.List<Property> findBySurveyidAndPropertyid(@Param("surveyid") String surveyid, @Param("propertyid") String propertyid, @Param("tenantid") String tenantid);
}

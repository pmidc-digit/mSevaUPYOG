package com.mseva.gisintegration.service;

import com.mseva.gisintegration.model.WaterTax;
import com.mseva.gisintegration.repository.WaterTaxRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class WaterTaxService {

    private static final Logger logger = LoggerFactory.getLogger(WaterTaxService.class);

    @Autowired
    private WaterTaxRepository waterTaxRepository;

    public WaterTax insertWaterTax(WaterTax waterTax) {
        logger.info("Inserting WaterTax: {}", waterTax);
        return waterTaxRepository.save(waterTax);
    }

    public List<WaterTax> findByPropertyid(String propertyid) {
        return waterTaxRepository.findByPropertyid(propertyid);
    }

    public List<WaterTax> findBySurveyid(String surveyid) {
        return waterTaxRepository.findBySurveyid(surveyid);
    }

    public List<WaterTax> findBySurveyidAndPropertyid(String surveyid, String propertyid) {
        return waterTaxRepository.findBySurveyidAndPropertyid(surveyid, propertyid);
    }

    public List<WaterTax> findByConnectionno(String connectionno) {
        return waterTaxRepository.findByConnectionno(connectionno);
    }

    public Map<String, Object> createOrUpdateWaterTax(WaterTax waterTax) {
        Map<String, Object> response = new HashMap<>();
        Map<String, String> responseInfo = new HashMap<>();
        responseInfo.put("status", "successful");

        List<WaterTax> existingWaterTaxes = null;
        if (waterTax.getConnectionno() != null && !waterTax.getConnectionno().isEmpty()) {
            existingWaterTaxes = waterTaxRepository.findByConnectionno(waterTax.getConnectionno());
        }

        if (existingWaterTaxes == null || existingWaterTaxes.isEmpty()) {
            long now = System.currentTimeMillis();
            waterTax.setCreatedtime(now);
            waterTax.setLastmodifiedtime(now);
           System.out.println(waterTax.toString());
            WaterTax savedWaterTax = insertWaterTax(waterTax);
            responseInfo.put("method", "create");
            response.put("ResponseInfo", responseInfo);
            response.put("WaterTax", savedWaterTax);
            return response;
        } else {
            boolean createNew = false;
            boolean yearExists = false;
            for (WaterTax existingWaterTax : existingWaterTaxes) {
                if (waterTax.getAssessmentyear() != null && waterTax.getAssessmentyear().equals(existingWaterTax.getAssessmentyear())) {
                    yearExists = true;
                    break;
                }
            }
            if (!yearExists) {
                createNew = true;
            }
            if (createNew) {
                long now = System.currentTimeMillis();
                waterTax.setCreatedtime(now);
                waterTax.setLastmodifiedtime(now);
                WaterTax savedWaterTax = insertWaterTax(waterTax);
                responseInfo.put("method", "create");
                response.put("ResponseInfo", responseInfo);
                response.put("WaterTax", savedWaterTax);
                return response;
            } else {
                for (WaterTax existingWaterTax : existingWaterTaxes) {
                    if (waterTax.getAssessmentyear() != null && waterTax.getAssessmentyear().equals(existingWaterTax.getAssessmentyear())) {
            if (waterTax.getTenantid() != null)
                existingWaterTax.setTenantid(waterTax.getTenantid());
            if (waterTax.getPropertyid() != null)
                existingWaterTax.setPropertyid(waterTax.getPropertyid());
            if (waterTax.getSurveyid() != null)
                existingWaterTax.setSurveyid(waterTax.getSurveyid());
            if (waterTax.getOldpropertyid() != null)
                existingWaterTax.setOldpropertyid(waterTax.getOldpropertyid());
            if (waterTax.getPropertytype() != null)
                existingWaterTax.setPropertytype(waterTax.getPropertytype());
            if (waterTax.getOwnershipcategory() != null)
                existingWaterTax.setOwnershipcategory(waterTax.getOwnershipcategory());
            if (waterTax.getPropertyusagetype() != null)
                existingWaterTax.setPropertyusagetype(waterTax.getPropertyusagetype());
            if (waterTax.getNooffloors() != null)
                existingWaterTax.setNooffloors(waterTax.getNooffloors());
            if (waterTax.getPlotsize() != null)
                existingWaterTax.setPlotsize(waterTax.getPlotsize());
            if (waterTax.getSuperbuilduparea() != null)
                existingWaterTax.setSuperbuilduparea(waterTax.getSuperbuilduparea());
            if (waterTax.getAddress() != null)
                existingWaterTax.setAddress(waterTax.getAddress());
            if (waterTax.getLocalityname() != null)
                existingWaterTax.setLocalityname(waterTax.getLocalityname());
            if (waterTax.getBlockname() != null)
                existingWaterTax.setBlockname(waterTax.getBlockname());
            if (waterTax.getAssessmentyear() != null)
                existingWaterTax.setAssessmentyear(waterTax.getAssessmentyear());
            if (waterTax.getBillamount() != null)
                existingWaterTax.setBillamount(waterTax.getBillamount());
            if (waterTax.getAmountpaid() != null)
                existingWaterTax.setAmountpaid(waterTax.getAmountpaid());
                        long now = System.currentTimeMillis();
                        existingWaterTax.setLastmodifiedtime(now);
                        WaterTax savedWaterTax = insertWaterTax(existingWaterTax);
                        responseInfo.put("method", "update");
                        response.put("ResponseInfo", responseInfo);
                        response.put("WaterTax", savedWaterTax);
                        return response;
                    }
                }
                long now = System.currentTimeMillis();
                WaterTax savedWaterTax = insertWaterTax(waterTax);
                responseInfo.put("method", "create");
                response.put("ResponseInfo", responseInfo);
                response.put("WaterTax", savedWaterTax);
                return response;
            }
        }
    }
}

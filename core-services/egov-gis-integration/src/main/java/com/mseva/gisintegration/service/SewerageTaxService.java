package com.mseva.gisintegration.service;

import com.mseva.gisintegration.model.SewerageTax;
import com.mseva.gisintegration.repository.SewerageTaxRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.HashMap;
import java.util.Map;

@Service
public class SewerageTaxService {

    @Autowired
    private SewerageTaxRepository sewerageTaxRepository;

    public SewerageTax insertSewerageTax(SewerageTax sewerageTax) {
        return sewerageTaxRepository.save(sewerageTax);
    }

    public List<SewerageTax> findByPropertyid(String propertyid) {
        return sewerageTaxRepository.findByPropertyid(propertyid);
    }

    public List<SewerageTax> findBySurveyid(String surveyid) {
        return sewerageTaxRepository.findBySurveyid(surveyid);
    }

    public List<SewerageTax> findBySurveyidAndPropertyid(String surveyid, String propertyid) {
        return sewerageTaxRepository.findBySurveyidAndPropertyid(surveyid, propertyid);
    }

    public List<SewerageTax> findByConnectionno(String connectionno) {
        return sewerageTaxRepository.findByConnectionno(connectionno);
    }

    public Map<String, Object> createOrUpdateSewerageTax(SewerageTax sewerageTax) {
        Map<String, Object> response = new HashMap<>();
        Map<String, String> responseInfo = new HashMap<>();
        responseInfo.put("status", "successful");

        List<SewerageTax> existingSewerageTaxes = null;
        if (sewerageTax.getConnectionno() != null && !sewerageTax.getConnectionno().isEmpty()) {
            existingSewerageTaxes = sewerageTaxRepository.findByConnectionno(sewerageTax.getConnectionno());
        }

        if (existingSewerageTaxes == null || existingSewerageTaxes.isEmpty()) {
            long now = System.currentTimeMillis();
            sewerageTax.setCreatedtime(now);
            sewerageTax.setLastmodifiedtime(now);
            SewerageTax savedSewerageTax = insertSewerageTax(sewerageTax);
            responseInfo.put("method", "create");
            response.put("ResponseInfo", responseInfo);
            response.put("SewerageTax", savedSewerageTax);
            return response;
        } else {
            boolean createNew = false;
            boolean yearExists = false;
            for (SewerageTax existingSewerageTax : existingSewerageTaxes) {
                if (sewerageTax.getAssessmentyear() != null && sewerageTax.getAssessmentyear().equals(existingSewerageTax.getAssessmentyear())) {
                    yearExists = true;
                    break;
                }
            }
            if (!yearExists) {
                createNew = true;
            }
            if (createNew) {
                long now = System.currentTimeMillis();
                sewerageTax.setCreatedtime(now);
                sewerageTax.setLastmodifiedtime(now);
                SewerageTax savedSewerageTax = insertSewerageTax(sewerageTax);
                responseInfo.put("method", "create");
                response.put("ResponseInfo", responseInfo);
                response.put("SewerageTax", savedSewerageTax);
                return response;
            } else {
                for (SewerageTax existingSewerageTax : existingSewerageTaxes) {
                    if (sewerageTax.getAssessmentyear() != null && sewerageTax.getAssessmentyear().equals(existingSewerageTax.getAssessmentyear())) {
                        if (sewerageTax.getTenantid() != null)
                            existingSewerageTax.setTenantid(sewerageTax.getTenantid());
                        if (sewerageTax.getPropertyid() != null)
                            existingSewerageTax.setPropertyid(sewerageTax.getPropertyid());
                        if (sewerageTax.getSurveyid() != null)
                            existingSewerageTax.setSurveyid(sewerageTax.getSurveyid());
                        if (sewerageTax.getOldpropertyid() != null)
                            existingSewerageTax.setOldpropertyid(sewerageTax.getOldpropertyid());
                        if (sewerageTax.getPropertytype() != null)
                            existingSewerageTax.setPropertytype(sewerageTax.getPropertytype());
                        if (sewerageTax.getOwnershipcategory() != null)
                            existingSewerageTax.setOwnershipcategory(sewerageTax.getOwnershipcategory());
                        if (sewerageTax.getPropertyusagetype() != null)
                            existingSewerageTax.setPropertyusagetype(sewerageTax.getPropertyusagetype());
                        if (sewerageTax.getNooffloors() != null)
                            existingSewerageTax.setNooffloors(sewerageTax.getNooffloors());
                        if (sewerageTax.getPlotsize() != null)
                            existingSewerageTax.setPlotsize(sewerageTax.getPlotsize());
                        if (sewerageTax.getSuperbuilduparea() != null)
                            existingSewerageTax.setSuperbuilduparea(sewerageTax.getSuperbuilduparea());
                        if (sewerageTax.getAddress() != null)
                            existingSewerageTax.setAddress(sewerageTax.getAddress());
                        if (sewerageTax.getLocalityname() != null)
                            existingSewerageTax.setLocalityname(sewerageTax.getLocalityname());
                        if (sewerageTax.getBlockname() != null)
                            existingSewerageTax.setBlockname(sewerageTax.getBlockname());
                        if (sewerageTax.getAssessmentyear() != null)
                            existingSewerageTax.setAssessmentyear(sewerageTax.getAssessmentyear());
                        if (sewerageTax.getBillamount() != null)
                            existingSewerageTax.setBillamount(sewerageTax.getBillamount());
                        if (sewerageTax.getAmountpaid() != null)
                            existingSewerageTax.setAmountpaid(sewerageTax.getAmountpaid());
                        long now = System.currentTimeMillis();
                        existingSewerageTax.setLastmodifiedtime(now);
                        SewerageTax savedSewerageTax = insertSewerageTax(existingSewerageTax);
                        responseInfo.put("method", "update");
                        response.put("ResponseInfo", responseInfo);
                        response.put("SewerageTax", savedSewerageTax);
                        return response;
                    }
                }
                long now = System.currentTimeMillis();
                SewerageTax savedSewerageTax = insertSewerageTax(sewerageTax);
                responseInfo.put("method", "create");
                response.put("ResponseInfo", responseInfo);
                response.put("SewerageTax", savedSewerageTax);
                return response;
            }
        }
    }
}

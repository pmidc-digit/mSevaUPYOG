package org.egov.gccalculation.util;

import java.util.Objects;

import org.egov.gccalculation.constants.GCCalculationConstant;
import org.egov.tracer.model.CustomException;
import org.postgresql.util.PGobject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class Util {

	@Autowired
	private ObjectMapper mapper;

    public JsonNode getJsonValue(PGobject pGobject){
        try {
            if(Objects.isNull(pGobject) || Objects.isNull(pGobject.getValue()))
                return null;
            else
                return mapper.readTree( pGobject.getValue());
        } catch (Exception e) {
        	throw new CustomException(GCCalculationConstant.EG_WS_CAL_JSON_EXCEPTION_KEY, GCCalculationConstant.EG_WS_CAL_JSON_EXCEPTION_MSG);
        }
    }


	
}
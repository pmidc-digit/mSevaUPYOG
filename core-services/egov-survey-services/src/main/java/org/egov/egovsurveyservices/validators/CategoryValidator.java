package org.egov.egovsurveyservices.validators;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang.StringUtils;
import org.egov.egovsurveyservices.web.models.Category;
import org.egov.egovsurveyservices.web.models.CategoryRequest;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

@Slf4j
@Component
public class CategoryValidator {

    public void validateLabel(Category category){
        if(StringUtils.isBlank(category.getLabel())){
            throw new CustomException("EG_SS_NO_CATEGORY_LABEL_ERR","label is not valid for "+category.getId());
        }
    }

    public void validateTenantId(Category category){
        if(StringUtils.isBlank(category.getTenantId())){
            throw new CustomException("EG_SS_NO_CATEGORY_TENANTID_ERR","tenantId is not valid for "+category.getId());
        }
    }

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public boolean isCategoryUnique(String label, String tenantid) {
        String sql = "SELECT COUNT(*) FROM eg_ss_category WHERE label = ? AND tenantid = ? and isactive = true";
        log.info("query for uuids search: " + sql + " params: " + label + " + " + tenantid);
        int count = jdbcTemplate.queryForObject(sql, Integer.class, label, tenantid);
        return count == 0;
    }

    public void validateForUpdate(CategoryRequest categoryRequest) {
        if(CollectionUtils.isEmpty(categoryRequest.getCategories())){
            throw new CustomException("EG_SS_UPDATE_CATEGORY_MISSING", "provide category details for update");
        }
        if(StringUtils.isBlank(categoryRequest.getCategories().get(0).getId())){
            throw new CustomException("EG_SS_UPDATE_CATEGORY_MISSING_ID", "category id missing");
        }
    }
}

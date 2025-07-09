package org.egov.asset.repository;

import lombok.extern.slf4j.Slf4j;
import org.egov.asset.config.AssetConfiguration;
import org.egov.asset.kafka.Producer;
import org.egov.asset.repository.querybuilder.AssetQueryBuilder;
import org.egov.asset.repository.rowmapper.AssetAssignmentRowMapper;
import org.egov.asset.repository.rowmapper.AssetLimitedDateRowMapper;
import org.egov.asset.repository.rowmapper.AssetRowMapper;
import org.egov.asset.web.models.Asset;
import org.egov.asset.web.models.AssetAssignment;
import org.egov.asset.web.models.AssetRequest;
import org.egov.asset.web.models.AssetSearchCriteria;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Repository
public class AssetRepository {

    @Autowired
    private AssetQueryBuilder queryBuilder;

    @Autowired
    private AssetConfiguration config;

    @Autowired
    private Producer producer;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    AssetRowMapper rowMapper;

    @Autowired
    AssetLimitedDateRowMapper assetLimitedDateRowMapper;


    /**
     * Pushes the request on save topic through kafka
     *
     * @param assetRequest The asset create request
     */
    public void save(AssetRequest assetRequest) {
        producer.push(config.getSaveTopic(), assetRequest);
    }

    /**
     * Pushes the request on save assignment topic through kafka
     *
     * @param assetRequest The asset create request
     */
    public void saveAssignment(AssetRequest assetRequest) {
        producer.push(config.getSaveAssignmentTopic(), assetRequest);
    }


    /**
     * Pushes the request on update topic through kafka
     *
     * @param assetRequest The asset update request
     */
    public void update(AssetRequest assetRequest) {
        producer.push(config.getUpdateTopic(), assetRequest);
    }

    /**
     * Pushes the request on update topic through kafka
     *
     * @param assetRequest The asset update request
     */
    public void updateAssetInSystem(AssetRequest assetRequest) {
        producer.push(config.getUpdateAssetStatusInSystem(), assetRequest);
    }

    /**
     * Pushes the request on update assignment topic through kafka
     *
     * @param assetRequest The asset update request
     */
    public void updateAssignment(AssetRequest assetRequest) {
        producer.push(config.getUpdateAssignmentTopic(), assetRequest);
    }

    public List<Asset> getAssetData(AssetSearchCriteria searchCriteria) {
        List<Object> preparedStmtList = new ArrayList<>();
        String query = null;
        if (searchCriteria.getApplicationNo() != null) {
            query = queryBuilder.getAssetSearchQuery(searchCriteria, preparedStmtList);
            log.info("Final query: " + query);
            return jdbcTemplate.query(query, preparedStmtList.toArray(), rowMapper);
        } else {
            query = queryBuilder.getAssetSearchQueryForLimitedData(searchCriteria, preparedStmtList);
            log.info("Final query: " + query);
            return jdbcTemplate.query(query, preparedStmtList.toArray(), assetLimitedDateRowMapper);
        }
    }

    public List<AssetAssignment> getAssetAssignmentDetails(String tenantId, String assetId) {
        return jdbcTemplate.query(queryBuilder.ASSIGNMENT_DETAILS, new AssetAssignmentRowMapper(), assetId);
    }
}

package org.egov.egf.master.domain.repository;

import org.egov.common.domain.model.Pagination;
import org.egov.common.persistence.repository.ESRepository;
import org.egov.egf.master.domain.model.SubScheme;
import org.egov.egf.master.web.contract.SubSchemeSearchContract;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Elasticsearch repository - STUBBED OUT.
 * The Elasticsearch TransportClient has been removed in the Spring Boot 4.x upgrade.
 * This class currently throws UnsupportedOperationException when search is called.
 * The application uses DB-backed repositories when fetch_data_from=db.
 */
@Service
public class SubSchemeESRepository extends ESRepository {

    public static final Logger LOGGER = LoggerFactory.getLogger(SubSchemeESRepository.class);

    public SubSchemeESRepository() {
        // TransportClient removed - ES functionality stubbed
    }

    public Pagination<SubScheme> search(SubSchemeSearchContract searchContract) {
        throw new UnsupportedOperationException(
            "Elasticsearch search is not available. TransportClient was removed in ES 8.x. Use DB-backed repository instead (fetch_data_from=db).");
    }

}
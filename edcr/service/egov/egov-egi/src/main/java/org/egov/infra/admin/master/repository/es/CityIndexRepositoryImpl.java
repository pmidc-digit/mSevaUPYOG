/*
 * eGov SmartCity eGovernance suite is licensed under the GNU GPL v3.
 */
package org.egov.infra.admin.master.repository.es;

import org.egov.infra.admin.master.entity.es.CityIndex;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.mapping.IndexCoordinates;

public class CityIndexRepositoryImpl implements CityIndexCustomRepository {

    @Autowired
    private ElasticsearchOperations elasticsearchOperations;

    @Override
    public CityIndex findOneByDistrictCode(String districtCode) {
        return findFirstByField("districtcode", districtCode);
    }

    @Override
    public CityIndex findOneByCityCode(String cityCode) {
        return findFirstByField("citycode", cityCode);
    }

    private CityIndex findFirstByField(String field, String value) {
        NativeQuery query = NativeQuery.builder()
                .withQuery(q -> q.match(m -> m.field(field).query(value)))
                .build();

        return elasticsearchOperations.search(query, CityIndex.class, IndexCoordinates.of("city"))
                .stream()
                .map(searchHit -> searchHit.getContent())
                .findFirst()
                .orElse(null);
    }
}

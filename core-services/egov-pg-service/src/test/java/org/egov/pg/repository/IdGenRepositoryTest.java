package org.egov.pg.repository;


import org.egov.common.contract.request.RequestInfo;
import org.egov.pg.config.AppProperties;
import org.egov.pg.models.IdGenerationResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;
import org.springframework.web.client.RestTemplate;

@Disabled
public class IdGenRepositoryTest {

    private IdGenRepository idGenRepository;

    @BeforeEach
    public void setUp() {
        MockEnvironment env = new MockEnvironment();
        env.setProperty("idGenHost", "http://localhost:8088/");
        env.setProperty("idGenPath", "egov-idgen/id/_generate");
        AppProperties appProperties = new AppProperties(env);

        idGenRepository = new IdGenRepository(new RestTemplate(), appProperties);
    }


    @Test
    public void testIdGen() {

        RequestInfo requestInfo = new RequestInfo();
        //("", "", 0L, "", "", "", "", "", "8e88988e-d342-45c2-81d0-487a2a20350e", null);
        IdGenerationResponse response = idGenRepository.getId(requestInfo, "pb", "pg.txnid",
                "" +
                        "PB-PG-[cy:yyyy/MM/dd]-[SEQ_EG_PG_TXN]-[d{2}]", 1);
        System.out.println(response.getIdResponses());
    }
}

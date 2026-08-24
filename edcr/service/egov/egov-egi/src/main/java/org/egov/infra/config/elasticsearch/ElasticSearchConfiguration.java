/*
 * eGov SmartCity eGovernance suite is licensed under the GNU GPL v3.
 */
package org.egov.infra.config.elasticsearch;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.elasticsearch.client.ClientConfiguration;
import org.springframework.data.elasticsearch.client.elc.ElasticsearchConfiguration;
import org.springframework.data.elasticsearch.repository.config.EnableElasticsearchRepositories;

@Configuration
@EnableElasticsearchRepositories(basePackages = { "org.egov.**.repository.es", "org.egov.**.elasticsearch.repository" })
public class ElasticSearchConfiguration extends ElasticsearchConfiguration {

    @Value("#{'${elasticsearch.hosts:localhost}'.split(',')}")
    private List<String> searchHosts;

    @Value("${elasticsearch.port:9200}")
    private Integer searchPort;

    @Override
    public ClientConfiguration clientConfiguration() {
        String[] endpoints = searchHosts.stream()
                .map(String::trim)
                .filter(host -> !host.isEmpty())
                .map(host -> host.contains(":") ? host : host + ":" + searchPort)
                .toArray(String[]::new);
        return ClientConfiguration.builder().connectedTo(endpoints).build();
    }
}

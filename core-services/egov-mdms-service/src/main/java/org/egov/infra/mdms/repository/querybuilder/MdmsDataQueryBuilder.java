package org.egov.infra.mdms.repository.querybuilder;

import org.springframework.stereotype.Component;

@Component
public class MdmsDataQueryBuilder {

	private static final String LOAD_ALL_ACTIVE_MDMS_DATA_QUERY = "SELECT data.id, data.tenantid, data.uniqueidentifier, data.schemacode, data.data, data.isactive, data.createdby,"
			+ " data.lastmodifiedby, data.createdtime, data.lastmodifiedtime FROM eg_mdms_data data";

	public String getMdmsDataSearchAllQuery() {
		return LOAD_ALL_ACTIVE_MDMS_DATA_QUERY;
	}
}

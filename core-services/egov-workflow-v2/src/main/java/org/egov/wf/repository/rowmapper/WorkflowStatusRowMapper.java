package org.egov.wf.repository.rowmapper;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.egov.wf.web.models.ProcessInstance;
import org.egov.wf.web.models.State;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.stereotype.Component;

@Component
public class WorkflowStatusRowMapper implements ResultSetExtractor<List<ProcessInstance>> {

	@Override
	public List<ProcessInstance> extractData(ResultSet rs) throws SQLException, DataAccessException {
		// TODO Auto-generated method stub
		Map<String, ProcessInstance> processInstanceMap = new LinkedHashMap<>();

		while (rs.next()) {
			String id = rs.getString("id");
			ProcessInstance processInstance = processInstanceMap.get(id);
			if (processInstance == null) {
				State state = State.builder()

						.uuid(rs.getString("uuid"))
						.state(rs.getString("state"))
						.applicationStatus(rs.getString("applicationStatus"))

						.build();

				processInstance = ProcessInstance.builder().id(rs.getString("id"))
						.businessId(rs.getString("businessId")).state(state).build();
			}
			// addChildrenToProperty(rs,processInstance);
			processInstanceMap.put(id, processInstance);
		}
		return new ArrayList<>(processInstanceMap.values());
	}

}

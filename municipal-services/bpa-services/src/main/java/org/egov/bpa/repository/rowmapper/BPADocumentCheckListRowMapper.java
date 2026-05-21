package org.egov.bpa.repository.rowmapper;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.LinkedList;
import java.util.List;

import org.egov.bpa.web.model.DocumentCheckList;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class BPADocumentCheckListRowMapper implements ResultSetExtractor<List<DocumentCheckList>>{

	@Override
	public List<DocumentCheckList> extractData(ResultSet rs) throws SQLException, DataAccessException {
		List<DocumentCheckList> checkList = new LinkedList<>();
		
		while(rs.next()) {
			DocumentCheckList documentCheckList = DocumentCheckList.builder()
					.id(rs.getString("id"))
					.documentuid(rs.getString("documentuid"))
					.applicationNo(rs.getString("applicationno"))
					.tenantId(rs.getString("tenantId"))
					.action(rs.getString("action"))
					.remarks(rs.getString("remarks"))
					.createdby(rs.getString("createdby"))
					.lastmodifiedby(rs.getString("lastmodifiedby"))
					.createdtime(rs.getLong("createdtime"))
					.lastmodifiedtime(rs.getLong("lastmodifiedtime"))
					.build();
			
			checkList.add(documentCheckList);
		}
		
		return checkList;
	}

}

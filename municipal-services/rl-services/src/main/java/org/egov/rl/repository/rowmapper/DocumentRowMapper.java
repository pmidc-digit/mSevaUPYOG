package org.egov.rl.repository.rowmapper;

import org.egov.rl.models.Document;
import org.egov.rl.models.OwnerInfo;
import org.egov.rl.models.enums.Status;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@Component
public class DocumentRowMapper implements ResultSetExtractor<List<Document>> {

	@Override
	public List<Document> extractData(ResultSet rs) throws SQLException, DataAccessException {
		List<Document> dList = new ArrayList<>();
		while (rs.next()) {
			Document d = Document.builder()
			.documentType(rs.getString("documenttype"))
			.documentUid(rs.getString("allotment_id"))
			.fileStoreId(rs.getString("fileStoreid"))
			.id(rs.getString("id"))
			.status(Status.valueOf(rs.getString("status").toUpperCase()))
			.build();
			dList.add(d);
		}
		
		return dList;
	}
}

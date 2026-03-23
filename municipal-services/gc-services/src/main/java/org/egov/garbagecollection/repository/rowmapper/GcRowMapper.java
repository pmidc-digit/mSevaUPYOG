package org.egov.garbagecollection.repository.rowmapper;

import java.io.IOException;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;

import org.apache.commons.lang3.StringUtils;
import org.egov.garbagecollection.constants.GCConstants;
import org.egov.tracer.model.CustomException;
import org.egov.garbagecollection.web.models.*;
import org.egov.garbagecollection.web.models.Connection.StatusEnum;
import org.egov.garbagecollection.web.models.workflow.ProcessInstance;
import org.postgresql.util.PGobject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

@Component
public class GcRowMapper implements ResultSetExtractor<List<GarbageConnection>> {

	@Autowired
	private ObjectMapper mapper;

	private int full_count=0;

	public int getFull_count() {
		return full_count;
	}

	public void setFull_count(int full_count) {
		this.full_count = full_count;
	}
	
	@Override
	public List<GarbageConnection> extractData(ResultSet rs) throws SQLException, DataAccessException {
		Map<String, GarbageConnection> connectionListMap = new LinkedHashMap<>();
		GarbageConnection currentGarbageConnection = new GarbageConnection();
		while (rs.next()) {
			String Id = rs.getString("connection_Id");
			if (connectionListMap.getOrDefault(Id, null) == null) {
				currentGarbageConnection = new GarbageConnection();
				currentGarbageConnection.setTenantId(rs.getString("tenantid"));
				currentGarbageConnection.setConnectionCategory(rs.getString("connectionCategory"));
				currentGarbageConnection.setConnectionType(rs.getString("connectionType"));
				currentGarbageConnection.setId(rs.getString("connection_Id"));
				currentGarbageConnection.setApplicationNo(rs.getString("applicationNo"));
				currentGarbageConnection.setApplicationStatus(rs.getString("applicationstatus"));
				currentGarbageConnection.setStatus(StatusEnum.fromValue(rs.getString("status")));
				currentGarbageConnection.setConnectionNo(rs.getString("connectionNo"));
				currentGarbageConnection.setOldConnectionNo(rs.getString("oldConnectionNo"));
				currentGarbageConnection.setDisconnectionReason(rs.getString("disconnectionReason"));
				currentGarbageConnection.setIsDisconnectionTemporary(rs.getBoolean("isDisconnectionTemporary"));
				currentGarbageConnection.setPropertyType(rs.getString("property_type"));
				currentGarbageConnection.setPlotSize(rs.getString("plot_size"));
				currentGarbageConnection.setLocation(rs.getString("location"));
				currentGarbageConnection.setFrequency_of_garbage_collection(rs.getString("frequency_of_garbage_collection"));
				currentGarbageConnection.setTypeOfWaste(rs.getString("type_of_waste"));

				PGobject pgObj = (PGobject) rs.getObject("additionaldetails");
				this.setFull_count(rs.getInt("full_count"));
				ObjectNode additionalDetails = null;
				if (pgObj != null) {

					try {
						additionalDetails = mapper.readValue(pgObj.getValue(), ObjectNode.class);
					} catch (IOException ex) {
						// TODO Auto-generated catch block
						throw new CustomException("PARSING ERROR", "The additionalDetail json cannot be parsed");
					}
				} else {
					additionalDetails = mapper.createObjectNode();
				}
				// HashMap<String, Object> additionalDetails = new HashMap<>();
				additionalDetails.put(GCConstants.ADHOC_PENALTY, rs.getBigDecimal("adhocpenalty"));
				additionalDetails.put(GCConstants.ADHOC_REBATE, rs.getBigDecimal("adhocrebate"));
				additionalDetails.put(GCConstants.ADHOC_PENALTY_REASON, rs.getString("adhocpenaltyreason"));
				additionalDetails.put(GCConstants.ADHOC_PENALTY_COMMENT, rs.getString("adhocpenaltycomment"));
				additionalDetails.put(GCConstants.ADHOC_REBATE_REASON, rs.getString("adhocrebatereason"));
				additionalDetails.put(GCConstants.ADHOC_REBATE_COMMENT, rs.getString("adhocrebatecomment"));
				additionalDetails.put(GCConstants.APP_CREATED_DATE, rs.getBigDecimal("appCreatedDate"));
				additionalDetails.put(GCConstants.DETAILS_PROVIDED_BY, rs.getString("detailsprovidedby"));
				additionalDetails.put(GCConstants.ESTIMATION_FILESTORE_ID, rs.getString("estimationfileStoreId"));
				additionalDetails.put(GCConstants.SANCTION_LETTER_FILESTORE_ID, rs.getString("sanctionfileStoreId"));
				additionalDetails.put(GCConstants.ESTIMATION_DATE_CONST, rs.getBigDecimal("estimationLetterDate"));
				additionalDetails.put(GCConstants.LOCALITY, rs.getString("locality"));



				currentGarbageConnection.setAdditionalDetails(additionalDetails);
				currentGarbageConnection
						.processInstance(ProcessInstance.builder().action((rs.getString("action"))).build());
				currentGarbageConnection.setPropertyId(rs.getString("property_id"));
				currentGarbageConnection.setUnitId(rs.getString("unit_id"));
				// Add documents id's
				currentGarbageConnection.setConnectionExecutionDate(rs.getLong("connectionExecutionDate"));
				currentGarbageConnection.setApplicationType(rs.getString("applicationType"));
				currentGarbageConnection.setChannel(rs.getString("channel"));
				currentGarbageConnection.setDateEffectiveFrom(rs.getLong("dateEffectiveFrom"));
				currentGarbageConnection.setDisconnectionExecutionDate(rs.getLong("disconnectionExecutionDate"));


				AuditDetails auditdetails = AuditDetails.builder().createdBy(rs.getString("gc_createdBy"))
						.createdTime(rs.getLong("gc_createdTime")).lastModifiedBy(rs.getString("gc_lastModifiedBy"))
						.lastModifiedTime(rs.getLong("gc_lastModifiedTime")).build();
				currentGarbageConnection.setAuditDetails(auditdetails);

				connectionListMap.put(Id, currentGarbageConnection);
			}
			addChildrenToProperty(rs, currentGarbageConnection);
		}
		return new ArrayList<>(connectionListMap.values());
	}

	private void addChildrenToProperty(ResultSet rs, GarbageConnection garbageConnection) throws SQLException {
		addDocumentToGarbageConnecti(rs, garbageConnection);
		addHoldersDeatilsToGarbageConnecti(rs, garbageConnection);
	}

	private void addDocumentToGarbageConnecti(ResultSet rs, GarbageConnection garbageConnection) throws SQLException {
		String document_Id = rs.getString("doc_Id");
		String isActive = rs.getString("doc_active");
		boolean documentActive = false;
		if (!StringUtils.isEmpty(isActive)) {
			documentActive = Status.ACTIVE.name().equalsIgnoreCase(isActive);
		}
		if (!StringUtils.isEmpty(document_Id) && documentActive) {
			Document applicationDocument = new Document();
			applicationDocument.setId(document_Id);
			applicationDocument.setDocumentType(rs.getString("documenttype"));
			applicationDocument.setFileStoreId(rs.getString("filestoreid"));
			applicationDocument.setApplicationId(rs.getString("gc_Id"));
			applicationDocument.setStatus(Status.fromValue(isActive));
			garbageConnection.addDocumentsItem(applicationDocument);
		}
	}

	private void addHoldersDeatilsToGarbageConnecti(ResultSet rs, GarbageConnection garbageConnection) throws SQLException {
		String uuid = rs.getString("userid");
		List<OwnerInfo> connectionHolders = garbageConnection.getConnectionHolders();
		if (!CollectionUtils.isEmpty(connectionHolders)) {
			for (OwnerInfo connectionHolderInfo : connectionHolders) {
				if (!StringUtils.isEmpty(connectionHolderInfo.getUuid()) && !StringUtils.isEmpty(uuid)
						&& connectionHolderInfo.getUuid().equals(uuid))
					return;
			}
		}
		if (!StringUtils.isEmpty(uuid)) {
			Double holderShipPercentage = rs.getDouble("holdershippercentage");
			if (rs.wasNull()) {
				holderShipPercentage = null;
			}
			Boolean isPrimaryOwner = rs.getBoolean("isprimaryholder");
			if (rs.wasNull()) {
				isPrimaryOwner = null;
			}
			OwnerInfo connectionHolderInfo = OwnerInfo.builder()
					.relationship(rs.getString("holderrelationship"))
					.status(Status.fromValue(rs.getString("holderstatus"))).tenantId(rs.getString("holdertenantid"))
					.ownerType(rs.getString("connectionholdertype")).isPrimaryOwner(isPrimaryOwner).uuid(uuid).build();
			garbageConnection.addConnectionHolderInfo(connectionHolderInfo);
		}
	}
}
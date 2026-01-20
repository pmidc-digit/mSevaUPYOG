import { ActionBar, Card, CardSubHeader, DocumentSVG, Header, Loader, Menu, Row, StatusTable, SubmitBar, Table, Toast } from "@mseva/digit-ui-react-components";
import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useParams } from "react-router-dom";
import ActionModal from "../components/Modal";
import { convertEpochFormateToDate, pdfDownloadLink } from "../components/Utils";
import { LINEAR_BLUE_GRADIENT } from "../utils/empMappingUtils";

// Constants
const OBPS_GROUP_ID = "025";

// Utility: Fetch OBPS roles from sessionStorage or MDMS
const getOBPSRoles = async (stateId) => {
  try {
    const cachedRoles = sessionStorage.getItem('OBPS_ROLES');
    if (cachedRoles) {
      return JSON.parse(cachedRoles);
    }

    const response = await Digit.MDMSService.getMultipleTypes(stateId, "ACCESSCONTROL-ROLES", ["roles"]);
    const allRoles = response?.['ACCESSCONTROL-ROLES']?.roles || [];
    const obpsRoles = allRoles.filter(role => role.groupId === OBPS_GROUP_ID);
    const obpsRoleMap = {};
    obpsRoles.forEach(role => {
      obpsRoleMap[role.code] = role.name;
    });

    const cacheData = { codes: obpsRoles.map(r => r.code), map: obpsRoleMap };
    sessionStorage.setItem('OBPS_ROLES', JSON.stringify(cacheData));
    return cacheData;
  } catch (error) {
    console.error("Error fetching OBPS roles:", error);
    return { codes: [], map: {} };
  }
};

const HRMSEMPMAPDetails = () => {
  const activeworkflowActions = ["DEACTIVATE_EMPLOYEE_HEAD", "COMMON_EDIT_EMPLOYEE_HEADER"];
  const deactiveworkflowActions = ["ACTIVATE_EMPLOYEE_HEAD"];
  const [selectedAction, setSelectedAction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { t } = useTranslation();
  const { id: employeeId, uuid: userUUID } = useParams();
  const { tenantId: tenantId } = useParams()
  const history = useHistory();
  const [displayMenu, setDisplayMenu] = useState(false);
  const isupdate = Digit.SessionStorage.get("isupdate");
  const { isLoading, isError, error, data, ...rest } = Digit.Hooks.hrms.useHRMSSearch({ codes: employeeId }, tenantId, null, isupdate);
  const [errorInfo, setErrorInfo, clearError] = Digit.Hooks.useSessionStorage("EMPLOYEE_HRMS_ERROR_DATA", false);
  const [mutationHappened, setMutationHappened, clear] = Digit.Hooks.useSessionStorage("EMPLOYEE_HRMS_MUTATION_HAPPENED", false);
  const [successData, setsuccessData, clearSuccessData] = Digit.Hooks.useSessionStorage("EMPLOYEE_HRMS_MUTATION_SUCCESS_DATA", false);
  const isMobile = window.Digit.Utils.browser.isMobile();
  const [mappingData, setMappingData] = useState([]);
  const [mappingLoading, setMappingLoading] = useState(false);
  const [showToast, setShowToast] = useState(null);
  const [pageOffset, setPageOffset] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [obpsRoleMap, setObpsRoleMap] = useState({});
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({
    show: false,
    type: null, // 'single' or 'all'
    mappingId: null,
    employeeUUID: null,
  });
  const stateId = Digit.ULBService.getStateId();

  useEffect(() => {
    setMutationHappened(false);
    clearSuccessData();
    clearError();
    
    // Load OBPS roles on mount
    const loadRoles = async () => {
      const roles = await getOBPSRoles(stateId);
      setObpsRoleMap(roles.map);
    };
    loadRoles();
  }, []);

  // Fetch mapping data with pagination
  const fetchMappingData = async () => {
    if (!userUUID) {
      return;
    }
    
    // Safety check: Ensure data and obpsRoleMap are loaded before fetching
    if (!data?.Employees?.[0] || !obpsRoleMap || Object.keys(obpsRoleMap).length === 0) {
      console.warn("Data or OBPS roles not yet loaded, skipping fetch");
      return;
    }
    
    try {
      setMappingLoading(true);
      
      const response = await Digit.HRMSService.EmpMapDetails(tenantId, {
        userUUID: userUUID,
        limit: pageSize,
        offset: pageOffset,
      });
      
      if (response?.Employees) {
        // Get employee's OBPS roles from main data object (calculated once for all mappings)
        let roleNames = "No OBPS Roles";
        if (data?.Employees?.[0]?.user?.roles && obpsRoleMap && Object.keys(obpsRoleMap).length > 0) {
          const empRoles = data.Employees[0].user.roles
            .filter(role => obpsRoleMap[role.code])
            .map(role => obpsRoleMap[role.code]);
          roleNames = empRoles.length > 0 ? empRoles.join(", ") : "No OBPS Roles";
        }
        
        const transformedData = response.Employees.map((emp, index) => {
          return {
            id: emp.uuid || emp.id,
            displayId: String(pageOffset + index + 1),
            employeeUUID: emp.uuid,
            userUUID: emp.userUUID,
            category: emp.category || "N/A",
            subCategory: emp.subcategory || "N/A",
            ward: emp.assignedTenantId || "N/A",
            zone: emp.zone || "N/A",
            roles: roleNames, // Same roles for all mappings since it's per employee
          };
        });
        setMappingData(transformedData);
        
        // Since API doesn't return total count, handle pagination based on fetched data
        if (transformedData.length < pageSize) {
          // Last page - set exact total
          setTotalRecords(pageOffset + transformedData.length);
        } else {
          // More pages might exist - set total to allow next page
          setTotalRecords(pageOffset + transformedData.length + 1);
        }
      } else {
        setMappingData([]);
        setTotalRecords(0);
      }
    } catch (error) {
      console.error("Error fetching mapping data:", error);
    } finally {
      setMappingLoading(false);
    }
  };

  useEffect(() => {
    if (data && Object.keys(obpsRoleMap).length > 0) {
      fetchMappingData();
    }
  }, [userUUID, tenantId, pageOffset, pageSize, data, obpsRoleMap, refreshCounter]);

  function onActionSelect(action) {
    setSelectedAction(action);
    setDisplayMenu(false);
  }

  const closeModal = () => {
    setSelectedAction(null);
    setShowModal(false);
  };
  const handleDownload = async (document) => {
    const res = await Digit.UploadServices.Filefetch([document?.documentId], Digit.ULBService.getStateId());
    let documentLink = pdfDownloadLink(res.data, document?.documentId);
    window.open(documentLink, "_blank");
  };

  // ==================== PAGINATION HANDLERS ====================
  const fetchNextPage = () => {
    setPageOffset((prevState) => prevState + pageSize);
  };

  const fetchPrevPage = () => {
    setPageOffset((prevState) => prevState - pageSize);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setPageOffset(0);
  };

  const totalPages = Math.ceil(totalRecords / pageSize);
  const currentPage = Math.floor(pageOffset / pageSize);

  const submitAction = (data) => { };
   // ==================== MODAL ACTIONS ====================
  const handleDeleteAll = () => {
    setDeleteConfirmModal({
      show: true,
      type: 'all',
      mappingId: null,
      employeeUUID: null,
    });
  };

  const confirmDeleteAll = async () => {
    try {
        setMappingLoading(true);
        
        // Prepare payload - send ALL mapping UUIDs, not the user UUID
        const payload = {
          Employees: mappingData.map(mapping => ({
            tenantId: tenantId,
            uuid: mapping.employeeUUID, // Use each mapping's UUID
          })),
        };
        
        // Call DELETE API for each mapping
        const response = await Digit.HRMSService.DeleteEmpMapping(tenantId, payload);
        
        if (response?.ResponseInfo?.status === "successful") {
          // Trigger refresh through useEffect to ensure proper data flow
          setRefreshCounter(prev => prev + 1);
          setDeleteConfirmModal({ show: false, type: null, mappingId: null, employeeUUID: null });
          setShowToast({ key: true, label: "All mappings deleted successfully!" });
        } else {
          setDeleteConfirmModal({ show: false, type: null, mappingId: null, employeeUUID: null });
          setShowToast({ key: true, label: "Failed to delete mappings", error: true });
        }
      } catch (error) {
        console.error("Error deleting all mappings:", error);
        setDeleteConfirmModal({ show: false, type: null, mappingId: null, employeeUUID: null });
        setShowToast({ 
          key: true, 
          label: error?.response?.data?.Errors?.[0]?.message || "Failed to delete mappings", 
          error: true 
        });
      } finally {
        setMappingLoading(false);
      }
  };

  const handleDelete = (mappingId, employeeUUID) => {
    setDeleteConfirmModal({
      show: true,
      type: 'single',
      mappingId: mappingId,
      employeeUUID: employeeUUID,
    });
  };

  const confirmDelete = async () => {
    const { mappingId, employeeUUID } = deleteConfirmModal;
    try {
        setMappingLoading(true);
        
        // Prepare payload for DELETE API (as per CURL format)
        const payload = {
          Employees: [
            {
              tenantId: tenantId,
              uuid: employeeUUID,
            },
          ],
        };
        
        // Call DELETE API using service
        const response = await Digit.HRMSService.DeleteEmpMapping(tenantId, payload);
        
        if (response?.ResponseInfo?.status === "successful") {
          // Trigger refresh through useEffect to ensure proper data flow
          setRefreshCounter(prev => prev + 1);
          setDeleteConfirmModal({ show: false, type: null, mappingId: null, employeeUUID: null });
          setShowToast({ key: true, label: "Mapping deleted successfully!" });
        } else {
          setDeleteConfirmModal({ show: false, type: null, mappingId: null, employeeUUID: null });
          setShowToast({ key: true, label: "Failed to delete mapping", error: true });
        }
      } catch (error) {
        console.error("Error deleting mapping:", error);
        setDeleteConfirmModal({ show: false, type: null, mappingId: null, employeeUUID: null });
        setShowToast({ 
          key: true, 
          label: error?.response?.data?.Errors?.[0]?.message || "Failed to delete mapping", 
          error: true 
        });
      } finally {
        setMappingLoading(false);
      }
  };
  // Table columns for mapping data
  const mappingColumns = useMemo(
    () => [
      {
        Header: t("HR_CATEGORY_LABEL"),
        accessor: "category",
        Cell: ({ value }) => (
          <span className="hrms-badge hrms-badge--category">
            {value}
          </span>
        ),
      },
      {
        Header: t("HR_SUB_CATEGORY_LABEL"),
        accessor: "subCategory",
        Cell: ({ value }) => (
          <span className="hrms-badge hrms-badge--subcategory">
            {value}
          </span>
        ),
      },
      // {
      //   Header: t("HR_WARD_LABEL"),
      //   accessor: "ward",
      //   Cell: ({ value }) => (
      //     <span
      //       style={{
      //         display: "inline-block",
      //         padding: "4px 12px",
      //         backgroundColor: "#D1FAE5",
      //         color: "#047857",
      //         borderRadius: "12px",
      //         fontSize: "13px",
      //         fontWeight: "500",
      //       }}
      //     >
      //       {value}
      //     </span>
      //   ),
      // },
      {
        Header: t("HR_ZONE_LABEL"),
        accessor: "zone",
        Cell: ({ value }) => (
          <span className="hrms-badge hrms-badge--zone">
            {value}
          </span>
        ),
      },
      {
        Header: t("HR_ROLES_LABEL") || "Role(s)",
        accessor: "roles",
        Cell: ({ value }) => {
          if (!value || value === "No OBPS Roles") {
            return <span className="hrms-text-secondary" style={{ fontSize: "13px" }}>{value || "No OBPS Roles"}</span>;
          }
          const roleArray = value.split(", ");
          return (
            <div className="hrms-flex hrms-flex-wrap" style={{ gap: "4px" }}>
              {roleArray.map((role, idx) => (
                <span key={idx} className="hrms-badge hrms-badge--role">
                  {role}
                </span>
              ))}
            </div>
          );
        },
      },
       {
        Header: t("HR_ACTIONS_LABEL"),
        Cell: ({ row }) => (
          <button
            onClick={() => handleDelete(row.original.id, row.original.employeeUUID)}
            className="hrms-delete-btn"
            disabled={mappingLoading}
          >
            {t("COMMON_DELETE")}
          </button>
        ),
      },
    ],
    [t]
  );

  useEffect(() => {
    switch (selectedAction) {
      case "DEACTIVATE_EMPLOYEE_HEAD":
        return setShowModal(true);
      case "ACTIVATE_EMPLOYEE_HEAD":
        return setShowModal(true);
      case "COMMON_EDIT_EMPLOYEE_HEADER":
        return history.push(`/digit-ui/employee/hrms/edit/${tenantId}/${employeeId}`);
      default:
        break;
    }
  }, [selectedAction]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <React.Fragment>
      <div style={isMobile ? {marginLeft: "-12px", fontFamily: "calibri", color: "#FF0000"} :{ marginLeft: "15px", fontFamily: "calibri", color: "#FF0000" }}>
        <Header>{t("HR_NEW_EMPLOYEE_FORM_HEADER")}</Header>
      </div>
      {!isLoading && data?.Employees.length > 0 ? (
        <div>
          <Card>
            <StatusTable>
              <Row
                label={<CardSubHeader className="card-section-header">{t("HR_EMP_STATUS_LABEL")} </CardSubHeader>}
                text={
                  data?.Employees?.[0]?.isActive ? <div className="sla-cell-success"> {t("ACTIVE")} </div> : <div className="sla-cell-error">{t("INACTIVE")}</div>
                }
                textStyle={{ fontWeight: "bold", maxWidth: "7.5rem" }}
              />
            </StatusTable>
            <CardSubHeader className="card-section-header">{t("HR_PERSONAL_DETAILS_FORM_HEADER")} </CardSubHeader>
            <StatusTable>
              <Row label={t("HR_NAME_LABEL")} text={data?.Employees?.[0]?.user?.name || "NA"} textStyle={{ whiteSpace: "pre" }} />
              <Row label={t("HR_MOB_NO_LABEL")} text={data?.Employees?.[0]?.user?.mobileNumber || "NA"} textStyle={{ whiteSpace: "pre" }} />
              <Row label={t("HR_GENDER_LABEL")} text={t(data?.Employees?.[0]?.user?.gender) || "NA"} />
              <Row label={t("HR_EMAIL_LABEL")} text={data?.Employees?.[0]?.user?.emailId || "NA"} />
              <Row label={t("HR_CORRESPONDENCE_ADDRESS_LABEL")} text={data?.Employees?.[0]?.user?.correspondenceAddress || "NA"} />
            </StatusTable>
            <CardSubHeader className="card-section-header">{t("HR_NEW_EMPLOYEE_FORM_HEADER")}</CardSubHeader>
            <StatusTable>
              <Row label={t("HR_EMPLOYMENT_TYPE_LABEL")} text={t(data?.Employees?.[0]?.employeeType ? `EGOV_HRMS_EMPLOYEETYPE_${data?.Employees?.[0]?.employeeType}` : "NA")} textStyle={{ whiteSpace: "pre" }} />
              <Row
                label={t("HR_APPOINTMENT_DATE_LABEL")}
                text={convertEpochFormateToDate(data?.Employees?.[0]?.dateOfAppointment) || "NA"}
                textStyle={{ whiteSpace: "pre" }}
              />
              <Row label={t("HR_EMPLOYEE_ID_LABEL")} text={data?.Employees?.[0]?.code} />
            </StatusTable>

            {/* Employee Mapping Table */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "30px", marginBottom: "15px" }}>
              <CardSubHeader className="card-section-header">{t("HR_EMPLOYEE_CATEGORY_ZONE_MAPPING")}</CardSubHeader>
              
              {/* Page Size Selector */}
              {mappingData.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "14px", color: "#666" }}>{t("COMMON_ROWS_PER_PAGE") || "Rows per page:"}:</span>
                  <select
                    value={pageSize}
                    onChange={handlePageSizeChange}
                    style={{
                      padding: "6px 12px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "14px",
                      cursor: "pointer",
                    }}
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={30}>30</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              )}
            </div>
            
            {/* Delete All Button */}
            {mappingData.length > 0 && (
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "15px" }}>
                <button
                  onClick={handleDeleteAll}
                  disabled={mappingLoading}
                  style={{
                    background: LINEAR_BLUE_GRADIENT,
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "4px",
                    cursor: mappingLoading ? "not-allowed" : "pointer",
                    fontWeight: "500",
                    fontSize: "14px",
                    opacity: mappingLoading ? 0.6 : 1,
                  }}
                >
                  {t("HR_DELETE_ALL_MAPPINGS") || "Delete All Mappings"}
                </button>
              </div>
            )}
            
            {mappingLoading ? (
              <Loader />
            ) : mappingData.length > 0 ? (
              <Table
                t={t}
                data={mappingData}
                columns={mappingColumns}
                className="customTable table-border-style"
                manualPagination={true}
                isPaginationRequired={false}
                disableSort={false}
                getCellProps={(cellInfo) => ({
                  style: {
                    padding: "12px",
                    fontSize: "14px",
                  },
                })}
              />
            ) : (
              <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
                <p>{t("COMMON_TABLE_NO_RECORD_FOUND")}</p>
              </div>
            )}

            {/* Pagination Controls */}
            {mappingData.length > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", padding: "10px 0" }}>
                <div style={{ fontSize: "14px", color: "#666" }}>
                  {t("COMMON_SHOWING")} {pageOffset + 1} {t("COMMON_TO")} {Math.min(pageOffset + pageSize, totalRecords)} {t("COMMON_OF")} {totalRecords}
                </div>
                
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <button
                    onClick={fetchPrevPage}
                    disabled={pageOffset === 0}
                    style={{
                      padding: "8px 16px",
                      border: "1px solid #ddd",
                      backgroundColor: pageOffset === 0 ? "#f5f5f5" : "white",
                      cursor: pageOffset === 0 ? "not-allowed" : "pointer",
                      borderRadius: "4px",
                      fontSize: "14px",
                      opacity: pageOffset === 0 ? 0.5 : 1,
                    }}
                  >
                    ← {t("COMMON_PREVIOUS")}
                  </button>
                  
                  <span style={{ fontSize: "14px", color: "#666" }}>
                    {t("COMMON_PAGE")} {currentPage + 1} {t("COMMON_OF")} {totalPages || 1}
                  </span>
                  
                  <button
                    onClick={fetchNextPage}
                    disabled={pageOffset + pageSize >= totalRecords}
                    style={{
                      padding: "8px 16px",
                      border: "1px solid #ddd",
                      backgroundColor: pageOffset + pageSize >= totalRecords ? "#f5f5f5" : "white",
                      cursor: pageOffset + pageSize >= totalRecords ? "not-allowed" : "pointer",
                      borderRadius: "4px",
                      fontSize: "14px",
                      opacity: pageOffset + pageSize >= totalRecords ? 0.5 : 1,
                    }}
                  >
                    {t("COMMON_NEXT")} →
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>
      ) : null}
      {showModal ? (
        <ActionModal t={t} action={selectedAction} tenantId={tenantId} applicationData={data} closeModal={closeModal} submitAction={submitAction} />
      ) : null}
      
      {/* Toast Notification */}
      {showToast && (
        <Toast
          error={showToast.error}
          label={showToast.label}
          onClose={() => setShowToast(null)}
          isDleteBtn
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal.show && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={() => setDeleteConfirmModal({ show: false, type: null, mappingId: null, employeeUUID: null })}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "24px",
              maxWidth: "450px",
              width: "90%",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ marginBottom: "20px" }}>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#333" }}>
                {deleteConfirmModal.type === 'all' 
                  ? t("HR_CONFIRM_DELETE_ALL_MAPPINGS") || "Delete All Mappings"
                  : t("HR_CONFIRM_DELETE_MAPPING") || "Delete Mapping"}
              </h2>
            </div>
            
            <div style={{ marginBottom: "24px", fontSize: "14px", color: "#666", lineHeight: "1.5" }}>
              {deleteConfirmModal.type === 'all'
                ? t("HR_CONFIRM_DELETE_ALL_MAPPINGS_MESSAGE") || "Are you sure you want to delete ALL mappings for this employee? This action cannot be undone."
                : t("HR_CONFIRM_DELETE_MAPPING_MESSAGE") || "Are you sure you want to delete this mapping? This action cannot be undone."}
            </div>
            
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setDeleteConfirmModal({ show: false, type: null, mappingId: null, employeeUUID: null })}
                disabled={mappingLoading}
                style={{
                  padding: "10px 20px",
                  border: "1px solid #ddd",
                  backgroundColor: "white",
                  color: "#666",
                  borderRadius: "4px",
                  cursor: mappingLoading ? "not-allowed" : "pointer",
                  fontWeight: "500",
                  fontSize: "14px",
                  opacity: mappingLoading ? 0.6 : 1,
                }}
              >
                {t("COMMON_CANCEL") || "Cancel"}
              </button>
              
              <button
                onClick={deleteConfirmModal.type === 'all' ? confirmDeleteAll : confirmDelete}
                disabled={mappingLoading}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  background: LINEAR_BLUE_GRADIENT,
                  color: "white",
                  borderRadius: "4px",
                  cursor: mappingLoading ? "not-allowed" : "pointer",
                  fontWeight: "500",
                  fontSize: "14px",
                  opacity: mappingLoading ? 0.6 : 1,
                }}
              >
                {mappingLoading ? (t("COMMON_DELETING") || "Deleting...") : (t("COMMON_DELETE") || "Delete")}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* <ActionBar>
        {displayMenu && data ? (
          <Menu
            localeKeyPrefix="HR"
            options={data?.Employees?.[0]?.isActive ? activeworkflowActions : deactiveworkflowActions}
            t={t}
            onSelect={onActionSelect}
          />
        ) : null}
        <SubmitBar label={t("HR_COMMON_TAKE_ACTION")} onSubmit={() => setDisplayMenu(!displayMenu)} />
      </ActionBar> */}
    </React.Fragment>
  );
};

export default HRMSEMPMAPDetails;

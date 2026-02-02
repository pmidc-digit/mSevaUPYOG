import { ActionBar, Card, CardSubHeader, DocumentSVG, Header, Loader, Menu, Row, StatusTable, SubmitBar, Table, Toast } from "@mseva/digit-ui-react-components";
import React, { useEffect, useState, useMemo,Fragment } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useParams } from "react-router-dom";
import ActionModal from "../components/Modal";
import { convertEpochFormateToDate, pdfDownloadLink } from "../components/Utils";

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
  const stateId = Digit.ULBService.getStateId();

  // Fetch MDMS data for BPA Category and SubCategory
  const { data: mdmsDataBPA, isLoading: isBPALoading } = Digit.Hooks.useCommonMDMS(stateId, "BPA", ["Category", "SubCategory"]);

  // Create lookup maps for categories and subcategories
  const categoryMap = useMemo(() => {
    if (!mdmsDataBPA?.BPA?.Category) return {};
    const map = {};
    mdmsDataBPA.BPA.Category.forEach(cat => {
      map[cat.categoryId] = cat.categoryName;
    });
    return map;
  }, [mdmsDataBPA]);

  const subCategoryMap = useMemo(() => {
    if (!mdmsDataBPA?.BPA?.SubCategory) return {};
    const map = {};
    mdmsDataBPA.BPA.SubCategory.forEach(sub => {
      map[sub.subCategoryId] = sub.subCategoryName;
    });
    return map;
  }, [mdmsDataBPA]);

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
            category: categoryMap[emp.category] || emp.category || "N/A",
            subCategory: subCategoryMap[emp.subcategory] || emp.subcategory || "N/A",
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
    if (data && Object.keys(obpsRoleMap).length > 0 && Object.keys(categoryMap).length > 0 && Object.keys(subCategoryMap).length > 0) {
      fetchMappingData();
    }
  }, [userUUID, tenantId, pageOffset, pageSize, data, obpsRoleMap, categoryMap, subCategoryMap, refreshCounter]);

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
  const handleDeleteAll = async () => {
    if (window.confirm(t("HR_CONFIRM_DELETE_ALL_MAPPINGS") || "Are you sure you want to delete ALL mappings for this employee?")) {
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
          setShowToast({ key: true, label: "All mappings deleted successfully!" });
        } else {
          setShowToast({ key: true, label: "Failed to delete mappings", error: true });
        }
      } catch (error) {
        console.error("Error deleting all mappings:", error);
        setShowToast({ 
          key: true, 
          label: error?.response?.data?.Errors?.[0]?.message || "Failed to delete mappings", 
          error: true 
        });
      } finally {
        setMappingLoading(false);
      }
    }
  };

  const handleDelete = async (mappingId, employeeUUID) => {
    if (window.confirm(t("HR_CONFIRM_DELETE_MAPPING") || "Are you sure you want to delete this mapping?")) {
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
          setShowToast({ key: true, label: "Mapping deleted successfully!" });
        } else {
          setShowToast({ key: true, label: "Failed to delete mapping", error: true });
        }
      } catch (error) {
        console.error("Error deleting mapping:", error);
        setShowToast({ 
          key: true, 
          label: error?.response?.data?.Errors?.[0]?.message || "Failed to delete mapping", 
          error: true 
        });
      } finally {
        setMappingLoading(false);
      }
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
            return <span className="hrms-text-secondary">{value || "No OBPS Roles"}</span>;
          }
          const roleArray = value.split(", ");
          return (
            <div className="hrms-badge-container">
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
        accessor: "actions",
        disableSortBy: true,
        Cell: ({ row }) => (
          <button
            onClick={() => handleDelete(row.original.id, row.original.employeeUUID)}
            className="hrms-btn hrms-btn--delete"
            disabled={mappingLoading}
          >
            {t("COMMON_DELETE")}
          </button>
        ),
      },
    ],
    [t, handleDelete, mappingLoading]
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

  if (isLoading || isBPALoading) {
    return <Loader />;
  }

  return (
    <React.Fragment>
      <div className="hrms-emp-mapping__header">
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
            <div className="hrms-flex hrms-flex--between hrms-flex--center hrms-spacing--mapping-header">
              <CardSubHeader className="card-section-header">{t("HR_EMPLOYEE_CATEGORY_ZONE_MAPPING")}</CardSubHeader>
              
              {/* Page Size Selector */}
              {mappingData.length > 0 && (
                <div className="hrms-page-size">
                  <span className="hrms-text--secondary">{t("COMMON_ROWS_PER_PAGE") || "Rows per page:"}:</span>
                  <select
                    value={pageSize}
                    onChange={handlePageSizeChange}
                    className="hrms-select"
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
              <div className="hrms-flex hrms-flex--end hrms-spacing--section-bottom">
                <button
                  onClick={handleDeleteAll}
                  disabled={mappingLoading}
                  className={`hrms-btn hrms-btn--primary ${mappingLoading ? 'disabled' : ''}`}
                >
                  {t("HR_DELETE_ALL_MAPPINGS") || "Delete All Mappings"}
                </button>
              </div>
            )}
            
            {mappingLoading ? (
              <Loader />
            ) : mappingData.length > 0 ? (
              <>
                {/* Mobile Card View */}
                <div className="hrms-mobile-cards">
                  {mappingData.map((mapping) => (
                    <div key={mapping.id} className="hrms-mobile-card">
                      <div className="hrms-mobile-card__row">
                        <span className="hrms-mobile-card__label">{t("HR_CATEGORY_LABEL")}:</span>
                        <span className="hrms-badge hrms-badge--category">{mapping.category}</span>
                      </div>
                      <div className="hrms-mobile-card__row">
                        <span className="hrms-mobile-card__label">{t("HR_SUB_CATEGORY_LABEL")}:</span>
                        <span className="hrms-badge hrms-badge--subcategory">{mapping.subCategory}</span>
                      </div>
                      <div className="hrms-mobile-card__row">
                        <span className="hrms-mobile-card__label">{t("HR_ZONE_LABEL")}:</span>
                        <span className="hrms-badge hrms-badge--zone">{mapping.zone}</span>
                      </div>
                      <div className="hrms-mobile-card__row hrms-mobile-card__row--full">
                        <span className="hrms-mobile-card__label">{t("HR_ROLES_LABEL")}:</span>
                        <div className="hrms-badge-container">
                          {mapping.roles && mapping.roles !== "No OBPS Roles" ? (
                            mapping.roles.split(", ").map((role, idx) => (
                              <span key={idx} className="hrms-badge hrms-badge--role">{role}</span>
                            ))
                          ) : (
                            <span className="hrms-text-secondary">No OBPS Roles</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(mapping.id, mapping.employeeUUID)}
                        className="hrms-btn hrms-btn--delete hrms-mobile-card__delete-btn"
                        disabled={mappingLoading}
                      >
                        {t("COMMON_DELETE")}
                      </button>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <Table
                  t={t}
                  data={mappingData}
                  columns={mappingColumns}
                  getCellProps={(cellInfo) => ({
                    style: cellInfo.column.style || {},
                  })}
                  className="customTable table-border-style hrms-table hrms-desktop-table"
                  manualPagination={true}
                  isPaginationRequired={false}
                  disableSort={false}
                />
              </>
            ) : (
              <div className="hrms-emp-mapping__no-data">
                <p>{t("COMMON_TABLE_NO_RECORD_FOUND")}</p>
              </div>
            )}

            {/* Pagination Controls */}
            {mappingData.length > 0 && (
              <div className="hrms-pagination-container">
                <div className="hrms-text--secondary">
                  {t("COMMON_SHOWING")} {pageOffset + 1} {t("COMMON_TO")} {Math.min(pageOffset + pageSize, totalRecords)} {t("COMMON_OF")} {totalRecords}
                </div>
                
                <div className="hrms-flex hrms-flex--gap-10 hrms-flex--center">
                  <button
                    onClick={fetchPrevPage}
                    disabled={pageOffset === 0}
                    className={`hrms-btn hrms-btn--pagination ${pageOffset === 0 ? 'disabled' : ''}`}
                  >
                    ← {t("COMMON_PREVIOUS")}
                  </button>
                  
                  <span className="hrms-text--secondary">
                    {t("COMMON_PAGE")} {currentPage + 1} {t("COMMON_OF")} {totalPages || 1}
                  </span>
                  
                  <button
                    onClick={fetchNextPage}
                    disabled={pageOffset + pageSize >= totalRecords}
                    className={`hrms-btn hrms-btn--pagination ${pageOffset + pageSize >= totalRecords ? 'disabled' : ''}`}
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

import { Card, CardSubHeader, Header, Loader, Row, StatusTable, Table, Toast } from "@mseva/digit-ui-react-components";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { convertEpochFormateToDate } from "../components/Utils";

const MAPPING_BATCH_SIZE = 100;
// Upper bound on batches while collecting all mappings, so a misbehaving API cannot loop forever
const MAX_MAPPING_BATCHES = 100;

// Asks the employee's own tenant first, then falls back to the ULB tenant from the URL
const requestMappings = async ({ userUUID, tenantId, userTenantId, offset, limit }) => {
  const params = { userUUID, limit, offset, assignedTenantId: tenantId };
  const response = await Digit.HRMSService.EmpMapDetails(userTenantId, params);
  if ((!response?.Employees || response.Employees.length === 0) && userTenantId !== tenantId) {
    return Digit.HRMSService.EmpMapDetails(tenantId, params);
  }
  return response;
};

const HRMSEMPMAPDetails = () => {
  const { t } = useTranslation();
  const { id: employeeId, uuid: userUUID, userTenantId: urlUserTenantId, tenantId } = useParams();
  const isupdate = Digit.SessionStorage.get("isupdate");
  const stateId = Digit.ULBService.getStateId();

  // If userTenantId is in the URL (new links from MappingTable), use it directly.
  // Otherwise fall back to tenantId from URL.
  const profileTenantId = urlUserTenantId || tenantId;

  // Primary search uses profileTenantId (could be pb.punjab for state-level employees)
  const primarySearch = Digit.Hooks.hrms.useHRMSSearch({ codes: employeeId }, profileTenantId, null, isupdate);

  // Fallback: if profileTenantId itself found nothing (e.g. old URL without userTenantId segment),
  // try with the ULB tenantId from the URL.
  const fallbackEnabled =
    !primarySearch.isLoading && (!primarySearch.data?.Employees || primarySearch.data.Employees.length === 0) && profileTenantId !== tenantId;

  const fallbackSearch = Digit.Hooks.hrms.useHRMSSearch({ codes: employeeId }, tenantId, null, isupdate, { enabled: fallbackEnabled });

  // isLoading must stay true while fallbackSearch is pending, since disabled queries report isLoading=false
  const isLoading = primarySearch.isLoading || (fallbackEnabled && (fallbackSearch.isLoading || fallbackSearch.isFetching));
  const isError = primarySearch.isError && fallbackSearch.isError;
  const data = primarySearch.data?.Employees?.length > 0 ? primarySearch.data : fallbackSearch.data;
  const employee = data?.Employees?.[0];

  const [, , clearSuccessData] = Digit.Hooks.useSessionStorage("EMPLOYEE_HRMS_MUTATION_SUCCESS_DATA", false);
  const [, setMutationHappened] = Digit.Hooks.useSessionStorage("EMPLOYEE_HRMS_MUTATION_HAPPENED", false);
  const [, , clearError] = Digit.Hooks.useSessionStorage("EMPLOYEE_HRMS_ERROR_DATA", false);
  const [mappingData, setMappingData] = useState([]);
  const [mappingLoading, setMappingLoading] = useState(false);
  const [showToast, setShowToast] = useState(null);
  const [pageOffset, setPageOffset] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  // The mapping API returns no total, so only "is there another page" is known
  const [hasNextPage, setHasNextPage] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Fetch MDMS data for BPA Category and SubCategory
  const { data: mdmsDataBPA, isLoading: isBPALoading } = Digit.Hooks.useCommonMDMS(stateId, "BPA", ["Category", "SubCategory"]);
  const { obpsRoles } = Digit.Hooks.hrms.useOBPSRoles(stateId);
  const obpsRoleMap = useMemo(() => obpsRoles?.map || {}, [obpsRoles]);

  const categoryMap = useMemo(() => {
    const map = {};
    (mdmsDataBPA?.BPA?.Category || []).forEach((cat) => {
      map[cat.categoryId] = cat.categoryName;
      if (cat.code) map[cat.code] = cat.categoryName;
    });
    return map;
  }, [mdmsDataBPA]);

  const subCategoryMap = useMemo(() => {
    const map = {};
    (mdmsDataBPA?.BPA?.SubCategory || []).forEach((sub) => {
      map[sub.subCategoryId] = sub.subCategoryName;
      if (sub.code) map[sub.code] = sub.subCategoryName;
    });
    return map;
  }, [mdmsDataBPA]);

  // Same roles for all mappings, since they belong to the employee
  const employeeRoleNames = useMemo(() => {
    const roles = (employee?.user?.roles || []).filter((role) => obpsRoleMap[role.code]).map((role) => obpsRoleMap[role.code]);
    return roles.length > 0 ? roles.join(", ") : "No OBPS Roles";
  }, [employee, obpsRoleMap]);

  useEffect(() => {
    setMutationHappened(false);
    clearSuccessData();
    clearError();
  }, []);

  const fetchMappingData = useCallback(async () => {
    if (!userUUID) {
      return;
    }

    try {
      setMappingLoading(true);
      const response = await requestMappings({
        userUUID,
        tenantId,
        userTenantId: employee?.user?.tenantId || profileTenantId,
        offset: pageOffset,
        limit: pageSize,
      });

      if (response?.Employees) {
        const transformedData = response.Employees.map((emp, index) => ({
          id: emp.uuid || emp.id,
          displayId: String(pageOffset + index + 1),
          employeeUUID: emp.uuid,
          userUUID: emp.userUUID,
          category: categoryMap[emp.category] || emp.category || "N/A",
          subCategory: subCategoryMap[emp.subcategory] || emp.subcategory || "N/A",
          ward: emp.assignedTenantId || "N/A",
          zone: emp.zone || "N/A",
          roles: employeeRoleNames,
        }));
        setMappingData(transformedData);
        // A full page means there may be more; a short page is the last one
        setHasNextPage(response.Employees.length >= pageSize);
      } else {
        setMappingData([]);
        setHasNextPage(false);
      }
    } catch (error) {
      console.error("Error fetching mapping data:", error);
      setMappingData([]);
      setHasNextPage(false);
    } finally {
      setMappingLoading(false);
    }
  }, [userUUID, tenantId, profileTenantId, employee, pageOffset, pageSize, employeeRoleNames, categoryMap, subCategoryMap]);

  useEffect(() => {
    fetchMappingData();
  }, [fetchMappingData, refreshCounter]);

  const fetchPrevPage = () => {
    setPageOffset((prevState) => prevState - pageSize);
  };

  const fetchNextPage = () => {
    setPageOffset((prevState) => prevState + pageSize);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setPageOffset(0);
  };

  const deleteMappings = async (mappings) => {
    const payload = {
      Employees: mappings.map((mapping) => ({
        tenantId,
        uuid: mapping.uuid,
      })),
    };
    return Digit.HRMSService.DeleteEmpMapping(tenantId, payload);
  };

  const showDeleteResult = (response, successLabel, failureLabel) => {
    if (response?.ResponseInfo?.status === "successful") {
      setRefreshCounter((prev) => prev + 1);
      setShowToast({ key: true, label: successLabel });
    } else {
      setShowToast({ key: true, label: failureLabel, error: true });
    }
  };

  const showDeleteError = (error, failureLabel) => {
    setShowToast({
      key: true,
      label: error?.response?.data?.Errors?.[0]?.message || failureLabel,
      error: true,
    });
  };

  // Collects every mapping of the employee across all API pages, not just the one on screen
  const fetchAllMappings = async () => {
    const allMappings = [];
    for (let batch = 0; batch < MAX_MAPPING_BATCHES; batch++) {
      const response = await requestMappings({
        userUUID,
        tenantId,
        userTenantId: employee?.user?.tenantId || profileTenantId,
        offset: batch * MAPPING_BATCH_SIZE,
        limit: MAPPING_BATCH_SIZE,
      });
      const mappings = response?.Employees || [];
      allMappings.push(...mappings);
      if (mappings.length < MAPPING_BATCH_SIZE) break;
    }
    return allMappings;
  };

  const handleDeleteAll = async () => {
    if (!window.confirm("Are you sure you want to delete ALL mappings for this employee?")) {
      return;
    }
    try {
      setMappingLoading(true);
      const allMappings = await fetchAllMappings();
      if (allMappings.length === 0) {
        setShowToast({ key: true, label: "No mappings to delete", error: true });
        return;
      }
      const response = await deleteMappings(allMappings.map((mapping) => ({ uuid: mapping.uuid })));
      showDeleteResult(response, "All mappings deleted successfully!", "Failed to delete mappings");
    } catch (error) {
      showDeleteError(error, "Failed to delete mappings");
    } finally {
      setMappingLoading(false);
    }
  };

  const handleDelete = useCallback(
    async (mappingUuid) => {
      if (!window.confirm(t("HR_CONFIRM_DELETE_MAPPING") || "Are you sure you want to delete this mapping?")) {
        return;
      }
      try {
        setMappingLoading(true);
        const response = await deleteMappings([{ uuid: mappingUuid }]);
        showDeleteResult(response, "Mapping deleted successfully!", "Failed to delete mapping");
      } catch (error) {
        showDeleteError(error, "Failed to delete mapping");
      } finally {
        setMappingLoading(false);
      }
    },
    [tenantId]
  );

  const mappingColumns = useMemo(
    () => [
      {
        Header: t("HR_CATEGORY_LABEL"),
        accessor: "category",
        Cell: ({ value }) => <span className="hrms-badge hrms-badge--category">{value}</span>,
      },
      {
        Header: t("HR_SUB_CATEGORY_LABEL"),
        accessor: "subCategory",
        Cell: ({ value }) => <span className="hrms-badge hrms-badge--subcategory">{value}</span>,
      },
      {
        Header: t("HR_ZONE_LABEL"),
        accessor: "zone",
        Cell: ({ value }) => <span className="hrms-badge hrms-badge--zone">{value}</span>,
      },
      {
        Header: t("HR_ROLES_LABEL") || "Role(s)",
        accessor: "roles",
        Cell: ({ value }) => {
          if (!value || value === "No OBPS Roles") {
            return <span className="hrms-text-secondary">{value || "No OBPS Roles"}</span>;
          }
          return (
            <div className="hrms-badge-container">
              {value.split(", ").map((role, idx) => (
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
          <button onClick={() => handleDelete(row.original.employeeUUID)} className="hrms-btn hrms-btn--delete" disabled={mappingLoading}>
            {t("COMMON_DELETE")}
          </button>
        ),
      },
    ],
    [t, handleDelete, mappingLoading]
  );

  if (isLoading || isBPALoading) {
    return <Loader />;
  }

  const currentPage = Math.floor(pageOffset / pageSize);

  return (
    <React.Fragment>
      <div className="hrms-emp-mapping__header">
        <Header>{t("HR_NEW_EMPLOYEE_FORM_HEADER")}</Header>
      </div>
      {isError || (!employee && mappingData.length === 0) ? (
        <div className="hrms-emp-mapping__no-data">
          <p>{t("HR_NO_EMPLOYEE_FOUND")}</p>
        </div>
      ) : (
        <div>
          <Card>
            {employee && (
              <>
                <StatusTable>
                  <Row
                    label={<CardSubHeader className="card-section-header">{t("HR_EMP_STATUS_LABEL")} </CardSubHeader>}
                    text={employee.isActive ? <div className="sla-cell-success"> {t("ACTIVE")} </div> : <div className="sla-cell-error">{t("INACTIVE")}</div>}
                    textStyle={{ fontWeight: "bold", maxWidth: "7.5rem" }}
                  />
                </StatusTable>
                <CardSubHeader className="card-section-header">{t("HR_PERSONAL_DETAILS_FORM_HEADER")} </CardSubHeader>
                <StatusTable>
                  <Row label={t("HR_NAME_LABEL")} text={employee.user?.name || "NA"} textStyle={{ whiteSpace: "pre" }} />
                  <Row label={t("HR_MOB_NO_LABEL")} text={employee.user?.mobileNumber || "NA"} textStyle={{ whiteSpace: "pre" }} />
                  <Row label={t("HR_GENDER_LABEL")} text={t(employee.user?.gender) || "NA"} />
                  <Row label={t("HR_EMAIL_LABEL")} text={employee.user?.emailId || "NA"} />
                  <Row label={t("HR_CORRESPONDENCE_ADDRESS_LABEL")} text={employee.user?.correspondenceAddress || "NA"} />
                </StatusTable>
                <CardSubHeader className="card-section-header">{t("HR_NEW_EMPLOYEE_FORM_HEADER")}</CardSubHeader>
                <StatusTable>
                  <Row
                    label={t("HR_EMPLOYMENT_TYPE_LABEL")}
                    text={t(employee.employeeType ? `EGOV_HRMS_EMPLOYEETYPE_${employee.employeeType}` : "NA")}
                    textStyle={{ whiteSpace: "pre" }}
                  />
                  <Row
                    label={t("HR_APPOINTMENT_DATE_LABEL")}
                    text={convertEpochFormateToDate(employee.dateOfAppointment) || "NA"}
                    textStyle={{ whiteSpace: "pre" }}
                  />
                  <Row label={t("HR_EMPLOYEE_ID_LABEL")} text={employee.code} />
                </StatusTable>
              </>
            )}

            {/* Employee Mapping Table */}
            <div className="hrms-flex hrms-flex--between hrms-flex--center hrms-spacing--mapping-header">
              <CardSubHeader className="card-section-header">{t("HR_EMPLOYEE_CATEGORY_ZONE_MAPPING")}</CardSubHeader>

              {/* Page Size Selector */}
              {mappingData.length > 0 && (
                <div className="hrms-page-size">
                  <span className="hrms-text--secondary">{`${t("COMMON_ROWS_PER_PAGE")}:`}</span>
                  <select value={pageSize} onChange={handlePageSizeChange} className="hrms-select">
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
                <button onClick={handleDeleteAll} disabled={mappingLoading} className={`hrms-btn hrms-btn--primary ${mappingLoading ? "disabled" : ""}`}>
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
                              <span key={idx} className="hrms-badge hrms-badge--role">
                                {role}
                              </span>
                            ))
                          ) : (
                            <span className="hrms-text-secondary">No OBPS Roles</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(mapping.employeeUUID)}
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
                  {t("COMMON_SHOWING")} {pageOffset + 1} {t("COMMON_TO")} {pageOffset + mappingData.length}
                </div>

                <div className="hrms-flex hrms-flex--gap-10 hrms-flex--center">
                  <button onClick={fetchPrevPage} disabled={pageOffset === 0} className={`hrms-btn hrms-btn--pagination ${pageOffset === 0 ? "disabled" : ""}`}>
                    ← {t("COMMON_PREVIOUS")}
                  </button>

                  <span className="hrms-text--secondary">
                    {t("COMMON_PAGE")} {currentPage + 1}
                  </span>

                  <button onClick={fetchNextPage} disabled={!hasNextPage} className={`hrms-btn hrms-btn--pagination ${!hasNextPage ? "disabled" : ""}`}>
                    {t("COMMON_NEXT")} →
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && <Toast error={showToast.error} label={showToast.label} onClose={() => setShowToast(null)} isDleteBtn />}
    </React.Fragment>
  );
};

export default HRMSEMPMAPDetails;

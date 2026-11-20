import React, { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { Header, Toast, Loader, Card } from "@mseva/digit-ui-react-components";
import JurisdictionFilter from "../../components/JurisdictionFilter";
import JurisdictionTable from "../../components/JurisdictionTable";
import { JurisdictionService } from "../../services/jurisdictionService";
import { getLocalizedError } from "../../constants";

/**
 * Main Jurisdiction Management Search & Results Page
 * Allows searching employees by ULB and other criteria per TRD JUR-01 through JUR-05.
 * Clicking any employee row or 'Manage' opens their dedicated details route.
 */
const JurisdictionManagement = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { data: allTenants = [] } = Digit.Hooks.useTenants();

  // Restore cached search results from SessionStorage if user navigated back
  const cachedSearch = Digit.SessionStorage.get("JUR_SEARCH_CACHE");
  const [employees, setEmployees] = useState(cachedSearch?.employees || []);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(cachedSearch?.hasSearched || false);
  const [currentSearchUlb, setCurrentSearchUlb] = useState(cachedSearch?.currentSearchUlb || null);

  // Notification Toast state
  const [toast, setToast] = useState(null);

  // Auto-dismiss Toast after 4 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Handle Search Submission
  const handleSearch = useCallback(async (filterPayload) => {
    setIsSearching(true);
    setHasSearched(true);
    setCurrentSearchUlb(filterPayload.selectedULB);

    try {
      const result = await JurisdictionService.searchEmployees(
        filterPayload.selectedULB,
        filterPayload
      );
      const resultsList = result.employees || [];
      setEmployees(resultsList);

      // Cache search results so navigating back restores the table instantly
      Digit.SessionStorage.set("JUR_SEARCH_CACHE", {
        employees: resultsList,
        hasSearched: true,
        currentSearchUlb: filterPayload.selectedULB,
        filterPayload,
      });
    } catch (err) {
      setToast({
        key: true,
        label: err?.message || "ERR_FETCHING_EMPLOYEES",
      });
      setEmployees([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    Digit.SessionStorage.del("JUR_SEARCH_CACHE");
    setEmployees([]);
    setHasSearched(false);
    setCurrentSearchUlb(null);
  }, []);

  // Navigate to dedicated employee jurisdiction details route
  const handleSelectEmployee = useCallback((emp) => {
    const targetTenant =
      emp.tenantId ||
      currentSearchUlb ||
      emp?.jurisdictions?.[0]?.boundary ||
      emp?.jurisdictions?.[0]?.tenantId ||
      Digit.ULBService.getCurrentTenantId();

    history.push({
      pathname: `/digit-ui/employee/transferAppointment/jurisdiction/details/${targetTenant}/${emp.code}`,
      state: { employee: emp },
    });
  }, [history, currentSearchUlb]);

  return (
    <div
      className="ground-container"
      style={{
        padding: "1rem 1.5rem",
        maxWidth: "100%",
        boxSizing: "border-box",
        overflowX: "hidden",
      }}
    >
      <style>{`
        .ground-container .employeeCard,
        .ground-container .card,
        .employeeCard-override {
          margin-left: 0 !important;
          margin-right: 0 !important;
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
      `}</style>
      <Header>{t("JUR_PAGE_HEADER") || "Transfer & Appointment: Jurisdiction Management"}</Header>

      {/* Search Filter Card (JUR-01, JUR-02, JUR-03) */}
      <JurisdictionFilter
        onSearch={handleSearch}
        onReset={handleReset}
        isSearching={isSearching}
        initialValues={cachedSearch?.filterPayload}
      />

      {/* Symmetric Centered Search Loader */}
      {isSearching && (
        <Card
          className="employeeCard-override"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "3rem 1.5rem",
            marginTop: "1rem",
            marginLeft: 0,
            marginRight: 0,
            width: "100%",
            textAlign: "center",
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
          }}
        >
          <Loader />
          <p
            style={{
              marginTop: "1.25rem",
              color: "#505a5f",
              fontWeight: 600,
              fontSize: "1rem",
            }}
          >
            {t("JUR_SEARCHING_EMPLOYEES") || "Searching employees and jurisdictions... Please wait."}
          </p>
        </Card>
      )}

      {/* Results Table (JUR-04, JUR-05) */}
      {!isSearching && (
        <JurisdictionTable
          employees={employees}
          hasSearched={hasSearched}
          isLoading={isSearching}
          onSelectEmployee={handleSelectEmployee}
          allTenants={allTenants}
        />
      )}

      {/* Auto-dismissing Toast notification */}
      {toast && (
        <Toast
          error={toast.key}
          label={toast.key ? getLocalizedError(toast.label, t) : t(toast.label)}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default JurisdictionManagement;

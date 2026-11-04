import React, { useEffect, useState } from "react";
import { Card, CardLabel, Dropdown, Header, Loader } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";

const displayValue = (value) => {
  if (Array.isArray(value)) return value.map(displayValue).join(", ") || "-";
  if (value && typeof value === "object") return value.name || value.code || "-";
  return value === null || value === undefined || value === "" ? "-" : String(value);
};

const EmployeeModuleMappings = () => {
  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();
  const [selectedModule, setSelectedModule] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exportError, setExportError] = useState("");
  const [exporting, setExporting] = useState(false);
  const { data, isLoading: modulesLoading, isError: modulesError } = Digit.Hooks.useCustomMDMS(stateId, "common-masters", [{ name: "obpasmodules" }]);
  const modules = data?.["common-masters"]?.obpasmodules || [];

  useEffect(() => {
    let active = true;
    setEmployees([]);
    setError("");
    setExportError("");
    if (!selectedModule?.code || !tenantId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const search = async () => {
      try {
        const response = await Digit.HRMSService.SearchEmpMap(tenantId, { modulename: selectedModule.code });
        if (!active) return;
        if (response?.Errors?.length) throw new Error(response.Errors[0].message || "Unable to load employee mappings");
        setEmployees(Array.isArray(response?.Employees) ? response.Employees : []);
      } catch (err) {
        if (active) setError(err?.response?.data?.Errors?.[0]?.message || err.message || "Unable to load employee mappings");
      } finally {
        if (active) setLoading(false);
      }
    };
    search();
    return () => {
      active = false;
    };
  }, [selectedModule?.code, tenantId]);

  const headers = ["Employee Id", "Roles", "Category", "Sub-category", "Zone", "Assigned ULB"].map((label) => t(label));
  const rows = employees.map((employee) => [
    employee.uuid || employee.employeeCode,
    employee.roles || employee.user?.roles || employee.role,
    employee.categories || employee.category,
    employee.subcategories || employee.subcategory,
    employee.zones || employee.zone,
    employee.assignedTenantId || employee.tenantId,
  ].map(displayValue));

  const downloadRecords = async (format) => {
    if (!rows.length || loading || exporting) return;
    setExportError("");
    setExporting(true);
    try {
      const moduleCode = String(selectedModule?.code || "module").replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 10);
      const filename = `${moduleCode}_Mappings_${new Date().toISOString().slice(0, 10)}`;
      if (format === "pdf") {
        await Digit.Download.TablePDF(`${t("Employee mappings")} - ${selectedModule.name || selectedModule.code}`, headers, rows, filename);
      } else {
        await Digit.Download.Excel(rows.map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index]]))), filename);
      }
    } catch (err) {
      setExportError(t("Unable to download records. Please try again."));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <Header>{t("Employee Module Mappings")}</Header>
      <Card>
        <div style={{ maxWidth: 420 }}>
          <CardLabel>{t("Module")}</CardLabel>
          <Dropdown
            t={t}
            option={modules}
            optionKey="name"
            selected={selectedModule}
            select={setSelectedModule}
            placeholder={t("Select Module")}
            disabled={modulesLoading}
          />
        </div>
        {modulesLoading && <p role="status">{t("Loading modules...")}</p>}
        {modulesError && <p role="alert">{t("Unable to load modules. Please reload the page.")}</p>}
        {!selectedModule && <p>{t("Select a module to view employee mappings.")}</p>}
      </Card>
      {loading ? (
        <Loader />
      ) : error ? (
        <Card>
          <p role="alert">{error}</p>
        </Card>
      ) : (
        selectedModule && (
          <Card>
            <h2>
              {t("Employee mappings")} ({employees.length})
            </h2>
            {employees.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, margin: "16px 0" }}>
                <button type="button" className="submit-bar" style={{ width: "auto", padding: "10px 18px", margin: 0 }} disabled={exporting} onClick={() => downloadRecords("pdf")}>{t("Download PDF")}</button>
                <button type="button" className="submit-bar" style={{ width: "auto", padding: "10px 18px", margin: 0 }} disabled={exporting} onClick={() => downloadRecords("excel")}>{t("Download Excel")}</button>
                {exporting && <span role="status">{t("Preparing download...")}</span>}
              </div>
            )}
            {exportError && <p role="alert">{exportError}</p>}
            {!employees.length ? (
              <p>{t("No employee mappings found for this module.")}</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="table" style={{ width: "100%" }}>
                  <thead>
                    <tr>
                      {headers.map((label) => (
                        <th key={label}>{label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => (
                      <tr key={employees[index].id || `${employees[index].uuid || employees[index].code}-${index}`}>
                        {row.map((value, columnIndex) => <td key={columnIndex}>{value}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {/* <p>{t("Showing records returned by the API.")}</p> */}
          </Card>
        )
      )}
    </div>
  );
};

export default EmployeeModuleMappings;

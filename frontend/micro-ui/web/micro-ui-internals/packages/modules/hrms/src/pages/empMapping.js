import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Header,
  Card,
  CardLabel,
  Dropdown,
  Toast,
  Modal,
  CardLabelError,
  Loader,
} from "@mseva/digit-ui-react-components";
import MultiSelectDropdown from "../components/MultiSelectDropdown";
import CloseBtn from "../components/common/CloseBtn";
import MappingTable from "../components/empMapping/MappingTable";
import PaginationControls from "../components/empMapping/PaginationControls";
import {
  PRIMARY_COLOR,
  getEmployeeOBPSRoles,
  addSelectAllOption,
  handleSelectAllLogic,
  filterSelectAll,
  createMappingCombinations,
  transformMappingData,
  calculatePagination,
  LINEAR_BLUE_GRADIENT
} from "../utils/empMappingUtils";

const EmpMaping = () => {
  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();
  const isMobile = window.Digit.Utils.browser.isMobile();

  // Search Filter States
  const [filterULB, setFilterULB] = useState(null);
  const [filterEmployee, setFilterEmployee] = useState(null);
  const [filterCategory, setFilterCategory] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Modal Form States
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedULB, setSelectedULB] = useState(null);
  const [formData, setFormData] = useState({
    employeeCode: null,
    designationCode: null,
    roleNames: "",
    category: [],
    subCategory: [],
    zone: [],
  });
  const [formErrors, setFormErrors] = useState({});
  const [mappingsToCreate, setMappingsToCreate] = useState([]);

  // Data States
  const [loading, setLoading] = useState(false);
  const [mappingData, setMappingData] = useState([]);
  const [searchEmployeeList, setSearchEmployeeList] = useState([]);

  // Pagination States
  const [pageOffset, setPageOffset] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // UI States
  const [showToast, setShowToast] = useState(null);
  const [modalToast, setModalToast] = useState(null);

  // Fetch MDMS data for categories and subcategories
  const { data: mdmsDataBPA, isLoading: isBPALoading } = Digit.Hooks.useCommonMDMS(stateId, "BPA", ["Category", "SubCategory"]);
  const { data: ulbs } = Digit.Hooks.useTenants();

  // Custom Hooks from HRMS
  const { obpsRoles } = Digit.Hooks.hrms.useOBPSRoles(stateId);
  const { employeeList: modalEmployeeList } = Digit.Hooks.hrms.useEmployeeList(selectedULB, obpsRoles.codes);
  const { zones: modalZones } = Digit.Hooks.hrms.useZones(stateId, selectedULB);

  // Fetch search employee list separately
  useEffect(() => {
    if (!filterULB || obpsRoles.codes.length === 0) {
      setSearchEmployeeList([]);
      setFilterEmployee(null);
      return;
    }

    const fetchEmployees = async () => {
      try {
        const response = await Digit.HRMSService.search(filterULB.code, {
          tenantId: filterULB.code,
          roles: obpsRoles.codes.join(','),
          limit: 100,
          offset: 0,
        });

        if (response?.Employees) {
          const employeeOptions = response.Employees.map((emp) => ({
            code: emp.code,
            name: `${emp.user?.name || emp.code} (${emp.assignments?.[0]?.designation || "N/A"})`,
            uuid: emp.uuid,
            department: emp.assignments?.[0]?.department || "N/A",
            employeeObj: emp,
          }));
          setSearchEmployeeList(employeeOptions);
        }
      } catch (error) {
        setSearchEmployeeList([]);
      }
    };

    fetchEmployees();
  }, [filterULB, obpsRoles.codes]);

  // Process categories with sorting
  const categories = useMemo(() => {
    if (!mdmsDataBPA?.BPA?.Category) return [];
    return mdmsDataBPA.BPA.Category.filter((cat) => cat.active)
      .map((cat) => ({
        code: cat.categoryId,
        name: cat.categoryName,
        categoryId: cat.categoryId,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [mdmsDataBPA]);

  // Process subcategories with sorting
  const allSubCategories = useMemo(() => {
    if (!mdmsDataBPA?.BPA?.SubCategory) return [];
    return mdmsDataBPA.BPA.SubCategory.filter((sub) => sub.active).sort((a, b) =>
      a.subCategoryName.localeCompare(b.subCategoryName)
    );
  }, [mdmsDataBPA]);

  // Filter subcategories based on selected categories
  const filteredSubCategories = useMemo(() => {
    if (!formData.category?.length || !allSubCategories.length) return [];

    const selectedCategoryIds = formData.category.map((cat) => cat.categoryId);
    return allSubCategories
      .filter((sub) => selectedCategoryIds.includes(sub.categoryId))
      .map((sub) => ({
        code: sub.subCategoryId,
        name: sub.subCategoryName,
        subCategoryId: sub.subCategoryId,
        categoryId: sub.categoryId,
      }));
  }, [formData.category, allSubCategories]);

  // Add "Select All" to all dropdown options
  const categoriesWithSelectAll = useMemo(() => addSelectAllOption(categories), [categories]);
  const filteredSubCategoriesWithSelectAll = useMemo(() => addSelectAllOption(filteredSubCategories), [filteredSubCategories]);
  const modalZonesWithSelectAll = useMemo(() => addSelectAllOption(modalZones), [modalZones]);
  const ulbList = useMemo(() => ulbs || [], [ulbs]);

  // When employee is selected, set designationCode and roleNames
  const handleEmployeeSelect = (employee) => {
    let designation = "";
    let roleNames = "No OBPS Roles";
    
    if (employee && employee.employeeObj) {
      if (employee.employeeObj.assignments && employee.employeeObj.assignments.length > 0) {
        designation = employee.employeeObj.assignments[0].designation || "";
      }
      roleNames = getEmployeeOBPSRoles(employee.employeeObj, obpsRoles.map);
    }
    
    setFormData({
      ...formData,
      employeeCode: employee,
      designationCode: designation,
      roleNames: roleNames,
    });
    setFormErrors({ ...formErrors, employeeCode: null });
  };

  // Auto-deselect invalid subcategories when categories change
  useEffect(() => {
    if (formData.category?.length > 0 && formData.subCategory?.length > 0) {
      const selectedCategoryIds = formData.category.map((cat) => cat.categoryId);
      const validSubCategories = formData.subCategory.filter((subCat) =>
        selectedCategoryIds.includes(subCat.categoryId)
      );

      if (validSubCategories.length !== formData.subCategory.length) {
        setFormData((prev) => ({ ...prev, subCategory: validSubCategories }));
      }
    }
  }, [formData.category]);

  // Fetch employee mappings with pagination and filters
  const fetchMappingData = async () => {
    if (!filterULB) {
      setShowToast({ key: true, label: "Please select a ULB to search", error: true });
      return;
    }

    try {
      setLoading(true);

      const filters = { limit: pageSize, offset: pageOffset };
      if (filterEmployee) filters.codes = filterEmployee.code;
      if (filterCategory) filters.categories = filterCategory.name;

      const response = await Digit.HRMSService.SearchEmpMap(filterULB.code, filters);

      if (response?.Employees) {
        const transformedData = transformMappingData(response.Employees, pageOffset);
        const { totalRecords: calculatedTotal } = calculatePagination(transformedData.length, pageSize, pageOffset);
        
        setMappingData(transformedData);
        setTotalRecords(calculatedTotal);
      } else {
        setMappingData([]);
        setTotalRecords(0);
      }
    } catch (error) {
      setShowToast({ key: true, label: "Failed to load employee data", error: true });
    } finally {
      setLoading(false);
    }
  };

  // Refetch data when pagination changes
  useEffect(() => {
    if (hasSearched) fetchMappingData();
  }, [pageOffset, pageSize]);

  // Reset employee and zone when ULB changes in modal
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      employeeCode: null,
      zone: [],
    }));
  }, [selectedULB]);

  // Search handler
  const handleSearch = async () => {
    if (!filterULB) {
      setShowToast({ key: true, label: "Please select a ULB to search", error: true });
      return;
    }
    setPageOffset(0);
    setHasSearched(true);
    await fetchMappingData();
  };

  // Clear filters handler
  const handleClearFilters = () => {
    setFilterULB(null);
    setFilterEmployee(null);
    setFilterCategory(null);
    setSearchEmployeeList([]);
    setMappingData([]);
    setTotalRecords(0);
    setPageOffset(0);
    setHasSearched(false);
  };

  // Modal handlers
  const handleAddNew = () => {
    setFormData({ employeeCode: null, category: [], subCategory: [], zone: [] });
    setFormErrors({});
    setMappingsToCreate([]);
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setFormData({ employeeCode: null, category: [], subCategory: [], zone: [] });
    setFormErrors({});
    setMappingsToCreate([]);
    setModalToast(null);
  };

  // Add mappings to preview list (cartesian product)
  const handleAddToList = () => {
    if (!formData.employeeCode) {
      setModalToast({ key: true, label: "Please select an employee", error: true });
      return;
    }
    
    const actualCategories = filterSelectAll(formData.category);
    const actualSubCategories = filterSelectAll(formData.subCategory);
    const actualZones = filterSelectAll(formData.zone);

    if (!actualCategories.length) {
      setModalToast({ key: true, label: "Please select at least one category", error: true });
      return;
    }
    if (!actualSubCategories.length) {
      setModalToast({ key: true, label: "Please select at least one sub-category", error: true });
      return;
    }
    if (!actualZones.length) {
      setModalToast({ key: true, label: "Please select at least one zone", error: true });
      return;
    }

    const newMappings = createMappingCombinations(
      formData.employeeCode, 
      formData.category, 
      formData.subCategory, 
      formData.zone
    );

    setMappingsToCreate((prev) => [...prev, ...newMappings]);
    setFormData((prev) => ({ employeeCode: prev.employeeCode, roleNames: prev.roleNames, category: [], subCategory: [], zone: [] }));
    setModalToast({ key: true, label: `${newMappings.length} mapping(s) added to list` });
  };

  const handleRemoveFromList = (mappingId) => {
    setMappingsToCreate((prev) => prev.filter((m) => m.id !== mappingId));
  };

  const handleClearList = () => {
    setMappingsToCreate([]);
  };

  // Submit all mappings
  const handleAddSubmit = async () => {
    if (!mappingsToCreate.length) {
      setModalToast({ key: true, label: "Please add at least one mapping to the list", error: true });
      return;
    }
    if (!selectedULB) {
      setModalToast({ key: true, label: "Please select a ULB first", error: true });
      return;
    }

    try {
      setLoading(true);

      const payload = {
        Employees: mappingsToCreate.map((mapping) => ({
          tenantId: selectedULB.code,
          userUUID: mapping.employeeUUID,
          category: mapping.category.name,
          subcategory: mapping.subCategory.name,
          zone: mapping.zone.code,
          assignedTenantId: selectedULB.code.split(".")[0],
        })),
      };

      const response = await Digit.HRMSService.CreateEmpMapping(selectedULB.code, payload);

      if (response?.ResponseInfo?.status === "successful" || response?.Employees?.length > 0) {
        closeAddModal();
        setShowToast({ key: true, label: `${mappingsToCreate.length} mapping(s) created successfully!` });
        if (hasSearched) await fetchMappingData();
      } else {
        setModalToast({ key: true, label: "Failed to create employee mappings", error: true });
      }
    } catch (error) {
      setModalToast({
        key: true,
        label: error?.response?.data?.Errors?.[0]?.message || "Failed to create employee mappings",
        error: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Multi-select handler with "Select All" logic
  const handleSelectWithAll = (selectedItems, allItems, field) => {
    const newSelection = handleSelectAllLogic(selectedItems, allItems, formData[field]);
    setFormData((prev) => ({ ...prev, [field]: newSelection }));
    setFormErrors((prev) => ({ ...prev, [field]: null }));
  };

  // Pagination handlers
  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setPageOffset(0);
  };

  const { currentPage, totalPages } = calculatePagination(mappingData.length, pageSize, pageOffset);

  if (isBPALoading || loading) return <Loader />;

  return (
    <React.Fragment>
      <div className="ground-container" style={{ padding: isMobile ? "10px" : "20px" }}>
        <Header style={{ marginLeft: isMobile ? "1vw" : "15px", color: "#FF0000" }}>
          {t("HR_EMPLOYEE_CATEGORY_ZONE_MAPPING")}
        </Header>

        {/* Search Filters */}
        <Card style={{ marginTop: "20px" }}>
          <h3 style={{ margin: "0 0 20px 0", fontSize: "18px", fontWeight: "600" }}>
            {t("COMMON_SEARCH_FILTERS") || "Search Filters"}
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
              gap: "16px",
            }}
          >
            <div>
              <CardLabel>
                {t("HR_ULB_LABEL") || "ULB"} <span style={{ color: "red" }}>*</span>
              </CardLabel>
              <Dropdown
                t={t}
                option={ulbList}
                optionKey="name"
                selected={filterULB}
                select={setFilterULB}
                placeholder={t("COMMON_SELECT_ULB") || "Select ULB"}
              />
            </div>

            <div>
              <CardLabel>{t("HR_EMPLOYEE_CODE")}</CardLabel>
              <Dropdown
                t={t}
                option={searchEmployeeList}
                optionKey="name"
                selected={filterEmployee}
                select={setFilterEmployee}
                placeholder={t("COMMON_SELECT_EMPLOYEE") || "Select Employee"}
                disabled={!filterULB}
              />
            </div>

            <div>
              <CardLabel>{t("HR_CATEGORY_LABEL")}</CardLabel>
              <Dropdown
                t={t}
                option={categories}
                optionKey="name"
                selected={filterCategory}
                select={setFilterCategory}
                placeholder={t("COMMON_SELECT_CATEGORY")}
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "20px",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={handleSearch}
                disabled={!filterULB}
                style={{
                  background: filterULB ? LINEAR_BLUE_GRADIENT : "#ccc",
                  color: "white",
                  border: "none",
                  padding: "10px 24px",
                  borderRadius: "4px",
                  cursor: filterULB ? "pointer" : "not-allowed",
                  fontWeight: "500",
                  fontSize: "14px",
                  opacity: filterULB ? 1 : 0.6,
                }}
              >
                {t("COMMON_SEARCH")}
              </button>

              <button
                onClick={handleClearFilters}
                disabled={!filterULB && !filterEmployee && !filterCategory}
                style={{
                  backgroundColor: "white",
                  color: LINEAR_BLUE_GRADIENT,
                  border: `1px solid ${LINEAR_BLUE_GRADIENT}`,
                  padding: "10px 24px",
                  borderRadius: "4px",
                  cursor: !filterULB && !filterEmployee && !filterCategory ? "not-allowed" : "pointer",
                  fontWeight: "500",
                  fontSize: "14px",
                  opacity: !filterULB && !filterEmployee && !filterCategory ? 0.5 : 1,
                }}
              >
                {t("COMMON_CLEAR_FILTERS") || "Clear Filters"}
              </button>
            </div>

            <button
              onClick={handleAddNew}
              style={{
                background: "linear-gradient(135deg, #2563eb, #1e40af)",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              + {t("HR_ADD_NEW_MAPPING")}
            </button>
          </div>
        </Card>

        {/* Results Table */}
        <Card style={{ marginTop: "20px" }}>
          <div
            style={{
              marginBottom: "15px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>
              {t("HR_MAPPING_RESULTS")} ({totalRecords})
            </h3>
          </div>

          <MappingTable 
            t={t}
            mappingData={mappingData}
            hasSearched={hasSearched}
            filterULB={filterULB}
            tenantId={tenantId}
          />

          {/* Pagination */}
          {hasSearched && mappingData.length > 0 && (
            <PaginationControls
              t={t}
              pageOffset={pageOffset}
              pageSize={pageSize}
              totalRecords={totalRecords}
              currentPage={currentPage}
              totalPages={totalPages}
              onPrevious={() => setPageOffset((prev) => prev - pageSize)}
              onNext={() => setPageOffset((prev) => prev + pageSize)}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </Card>

        {/* Add Mapping Modal */}
        {showAddModal && (
          <Modal
            headerBarMain={<h2 style={{ fontSize: "20px", fontWeight: "600", margin: 0 }}>{t("HR_ADD_NEW_MAPPING")}</h2>}
            headerBarEnd={<CloseBtn onClick={closeAddModal} />}
            actionCancelLabel={t("COMMON_CANCEL")}
            actionCancelOnSubmit={closeAddModal}
            actionSaveLabel={`${t("COMMON_SUBMIT")} ${mappingsToCreate.length > 0 ? `(${mappingsToCreate.length})` : ""}`}
            actionSaveOnSubmit={handleAddSubmit}
            formId="add-mapping-form"
            popupStyles={{ width: "900px", maxHeight: "90vh" }}
          >
            <div style={{ padding: "20px", maxHeight: "calc(90vh - 150px)", overflowY: "auto" }}>
              {/* Modal Toast for Errors */}
              {modalToast && (
                <div
                  style={{
                    background: modalToast.error ? "#ffeaea" : "#eaffea",
                    color: modalToast.error ? "#d4351c" : "#0d6759",
                    padding: "12px 16px",
                    borderRadius: "6px",
                    marginBottom: "16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontWeight: "500",
                    fontSize: "14px",
                  }}
                >
                  <span>{modalToast.label}</span>
                  <button
                    onClick={() => setModalToast(null)}
                    style={{
                      background: "none",
                      border: "none",
                      color: modalToast.error ? "#d4351c" : "#0d6759",
                      cursor: "pointer",
                      fontSize: "18px",
                      fontWeight: "bold",
                      padding: "0 8px",
                    }}
                  >
                    ✖
                  </button>
                </div>
              )}

              {/* ULB Selection */}
              <div style={{ marginBottom: "20px" }}>
                <CardLabel>
                  {t("ULB_CODE")} <span style={{ color: "red" }}>*</span>
                </CardLabel>
                <Dropdown
                  t={t}
                  option={ulbList}
                  optionKey="name"
                  selected={selectedULB}
                  select={setSelectedULB}
                  placeholder={t("COMMON_SELECT_ULB") || "Select ULB"}
                />
              </div>

              {/* Employee Selection */}
              <div style={{ marginBottom: "20px" }}>
                <CardLabel>
                  {t("HR_EMPLOYEE_CODE")} <span style={{ color: "red" }}>*</span>
                </CardLabel>
                <Dropdown
                  t={t}
                  option={modalEmployeeList}
                  optionKey="name"
                  selected={formData.employeeCode}
                  select={handleEmployeeSelect}
                  placeholder={t("COMMON_SELECT_EMPLOYEE")}
                />
                {formErrors.employeeCode && <CardLabelError>{formErrors.employeeCode}</CardLabelError>}
              </div>
              
              {/* Designation  */}
              {/* <div style={{ marginBottom: "20px" }}>
                <CardLabel>
                  {t("HR_DESIGNATION_CODE")} <span style={{ color: "red" }}>*</span>
                </CardLabel>
                <input
                  type="text"
                  value={formData.designationCode}
                  readOnly
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    background: "#f9f9f9",
                    fontSize: "14px",
                  }}
                />
                {formErrors.designationCode && <CardLabelError>{formErrors.designationCode}</CardLabelError>}
              </div> */}

              {/* Role(s) - Read-only */}
              <div style={{ marginBottom: "20px" }}>
                <CardLabel>
                  {t("HR_ROLES_LABEL") || "Role(s)"}
                </CardLabel>
                <input
                  type="text"
                  value={formData.roleNames || "No OBPS Roles"}
                  readOnly
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    background: "#f9f9f9",
                    fontSize: "14px",
                  }}
                />
              </div>

              {/* Category Multi-Select */}
              <div style={{ marginBottom: "20px" }}>
                <CardLabel>
                  {t("HR_CATEGORY_LABEL")} <span style={{ color: "red" }}>*</span>
                </CardLabel>
                <MultiSelectDropdown
                  options={categoriesWithSelectAll}
                  optionsKey="name"
                  selected={formData.category}
                  onSelect={(items) => handleSelectWithAll(items, categories, "category")}
                  defaultLabel={t("COMMON_SELECT_CATEGORY") || "Select Categories"}
                  defaultUnit={t("HR_CATEGORIES_SELECTED") || "selected"}
                />
                {formErrors.category && <CardLabelError>{formErrors.category}</CardLabelError>}
              </div>

              {/* Sub-Category Multi-Select */}
              <div style={{ marginBottom: "20px" }}>
                <CardLabel>
                  {t("HR_SUB_CATEGORY_LABEL")} <span style={{ color: "red" }}>*</span>
                </CardLabel>
                <MultiSelectDropdown
                  options={filteredSubCategoriesWithSelectAll}
                  optionsKey="name"
                  selected={formData.subCategory}
                  onSelect={(items) => handleSelectWithAll(items, filteredSubCategories, "subCategory")}
                  defaultLabel={
                    formData.category?.length > 0
                      ? t("COMMON_SELECT_SUB_CATEGORY") || "Select Sub-Categories"
                      : t("HR_SELECT_CATEGORY_FIRST") || "Select category first"
                  }
                  defaultUnit={t("HR_SUB_CATEGORIES_SELECTED") || "selected"}
                />
                {formErrors.subCategory && <CardLabelError>{formErrors.subCategory}</CardLabelError>}
              </div>

              {/* Zone Multi-Select */}
              <div style={{ marginBottom: "20px" }}>
                <CardLabel>
                  {t("HR_ZONE_LABEL")} <span style={{ color: "red" }}>*</span>
                </CardLabel>
                <MultiSelectDropdown
                  options={modalZonesWithSelectAll}
                  optionsKey="name"
                  selected={formData.zone}
                  onSelect={(items) => handleSelectWithAll(items, modalZones, "zone")}
                  defaultLabel={t("COMMON_SELECT_ZONE") || "Select Zones"}
                  defaultUnit={t("HR_ZONES_SELECTED") || "selected"}
                />
                {formErrors.zone && <CardLabelError>{formErrors.zone}</CardLabelError>}
              </div>

              {/* Add to List Button */}
              <div style={{ marginTop: "20px", marginBottom: "20px" }}>
                <button
                  onClick={handleAddToList}
                  style={{
                    padding: "10px 24px",
                    background: LINEAR_BLUE_GRADIENT,
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "14px",
                  }}
                >
                  + {t("HR_ADD_TO_LIST") || "Add to List"}
                </button>
              </div>

              {/* Preview Table */}
              {mappingsToCreate.length > 0 && (
                <div style={{ marginTop: "20px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "10px",
                    }}
                  >
                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>
                      {t("HR_MAPPINGS_TO_CREATE") || "Mappings to Create"} ({mappingsToCreate.length})
                    </h3>
                    <button
                      onClick={handleClearList}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#f3f3f3",
                        border: "1px solid #d6d5d5",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "13px",
                        color: "#505A5F",
                      }}
                    >
                      {t("COMMON_CLEAR_ALL") || "Clear All"}
                    </button>
                  </div>

                  <div
                    style={{
                      maxHeight: "300px",
                      overflow: "auto",
                      border: "1px solid #d6d5d5",
                      borderRadius: "4px",
                    }}
                  >
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead style={{ backgroundColor: "#f3f3f3", position: "sticky", top: 0 }}>
                        <tr>
                          <th
                            style={{
                              padding: "10px",
                              textAlign: "left",
                              borderBottom: "1px solid #d6d5d5",
                              fontSize: "13px",
                            }}
                          >
                            {t("HR_EMPLOYEE_CODE")}
                          </th>
                          <th
                            style={{
                              padding: "10px",
                              textAlign: "left",
                              borderBottom: "1px solid #d6d5d5",
                              fontSize: "13px",
                            }}
                          >
                            {t("HR_CATEGORY_LABEL")}
                          </th>
                          <th
                            style={{
                              padding: "10px",
                              textAlign: "left",
                              borderBottom: "1px solid #d6d5d5",
                              fontSize: "13px",
                            }}
                          >
                            {t("HR_SUB_CATEGORY_LABEL")}
                          </th>
                          <th
                            style={{
                              padding: "10px",
                              textAlign: "left",
                              borderBottom: "1px solid #d6d5d5",
                              fontSize: "13px",
                            }}
                          >
                            {t("HR_ZONE_LABEL")}
                          </th>
                          <th
                            style={{
                              padding: "10px",
                              textAlign: "center",
                              borderBottom: "1px solid #d6d5d5",
                              fontSize: "13px",
                            }}
                          >
                            {t("COMMON_ACTION")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {mappingsToCreate.map((mapping, index) => (
                          <tr key={mapping.id} style={{ backgroundColor: index % 2 === 0 ? "white" : "#f9f9f9" }}>
                            <td style={{ padding: "10px", borderBottom: "1px solid #f0f0f0", fontSize: "13px" }}>
                              {mapping.employeeCode}
                            </td>
                            <td style={{ padding: "10px", borderBottom: "1px solid #f0f0f0", fontSize: "13px" }}>
                              {mapping.category.name}
                            </td>
                            <td style={{ padding: "10px", borderBottom: "1px solid #f0f0f0", fontSize: "13px" }}>
                              {mapping.subCategory.name}
                            </td>
                            <td style={{ padding: "10px", borderBottom: "1px solid #f0f0f0", fontSize: "13px" }}>
                              {mapping.zone.name}
                            </td>
                            <td style={{ padding: "10px", borderBottom: "1px solid #f0f0f0", textAlign: "center" }}>
                              <button
                                onClick={() => handleRemoveFromList(mapping.id)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "#D4351C",
                                  cursor: "pointer",
                                  fontSize: "13px",
                                  fontWeight: "500",
                                }}
                              >
                                {t("COMMON_DELETE")}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </Modal>
        )}

        {/* Toast Notification */}
        {showToast && <Toast error={showToast.error} label={showToast.label} onClose={() => setShowToast(null)} isDleteBtn />}
      </div>
    </React.Fragment>
  );
};

export default EmpMaping;

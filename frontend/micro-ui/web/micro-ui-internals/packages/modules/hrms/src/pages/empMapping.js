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
  getEmployeeOBPSRoles,
  addSelectAllOption,
  handleSelectAllLogic,
  filterSelectAll,
  createMappingCombinations,
  transformMappingData,
  calculatePagination,
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
          category: mapping.category.categoryId,
          subcategory: mapping.subCategory.subCategoryId,
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
      <div className="hrms-emp-mapping__container">
        <Header className="hrms-emp-mapping__header">
          {t("HR_EMPLOYEE_CATEGORY_ZONE_MAPPING")}
        </Header>

        {/* Search Filters */}
        <Card className="hrms-emp-mapping__search-card">
          <h3 className="hrms-emp-mapping__search-heading">
            {t("COMMON_SEARCH_FILTERS") || "Search Filters"}
          </h3>
          <div className="hrms-emp-mapping__filter-grid">

            <div>
              <CardLabel>
                {t("HR_ULB_LABEL") || "ULB"} <span className="hrms-emp-mapping__required-asterisk">*</span>
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

          <div className="hrms-emp-mapping__button-container">
            <div className="hrms-emp-mapping__action-buttons">
              <button
                onClick={handleSearch}
                disabled={!filterULB}
                className={`hrms-emp-mapping__search-button ${!filterULB ? 'hrms-emp-mapping__search-button--disabled' : ''}`}
              >
                {t("COMMON_SEARCH")}
              </button>

              <button
                onClick={handleClearFilters}
                disabled={!filterULB && !filterEmployee && !filterCategory}
                className={`hrms-emp-mapping__clear-button ${!filterULB && !filterEmployee && !filterCategory ? 'hrms-emp-mapping__clear-button--disabled' : ''}`}
              >
                {t("COMMON_CLEAR_FILTERS") || "Clear Filters"}
              </button>
            </div>

            <button
              onClick={handleAddNew}
              className="hrms-emp-mapping__add-button"
            >
              + {t("HR_ADD_NEW_MAPPING")}
            </button>
          </div>
        </Card>

        {/* Results Table */}
        <Card className="hrms-emp-mapping__results-card">
          <h3 className="hrms-emp-mapping__results-heading">
            {t("HR_MAPPING_RESULTS")} ({totalRecords})
          </h3>

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
            headerBarMain={<h2 className="hrms-emp-mapping__modal-header">{t("HR_ADD_NEW_MAPPING")}</h2>}
            headerBarEnd={<CloseBtn onClick={closeAddModal} />}
            actionCancelLabel={t("COMMON_CANCEL")}
            actionCancelOnSubmit={closeAddModal}
            actionSaveLabel={`${t("COMMON_SUBMIT")} ${mappingsToCreate.length > 0 ? `(${mappingsToCreate.length})` : ""}`}
            actionSaveOnSubmit={handleAddSubmit}
            formId="add-mapping-form"
            popupStyles={{ width: "900px", maxHeight: "90vh" }}
          >
            <div className="hrms-emp-mapping__modal-content">
              {/* Modal Toast for Errors */}
              {modalToast && (
                <div className={`hrms-emp-mapping__toast ${modalToast.error ? 'hrms-emp-mapping__toast--error' : 'hrms-emp-mapping__toast--success'}`}>
                  <span className="hrms-emp-mapping__toast-message">{modalToast.label}</span>
                  <button
                    onClick={() => setModalToast(null)}
                    className="hrms-emp-mapping__toast-close-btn"
                  >
                    ✖
                  </button>
                </div>
              )}

              {/* ULB Selection */}
              <div className="hrms-emp-mapping__form-group">
                <CardLabel className="hrms-emp-mapping__label">
                  {t("ULB_CODE")} <span className="hrms-emp-mapping__required-asterisk">*</span>
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
              <div className="hrms-emp-mapping__form-group">
                <CardLabel className="hrms-emp-mapping__label">
                  {t("HR_EMPLOYEE_CODE")} <span className="hrms-emp-mapping__required-asterisk">*</span>
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
              <div className="hrms-emp-mapping__form-group">
                <CardLabel className="hrms-emp-mapping__label">
                  {t("HR_ROLES_LABEL") || "Role(s)"}
                </CardLabel>
                <input
                  type="text"
                  value={formData.roleNames || "No OBPS Roles"}
                  readOnly
                  className="hrms-emp-mapping__input"
                  disabled
                />
              </div>

              {/* Category Multi-Select */}
              <div className="hrms-emp-mapping__form-group">
                <CardLabel className="hrms-emp-mapping__label">
                  {t("HR_CATEGORY_LABEL")} <span className="hrms-emp-mapping__required-asterisk">*</span>
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
              <div className="hrms-emp-mapping__form-group">
                <CardLabel className="hrms-emp-mapping__label">
                  {t("HR_SUB_CATEGORY_LABEL")} <span className="hrms-emp-mapping__required-asterisk">*</span>
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
              <div className="hrms-emp-mapping__form-group">
                <CardLabel className="hrms-emp-mapping__label">
                  {t("HR_ZONE_LABEL")} <span className="hrms-emp-mapping__required-asterisk">*</span>
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
              <div className="hrms-emp-mapping__form-group">
                <button
                  onClick={handleAddToList}
                  className="hrms-emp-mapping__add-to-list-button"
                >
                  + {t("HR_ADD_TO_LIST") || "Add to List"}
                </button>
              </div>

              {/* Preview Table */}
              {mappingsToCreate.length > 0 && (
                <div className="hrms-emp-mapping__preview-section">
                  <div className="hrms-emp-mapping__preview-header">
                    <h3 className="hrms-emp-mapping__preview-heading">
                      {t("HR_MAPPINGS_TO_CREATE") || "Mappings to Create"} ({mappingsToCreate.length})
                    </h3>
                    <button
                      onClick={handleClearList}
                      className="hrms-emp-mapping__clear-list-button"
                    >
                      {t("COMMON_CLEAR_ALL") || "Clear All"}
                    </button>
                  </div>

                  <div className="hrms-emp-mapping__preview-table-wrapper">
                    <table className="hrms-emp-mapping__preview-table">
                      <thead>
                        <tr>
                          <th>{t("HR_EMPLOYEE_CODE")}</th>
                          <th>{t("HR_CATEGORY_LABEL")}</th>
                          <th>{t("HR_SUB_CATEGORY_LABEL")}</th>
                          <th>{t("HR_ZONE_LABEL")}</th>
                          <th>{t("COMMON_ACTION")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mappingsToCreate.map((mapping, index) => (
                          <tr key={mapping.id}>
                            <td>{mapping.employeeCode}</td>
                            <td>{mapping.category.name}</td>
                            <td>{mapping.subCategory.name}</td>
                            <td>{mapping.zone.name}</td>
                            <td className="hrms-emp-mapping__table-action-cell">
                              <button
                                onClick={() => handleRemoveFromList(mapping.id)}
                                className="hrms-btn hrms-btn--delete"
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

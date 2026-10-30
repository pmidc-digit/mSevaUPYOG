import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Header, Card, CardLabel, Dropdown, Toast, Modal, CardLabelError, Loader } from "@mseva/digit-ui-react-components";
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

const MODAL_TOAST_DURATION = 5000;
const EMPLOYEE_BATCH_SIZE = 100;
// Upper bound on batches, so a misbehaving API cannot make the employee list load forever
const MAX_EMPLOYEE_BATCHES = 50;

const emptyForm = () => ({
  employeeCode: null,
  designationCode: null,
  roleNames: "",
  category: [],
  subCategory: [],
  zone: [],
  module: [],
  role: [],
});

const toEmployeeOption = (emp) => ({
  code: emp.code,
  name: `${emp.user?.name || emp.code} (${emp.code}) (${emp.assignments?.[0]?.designation || "N/A"})`,
  uuid: emp.uuid,
  department: emp.assignments?.[0]?.department || "N/A",
  employeeObj: emp,
});

// Collects every employee with the given roles, not just the first API page
const fetchAllEmployees = async (tenantCode, roleCodes) => {
  const allEmployees = [];
  for (let batch = 0; batch < MAX_EMPLOYEE_BATCHES; batch++) {
    const response = await Digit.HRMSService.search(tenantCode, {
      tenantId: tenantCode,
      roles: roleCodes.join(","),
      limit: EMPLOYEE_BATCH_SIZE,
      offset: batch * EMPLOYEE_BATCH_SIZE,
    });
    const employees = response?.Employees || [];
    allEmployees.push(...employees);
    if (employees.length < EMPLOYEE_BATCH_SIZE) break;
  }
  return allEmployees;
};

const EmpMaping = () => {
  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();

  // Search Filter States
  const [filterULB, setFilterULB] = useState(null);
  const [filterEmployee, setFilterEmployee] = useState(null);
  const [filterCategory, setFilterCategory] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Modal Form States
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedULB, setSelectedULB] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [mappingsToCreate, setMappingsToCreate] = useState([]);

  // Data States
  const [loading, setLoading] = useState(false);
  const [rawEmployees, setRawEmployees] = useState([]);
  const [searchEmployeeList, setSearchEmployeeList] = useState([]);

  // Pagination States
  const [pageOffset, setPageOffset] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // UI States
  const [showToast, setShowToast] = useState(null);
  const [modalToast, setModalToast] = useState(null);
  const toastTimer = useRef(null);

  const showModalToast = (toast) => {
    setModalToast(toast);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setModalToast(null), MODAL_TOAST_DURATION);
  };

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  // Fetch MDMS data for categories and subcategories
  const { data: mdmsDataBPA, isLoading: isBPALoading } = Digit.Hooks.useCommonMDMS(stateId, "BPA", ["Category", "SubCategory"]);
  const { data: ulbs } = Digit.Hooks.useTenants();

  // Custom Hooks from HRMS
  const { obpsRoles } = Digit.Hooks.hrms.useOBPSRoles(stateId);
  const { employeeList: modalEmployeeList } = Digit.Hooks.hrms.useEmployeeList(selectedULB, obpsRoles.codes);
  const { zones: filterZones } = Digit.Hooks.hrms.useZones(stateId, filterULB);
  const { zones: modalZones } = Digit.Hooks.hrms.useZones(stateId, selectedULB || filterULB);

  // modules and roles are read for the state, not a hardcoded tenant
  const { data: moduleNames = [] } = Digit.Hooks.useCustomMDMS(stateId, "common-masters", [{ name: "obpasmodules" }]);
  const { data: roleGroups = [] } = Digit.Hooks.useCustomMDMS(stateId, "ACCESSCONTROL-ROLES", [{ name: "roleGroups" }]);
  const { data: roles = [] } = Digit.Hooks.useCustomMDMS(stateId, "ACCESSCONTROL-ROLES", [{ name: "roles" }]);

  // Fetch search employee list separately
  useEffect(() => {
    if (!filterULB || obpsRoles.codes.length === 0) {
      setSearchEmployeeList([]);
      setFilterEmployee(null);
      return;
    }

    // Ignore a response that arrives after the ULB has changed again
    let ignore = false;
    fetchAllEmployees(filterULB.code, obpsRoles.codes)
      .then((employees) => {
        if (!ignore) setSearchEmployeeList(employees.map(toEmployeeOption));
      })
      .catch(() => {
        if (!ignore) setSearchEmployeeList([]);
      });
    return () => {
      ignore = true;
    };
  }, [filterULB, obpsRoles.codes]);

  // Sync filterEmployee reference when searchEmployeeList updates
  useEffect(() => {
    if (filterEmployee && searchEmployeeList.length > 0) {
      const match = searchEmployeeList.find((e) => e.code === filterEmployee.code || e.uuid === filterEmployee.uuid);
      if (match && match !== filterEmployee) {
        setFilterEmployee(match);
      }
    }
  }, [searchEmployeeList]);

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
    return mdmsDataBPA.BPA.SubCategory.filter((sub) => sub.active).sort((a, b) => a.subCategoryName.localeCompare(b.subCategoryName));
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

  const handleRoles = (data) => {
    const selectedModules = filterSelectAll(data);
    const groups = roleGroups?.["ACCESSCONTROL-ROLES"]?.roleGroups || [];
    const selectedGroups = groups.filter((group) => selectedModules.some((module) => module.code === group.groupCode));
    const rolesData = roles?.["ACCESSCONTROL-ROLES"]?.roles || [];
    return rolesData.filter((role) => selectedGroups.some((group) => group.groupId === role.groupId));
  };

  const filteredRoles = useMemo(() => handleRoles(formData.module), [formData.module, roleGroups, roles]);
  const rolesWithSelectAll = useMemo(() => addSelectAllOption(filteredRoles), [filteredRoles]);

  useEffect(() => {
    setFormData((prev) => {
      const validRoles = filterSelectAll(prev.role).filter((role) => filteredRoles.some((option) => option.code === role.code));
      const nextRoles = validRoles.length && validRoles.length === filteredRoles.length ? addSelectAllOption(validRoles) : validRoles;
      if (nextRoles.length === prev.role.length && nextRoles.every((role, index) => role.code === prev.role[index].code)) return prev;
      return { ...prev, role: nextRoles };
    });
  }, [filteredRoles]);

  // Lookup maps for human-readable names and grouping
  const categoryMap = useMemo(() => {
    if (!mdmsDataBPA?.BPA?.Category) return {};
    const map = {};
    mdmsDataBPA.BPA.Category.forEach((cat) => {
      map[cat.categoryId] = cat.categoryName;
      if (cat.code) map[cat.code] = cat.categoryName;
    });
    return map;
  }, [mdmsDataBPA]);

  const subCategoryMap = useMemo(() => {
    if (!mdmsDataBPA?.BPA?.SubCategory) return {};
    const map = {};
    mdmsDataBPA.BPA.SubCategory.forEach((sub) => {
      map[sub.subCategoryId] = sub.subCategoryName;
      if (sub.code) map[sub.code] = sub.subCategoryName;
    });
    return map;
  }, [mdmsDataBPA]);

  const zoneMap = useMemo(() => {
    const map = {};
    (filterZones || []).forEach((z) => {
      if (z.code) map[z.code] = z.name;
    });
    (modalZones || []).forEach((z) => {
      if (z.code) map[z.code] = z.name;
    });
    return map;
  }, [filterZones, modalZones]);

  const employeeMap = useMemo(() => {
    const map = {};
    (searchEmployeeList || []).forEach((emp) => {
      if (emp.uuid) map[emp.uuid] = emp;
      if (emp.code) map[emp.code] = emp;
    });
    (modalEmployeeList || []).forEach((emp) => {
      if (emp.uuid) map[emp.uuid] = emp;
      if (emp.code) map[emp.code] = emp;
    });
    return map;
  }, [searchEmployeeList, modalEmployeeList]);

  // Derived mapping table data and pagination
  const mappingData = useMemo(() => {
    return transformMappingData(rawEmployees, pageOffset, categoryMap, subCategoryMap, zoneMap, employeeMap);
  }, [rawEmployees, pageOffset, categoryMap, subCategoryMap, zoneMap, employeeMap]);

  // Counted on the raw API rows, since grouping by employee can make the table shorter than the page
  const { currentPage, hasNextPage } = useMemo(() => {
    return calculatePagination(rawEmployees.length, pageSize, pageOffset);
  }, [rawEmployees.length, pageSize, pageOffset]);

  // Add "Select All" to all dropdown options
  const categoriesWithSelectAll = useMemo(() => addSelectAllOption(categories), [categories]);
  const filteredSubCategoriesWithSelectAll = useMemo(() => addSelectAllOption(filteredSubCategories), [filteredSubCategories]);
  const modalZonesWithSelectAll = useMemo(() => addSelectAllOption(modalZones), [modalZones]);
  const modulesWithSelectAll = useMemo(() => addSelectAllOption(moduleNames?.["common-masters"]?.obpasmodules), [
    moduleNames?.["common-masters"]?.obpasmodules,
  ]);
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

    setFormData((prev) => ({
      ...prev,
      employeeCode: employee,
      designationCode: designation,
      roleNames: roleNames,
    }));
    setFormErrors((prev) => ({ ...prev, employeeCode: null }));
  };

  // Auto-deselect invalid subcategories when categories change
  useEffect(() => {
    if (formData.category?.length > 0 && formData.subCategory?.length > 0) {
      const selectedCategoryIds = formData.category.map((cat) => cat.categoryId);
      const validSubCategories = formData.subCategory.filter((subCat) => selectedCategoryIds.includes(subCat.categoryId));

      if (validSubCategories.length !== formData.subCategory.length) {
        setFormData((prev) => ({ ...prev, subCategory: validSubCategories }));
      }
    }
  }, [formData.category]);

  // Fetch employee mappings with pagination and filters
  const fetchMappingData = async (overrideParams = {}) => {
    const activeULB = overrideParams.filterULB || filterULB;
    const activeEmployee = overrideParams.hasOwnProperty("filterEmployee") ? overrideParams.filterEmployee : filterEmployee;
    const activeCategory = overrideParams.hasOwnProperty("filterCategory") ? overrideParams.filterCategory : filterCategory;
    const activeOffset = typeof overrideParams.pageOffset === "number" ? overrideParams.pageOffset : pageOffset;
    const activePageSize = typeof overrideParams.pageSize === "number" ? overrideParams.pageSize : pageSize;

    if (!activeULB) {
      setShowToast({ key: true, label: "Please select a ULB to search", error: true });
      return;
    }

    try {
      setLoading(true);

      const searchTenantId = activeEmployee?.employeeObj?.user?.tenantId || activeULB.code;
      const filters = { limit: activePageSize, offset: activeOffset, assignedTenantId: activeULB.code };
      if (activeEmployee) {
        const empUUID = activeEmployee.uuid || activeEmployee.userUUID;
        if (empUUID) filters.userUUID = empUUID;
      }
      if (activeCategory) {
        filters.category = activeCategory.categoryId || activeCategory.code;
      }

      const response = await Digit.HRMSService.SearchEmpMap(searchTenantId, filters);
      setRawEmployees(response?.Employees || []);
    } catch (error) {
      setShowToast({ key: true, label: "Failed to load employee data", error: true });
      setRawEmployees([]);
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
    setHasSearched(true);
    if (pageOffset === 0) {
      await fetchMappingData({ pageOffset: 0 });
    } else {
      // Moving to page 1 changes pageOffset, and the pagination effect fetches it
      setPageOffset(0);
    }
  };

  // Clear filters handler
  const handleClearFilters = () => {
    setFilterULB(null);
    setFilterEmployee(null);
    setFilterCategory(null);
    setSearchEmployeeList([]);
    setRawEmployees([]);
    setPageOffset(0);
    setHasSearched(false);
  };

  // Modal handlers
  const handleAddNew = () => {
    if (filterULB && !selectedULB) {
      setSelectedULB(filterULB);
    }
    setFormData(emptyForm());
    setFormErrors({});
    setMappingsToCreate([]);
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setFormData(emptyForm());
    setFormErrors({});
    setMappingsToCreate([]);
    setModalToast(null);
  };

  // Add mappings to preview list (cartesian product)
  const handleAddToList = () => {
    if (!formData.employeeCode) {
      showModalToast({ key: true, label: "Please select an employee", error: true });
      return;
    }

    const actualCategories = filterSelectAll(formData.category);
    const actualSubCategories = filterSelectAll(formData.subCategory);
    const actualZones = filterSelectAll(formData.zone);
    const actualModules = filterSelectAll(formData.module);
    const actualRoles = filterSelectAll(formData.role);
    const groups = roleGroups?.["ACCESSCONTROL-ROLES"]?.roleGroups || [];

    const failedCheck = [
      [!actualCategories.length, "Please select at least one category"],
      [!actualSubCategories.length, "Please select at least one sub-category"],
      [!actualZones.length, "Please select at least one zone"],
      [!actualModules.length, "Please select at least one module"],
      [!actualRoles.length, "Please select at least one role"],
      [
        actualModules.some((module) => !actualRoles.some((role) => groups.some((group) => group.groupCode === module.code && group.groupId === role.groupId))),
        "Please select at least one role for each selected module",
      ],
    ].find(([isInvalid]) => isInvalid);
    if (failedCheck) {
      showModalToast({ key: true, label: failedCheck[1], error: true });
      return;
    }

    const newMappings = createMappingCombinations(
      formData.employeeCode,
      formData.category,
      formData.subCategory,
      formData.zone,
      formData.module,
      formData.role,
      groups
    );

    setMappingsToCreate((prev) => [...prev, ...newMappings]);
    setFormData((prev) => ({
      employeeCode: prev.employeeCode,
      roleNames: prev.roleNames,
      category: [],
      subCategory: [],
      zone: [],
      module: [],
      role: [],
    }));
    showModalToast({ key: true, label: `${newMappings.length} mapping(s) added to list` });
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
      showModalToast({ key: true, label: "Please add at least one mapping to the list", error: true });
      return;
    }
    if (!selectedULB) {
      showModalToast({ key: true, label: "Please select a ULB first", error: true });
      return;
    }

    try {
      setLoading(true);

      const payload = {
        Employees: mappingsToCreate?.map((mapping) => ({
          tenantId: mapping?.employeeInfo?.employeeObj?.user?.tenantId || selectedULB.code,
          userUUID: mapping.employeeUUID,
          category: mapping.category.categoryId,
          subcategory: mapping.subCategory.subCategoryId,
          zone: mapping.zone.code,
          modulename: mapping?.module?.code,
          roles: mapping.role.code,
          assignedTenantId: selectedULB.code,
        })),
      };

      const response = await Digit.HRMSService.CreateEmpMapping(selectedULB.code, payload);

      if (response?.ResponseInfo?.status === "successful" || response?.Employees?.length > 0) {
        const mappedULB = selectedULB;
        const mappedEmployee = formData.employeeCode || mappingsToCreate[0]?.employeeInfo;
        const count = mappingsToCreate.length;

        closeAddModal();
        setShowToast({ key: true, label: `${count} mapping(s) created successfully!` });

        setFilterULB(mappedULB);
        setFilterEmployee(mappedEmployee || null);
        setFilterCategory(null);
        setPageOffset(0);
        setHasSearched(true);

        await fetchMappingData({
          filterULB: mappedULB,
          filterEmployee: mappedEmployee || null,
          filterCategory: null,
          pageOffset: 0,
        });
      } else {
        showModalToast({ key: true, label: "Failed to create employee mappings", error: true });
      }
    } catch (error) {
      showModalToast({
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
    const newSelection = handleSelectAllLogic(selectedItems, allItems || [], formData[field]);
    setFormData((prev) => ({ ...prev, [field]: newSelection }));
    setFormErrors((prev) => ({ ...prev, [field]: null }));
    return newSelection;
  };

  // Pagination handlers
  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setPageOffset(0);
  };

  // Only the first load shows a full-page loader, so the filters and the open modal stay mounted during searches
  if (isBPALoading) return <Loader />;

  return (
    <React.Fragment>
      <div className="hrms-emp-mapping__container">
        <Header className="hrms-emp-mapping__header">{t("HR_EMPLOYEE_CATEGORY_ZONE_MAPPING")}</Header>

        {/* Search Filters */}
        <Card className="hrms-emp-mapping__search-card">
          <h3 className="hrms-emp-mapping__search-heading">{t("COMMON_SEARCH_FILTERS")}</h3>
          <div className="hrms-emp-mapping__filter-grid">
            <div>
              <CardLabel>
                {t("HR_ULB_LABEL")} <span className="hrms-emp-mapping__required-asterisk">*</span>
              </CardLabel>
              <Dropdown
                t={t}
                option={ulbList}
                optionKey="name"
                selected={filterULB}
                select={(ulb) => {
                  setFilterULB(ulb);
                  setFilterEmployee(null);
                }}
                placeholder={t("COMMON_SELECT_ULB")}
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
                placeholder={t("COMMON_SELECT_EMPLOYEE")}
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
                className={`hrms-emp-mapping__search-button ${!filterULB ? "hrms-emp-mapping__search-button--disabled" : ""}`}
              >
                {t("COMMON_SEARCH")}
              </button>

              <button
                onClick={handleClearFilters}
                disabled={!filterULB && !filterEmployee && !filterCategory}
                className={`hrms-emp-mapping__clear-button ${
                  !filterULB && !filterEmployee && !filterCategory ? "hrms-emp-mapping__clear-button--disabled" : ""
                }`}
              >
                {t("COMMON_CLEAR_FILTERS")}
              </button>
            </div>

            <button onClick={handleAddNew} className="hrms-emp-mapping__add-button">
              + {t("HR_ADD_NEW_MAPPING")}
            </button>
          </div>
        </Card>

        {/* Results Table */}
        <Card className="hrms-emp-mapping__results-card">
          <h3 className="hrms-emp-mapping__results-heading">
            {t("HR_MAPPING_RESULTS")} ({mappingData.length})
          </h3>

          {loading ? (
            <Loader />
          ) : (
            <MappingTable t={t} mappingData={mappingData} hasSearched={hasSearched} filterULB={filterULB} tenantId={tenantId} />
          )}

          {/* Pagination */}
          {hasSearched && mappingData.length > 0 && (
            <PaginationControls
              t={t}
              pageOffset={pageOffset}
              pageSize={pageSize}
              rowCount={mappingData.length}
              currentPage={currentPage}
              hasNextPage={hasNextPage}
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
                  placeholder={t("COMMON_SELECT_ULB")}
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

              {/* Role(s) - Read-only */}
              <div className="hrms-emp-mapping__form-group">
                <CardLabel className="hrms-emp-mapping__label">{t("HR_ROLES_LABEL")}</CardLabel>
                <input type="text" value={formData.roleNames || "No OBPS Roles"} readOnly className="hrms-emp-mapping__input" disabled />
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
                  defaultLabel={t("COMMON_SELECT_CATEGORY")}
                  defaultUnit={t("HR_CATEGORIES_SELECTED")}
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
                  defaultLabel={formData.category?.length > 0 ? t("COMMON_SELECT_SUB_CATEGORY") : t("HR_SELECT_CATEGORY_FIRST")}
                  defaultUnit={t("HR_SUB_CATEGORIES_SELECTED")}
                />
                {formErrors.subCategory && <CardLabelError>{formErrors.subCategory}</CardLabelError>}
              </div>

              {/* Module Multi-Select */}
              <div className="hrms-emp-mapping__form-group">
                <CardLabel className="hrms-emp-mapping__label">
                  {t("Module")} <span className="hrms-emp-mapping__required-asterisk">*</span>
                </CardLabel>
                <MultiSelectDropdown
                  options={modulesWithSelectAll}
                  optionsKey="name"
                  selected={formData.module}
                  onSelect={(items) => {
                    handleSelectWithAll(items, moduleNames?.["common-masters"]?.obpasmodules, "module");
                  }}
                  defaultLabel={t("Select Module")}
                  defaultUnit={t("Module Selected")}
                />
                {formErrors.module && <CardLabelError>{formErrors.module}</CardLabelError>}
              </div>

              {/* Role Multi-Select */}
              <div className="hrms-emp-mapping__form-group">
                <CardLabel className="hrms-emp-mapping__label">
                  {t("Role")} <span className="hrms-emp-mapping__required-asterisk">*</span>
                </CardLabel>
                <MultiSelectDropdown
                  options={rolesWithSelectAll}
                  optionsKey="name"
                  selected={formData.role}
                  onSelect={(items) => handleSelectWithAll(items, filteredRoles, "role")}
                  defaultLabel={t(filterSelectAll(formData.module).length ? "Select Role" : "Select module first")}
                  defaultUnit={t("Roles Selected")}
                />
                {formErrors.role && <CardLabelError>{formErrors.role}</CardLabelError>}
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
                  defaultLabel={t("COMMON_SELECT_ZONE")}
                  defaultUnit={t("HR_ZONES_SELECTED")}
                />
                {formErrors.zone && <CardLabelError>{formErrors.zone}</CardLabelError>}
              </div>

              {/* Modal Toast for Errors */}
              {modalToast && (
                <div className={`hrms-emp-mapping__toast ${modalToast.error ? "hrms-emp-mapping__toast--error" : "hrms-emp-mapping__toast--success"}`}>
                  <span className="hrms-emp-mapping__toast-message">{modalToast.label}</span>
                  <button onClick={() => setModalToast(null)} className="hrms-emp-mapping__toast-close-btn">
                    ✖
                  </button>
                </div>
              )}

              {/* Add to List Button */}
              <div className="hrms-emp-mapping__form-group">
                <button onClick={handleAddToList} className="hrms-emp-mapping__add-to-list-button">
                  + {t("HR_ADD_TO_LIST")}
                </button>
              </div>

              {/* Preview Table */}
              {mappingsToCreate.length > 0 && (
                <div className="hrms-emp-mapping__preview-section">
                  <div className="hrms-emp-mapping__preview-header">
                    <h3 className="hrms-emp-mapping__preview-heading">
                      {t("HR_MAPPINGS_TO_CREATE")} ({mappingsToCreate.length})
                    </h3>
                    <button onClick={handleClearList} className="hrms-emp-mapping__clear-list-button">
                      {t("COMMON_CLEAR_ALL")}
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
                          <th>{t("Module")}</th>
                          <th>{t("Role")}</th>
                          <th>{t("COMMON_ACTION")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mappingsToCreate.map((mapping) => (
                          <tr key={mapping.id}>
                            <td>{mapping.employeeCode}</td>
                            <td>{mapping.category.name}</td>
                            <td>{mapping.subCategory.name}</td>
                            <td>{mapping.zone.name}</td>
                            <td>{mapping.module.name}</td>
                            <td>{mapping.role.name}</td>
                            <td className="hrms-emp-mapping__table-action-cell">
                              <button onClick={() => handleRemoveFromList(mapping.id)} className="hrms-btn hrms-btn--delete">
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

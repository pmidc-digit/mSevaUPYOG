import React, { useState, useMemo, useEffect } from "react";
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

const EmpMaping = ({ hideMappingControls = false, showRoles = false, showExport = false, isJurisdictionSearch = false }) => {
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
  const [showPreviewTable, setShowPreviewTable] = useState(true);
  const [formData, setFormData] = useState({
    employeeCode: null,
    designationCode: null,
    roleNames: "",
    category: [],
    subCategory: [],
    zone: [],
    module: [],
    role: [],
  });
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

  // Fetch MDMS data for categories and subcategories
  const { data: mdmsDataBPA, isLoading: isBPALoading } = Digit.Hooks.useCommonMDMS(stateId, "BPA", ["Category", "SubCategory"]);
  const { data: ulbs } = Digit.Hooks.useTenants();

  // Custom Hooks from HRMS
  const { obpsRoles } = Digit.Hooks.hrms.useOBPSRoles(stateId);
  console.log(obpsRoles,"obpsRoles")
  const { employeeList: modalEmployeeList } = Digit.Hooks.hrms.useEmployeeList(selectedULB, obpsRoles.codes);
  const { zones: filterZones } = Digit.Hooks.hrms.useZones(stateId, filterULB);
  const { zones: modalZones } = Digit.Hooks.hrms.useZones(stateId, selectedULB || filterULB);

  // modules
  const { data: moduleNames = [], isLoading: moduleLoading } = Digit.Hooks.useCustomMDMS("pb", "common-masters", [{ name: "obpasmodules" }]);
  //
  const { data: roleGroups = [], isLoading: roleGroupsLoading } = Digit.Hooks.useCustomMDMS("pb", "ACCESSCONTROL-ROLES", [{ name: "roleGroups" }]);

  const { data: roles = [], isLoading: rolesLoading } = Digit.Hooks.useCustomMDMS("pb", "ACCESSCONTROL-ROLES", [{ name: "roles" }]);

  // Fetch search employee list separately
  useEffect(() => {
    if (!filterULB || (!isJurisdictionSearch && obpsRoles.codes.length === 0)) {
      setSearchEmployeeList([]);
      setFilterEmployee(null);
      return;
    }

    const fetchEmployees = async () => {
      try {
        const response = isJurisdictionSearch
          ? await Digit.HRMSService.search(
              undefined,
              { jurisdiction: filterULB.code, limit: 100, offset: 0 },
              undefined,
              { skipTenantId: true }
            )
          : await Digit.HRMSService.search(filterULB.code, {
              tenantId: filterULB.code,
              roles: obpsRoles.codes.join(","),
              limit: 100,
              offset: 0,
            });

        if (response?.Employees) {
          const employeeOptions = response.Employees.map((emp) => {
            const designation = emp.assignments?.[0]?.designation;
            const department = emp.assignments?.[0]?.department;
            return {
              code: emp.code,
              name: `${emp.user?.name || emp.code} (${emp.code}) (${designation ? t(`COMMON_MASTERS_DESIGNATION_${designation}`) : "N/A"})`,
              uuid: emp.uuid,
              department: department ? `COMMON_MASTERS_DEPARTMENT_${department}` : "N/A",
              employeeObj: emp,
            };
          });
          setSearchEmployeeList(employeeOptions);
        }
      } catch (error) {
        setSearchEmployeeList([]);
      }
    };

    fetchEmployees();
  }, [filterULB, obpsRoles.codes, isJurisdictionSearch]);

  // Sync filterEmployee reference when searchEmployeeList updates
  useEffect(() => {
    if (filterEmployee && searchEmployeeList.length > 0) {
      const match = searchEmployeeList.find(
        (e) => e.code === filterEmployee.code || e.uuid === filterEmployee.uuid
      );
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
    const selectedCategories = filterSelectAll(formData.category);
    if (!selectedCategories.length || !allSubCategories.length) return [];

    const selectedCategoryIds = new Set(selectedCategories.map((cat) => String(cat.categoryId || cat.code)));
    return allSubCategories
      .filter((sub) => selectedCategoryIds.has(String(sub.categoryId)))
      .map((sub) => ({
        code: sub.subCategoryId,
        name: sub.subCategoryName,
        subCategoryId: sub.subCategoryId,
        categoryId: sub.categoryId,
      }));
  }, [formData.category, allSubCategories]);

  // Filter roles based on selected ULB, selected Employee, and selected Module(s)
  const handleRoles = (data, ulb, employeeSelection) => {
    if (!ulb?.code || !employeeSelection?.employeeObj) return [];
    const selectedModules = filterSelectAll(data);
    if (!selectedModules.length) return [];

    const employeeRoleCodesForUlb = new Set(
      (employeeSelection.employeeObj?.user?.roles || [])
        .filter((role) => role?.tenantId === ulb.code)
        .map((role) => role.code)
    );
    if (employeeRoleCodesForUlb.size === 0) return [];

    const groups = roleGroups?.["ACCESSCONTROL-ROLES"]?.roleGroups || [];
    const selectedGroups = groups.filter((group) => selectedModules.some((module) => module.code === group.groupCode));
    const rolesData = roles?.["ACCESSCONTROL-ROLES"]?.roles || [];
    return rolesData.filter(
      (role) =>
        selectedGroups.some((group) => group.groupId === role.groupId) &&
        employeeRoleCodesForUlb.has(role.code)
    );
  };

  const filteredRoles = useMemo(
    () => handleRoles(formData.module, selectedULB, formData.employeeCode),
    [formData.module, selectedULB, formData.employeeCode, roleGroups, roles]
  );
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
    const rows = transformMappingData(rawEmployees, pageOffset, categoryMap, subCategoryMap, zoneMap, employeeMap);
    if (!showRoles && !isJurisdictionSearch) return rows;

    const roleTenantId = filterULB?.code || tenantId;
    return rows.map((row, index) => {
      const employee = isJurisdictionSearch
        ? rawEmployees[index]
        : (employeeMap[row.uuid] || employeeMap[row.employeeCode])?.employeeObj;
      const roles = employee?.user?.roles;
      const roleNames = (Array.isArray(roles) ? roles : [])
        .filter((role) => role?.tenantId === roleTenantId)
        .map((role) => role.name || obpsRoles.map?.[role.code] || role.code)
        .filter(Boolean);

      return {
        ...row,
        ...(isJurisdictionSearch ? { userTenantId: employee?.user?.tenantId || employee?.tenantId } : {}),
        ...(showRoles ? { roleNames: [...new Set(roleNames)].join(", ") || "N/A" } : {}),
      };
    });
  }, [rawEmployees, pageOffset, categoryMap, subCategoryMap, zoneMap, employeeMap, showRoles, isJurisdictionSearch, filterULB?.code, tenantId, obpsRoles.map]);

  const { totalRecords, currentPage, totalPages } = useMemo(() => {
    return calculatePagination(mappingData.length, pageSize, pageOffset);
  }, [mappingData.length, pageSize, pageOffset]);

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

    console.log(employee,"employee")

    if (employee && employee.employeeObj) {
      if (employee.employeeObj.assignments && employee.employeeObj.assignments.length > 0) {
        const empDesignation = employee.employeeObj.assignments[0].designation;
        designation = empDesignation ? t(`COMMON_MASTERS_DESIGNATION_${empDesignation}`) : "";
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
    setFormData((prev) => {
      const validSubCategories = filterSelectAll(prev.subCategory).filter((subCat) =>
        filteredSubCategories.some((option) => String(option.code) === String(subCat.code))
      );
      const nextSubCategories =
        validSubCategories.length && validSubCategories.length === filteredSubCategories.length
          ? addSelectAllOption(validSubCategories)
          : validSubCategories;
      if (
        nextSubCategories.length === prev.subCategory.length &&
        nextSubCategories.every((subCat, index) => String(subCat.code) === String(prev.subCategory[index]?.code))
      ) {
        return prev;
      }
      return { ...prev, subCategory: nextSubCategories };
    });
  }, [filteredSubCategories]);

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

      if (isJurisdictionSearch) {
        const response = await Digit.HRMSService.search(
          undefined,
          {
            jurisdiction: activeULB.code,
            limit: activePageSize,
            offset: activeOffset,
            ...(activeEmployee?.code ? { codes: activeEmployee.code } : {}),
          },
          undefined,
          { skipTenantId: true }
        );
        setRawEmployees(Array.isArray(response?.Employees) ? response.Employees : []);
        return;
      }

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

      if (response?.Employees) {
        setRawEmployees(response.Employees);
      } else {
        setRawEmployees([]);
      }
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
    setPageOffset(0);
    setHasSearched(true);
    await fetchMappingData({ pageOffset: 0 });
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
    if (filterULB) {
      setSelectedULB(filterULB);
    }
    setFormData({
      employeeCode: null,
      designationCode: null,
      roleNames: "",
      category: [],
      subCategory: [],
      zone: [],
      module: [],
      role: [],
    });
    setFormErrors({});
    setMappingsToCreate([]);
    setShowPreviewTable(true);
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setFormData({
      employeeCode: null,
      designationCode: null,
      roleNames: "",
      category: [],
      subCategory: [],
      zone: [],
      module: [],
      role: [],
    });
    setFormErrors({});
    setMappingsToCreate([]);
    setShowPreviewTable(true);
    setModalToast(null);
  };

  // Validation helper for current modal form state
  const validateCurrentForm = (silent = false) => {
    if (!selectedULB) {
      if (!silent) setModalToast({ key: true, label: "Please select a ULB first", error: true });
      return false;
    }
    if (!formData.employeeCode) {
      if (!silent) setModalToast({ key: true, label: "Please select an employee", error: true });
      return false;
    }
    const actualCategories = filterSelectAll(formData.category);
    const actualSubCategories = filterSelectAll(formData.subCategory);
    const actualZones = filterSelectAll(formData.zone);
    const actualModules = filterSelectAll(formData.module);
    const actualRoles = filterSelectAll(formData.role);

    if (!actualCategories.length) {
      if (!silent) setModalToast({ key: true, label: "Please select at least one category", error: true });
      return false;
    }
    if (!actualSubCategories.length) {
      if (!silent) setModalToast({ key: true, label: "Please select at least one sub-category", error: true });
      return false;
    }
    const categoriesMissingSubCategory = actualCategories?.filter((category) => {
      const categoryId = category?.categoryId || category?.code;
      return !actualSubCategories?.some(
        (subCategory) => String(subCategory?.categoryId) === String(categoryId)
      );
    });
    if (categoriesMissingSubCategory?.length) {
      const categoryNames = categoriesMissingSubCategory?.map((category) => category?.name).join(", ");
      setModalToast({
        key: true,
        label: `Select a sub-category for each selected category. Missing for: ${categoryNames}`,
        error: true,
      });
      setTimeout(() => {
        setModalToast(null);
      }, 5000);
      return;
    }
    if (!actualZones.length) {
      if (!silent) setModalToast({ key: true, label: "Please select at least one zone", error: true });
      return false;
    }
    if (!actualModules.length) {
      if (!silent) setModalToast({ key: true, label: "Please select at least one module", error: true });
      return false;
    }
    if (!actualRoles.length) {
      if (!silent) setModalToast({ key: true, label: "Please select at least one role", error: true });
      return false;
    }
    const groups = roleGroups?.["ACCESSCONTROL-ROLES"]?.roleGroups || [];
    if (
      actualModules.some(
        (module) => !actualRoles.some((role) => groups.some((group) => group.groupCode === module.code && group.groupId === role.groupId))
      )
    ) {
      if (!silent) setModalToast({ key: true, label: "Please select at least one role for each selected module", error: true });
      return false;
    }
    return true;
  };

  // Live calculation of mapping combinations from the currently filled form
  const currentFormCombinations = useMemo(() => {
    if (!formData.employeeCode) return [];
    const actualCategories = filterSelectAll(formData.category);
    const actualSubCategories = filterSelectAll(formData.subCategory);
    const actualZones = filterSelectAll(formData.zone);
    const actualModules = filterSelectAll(formData.module);
    const actualRoles = filterSelectAll(formData.role);

    if (!actualCategories.length || !actualSubCategories.length || !actualZones.length || !actualModules.length || !actualRoles.length) {
      return [];
    }
    const groups = roleGroups?.["ACCESSCONTROL-ROLES"]?.roleGroups || [];
    return createMappingCombinations(
      formData.employeeCode,
      formData.category,
      formData.subCategory,
      formData.zone,
      formData.module,
      formData.role,
      groups
    );
  }, [formData, roleGroups]);

  // Combined list for preview: staged mappings + current form combinations
  const allPreviewList = useMemo(() => {
    return [...mappingsToCreate, ...currentFormCombinations];
  }, [mappingsToCreate, currentFormCombinations]);

  const totalEffectiveMappingsCount = allPreviewList.length;
  const previewSectionRef = React.useRef(null);
  const prevPreviewCountRef = React.useRef(0);

  // Auto-scroll preview summary & table into view when combinations first become ready
  useEffect(() => {
    if (prevPreviewCountRef.current === 0 && totalEffectiveMappingsCount > 0) {
      setTimeout(() => {
        previewSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 60);
    }
    prevPreviewCountRef.current = totalEffectiveMappingsCount;
  }, [totalEffectiveMappingsCount]);

  // Add mappings to preview list (stages current combination for adding another set)
  const handleAddToList = () => {
    if (!validateCurrentForm(false)) {
      setTimeout(() => {
        setModalToast(null);
      }, 5000);
      return;
    }

    const groups = roleGroups?.["ACCESSCONTROL-ROLES"]?.roleGroups || [];
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
      ...prev,
      category: [],
      subCategory: [],
      zone: [],
      module: [],
      role: [],
    }));
    setModalToast({ key: false, label: `${newMappings.length} mapping(s) staged successfully! You can add another configuration or click Submit.` });
    setTimeout(() => {
      setModalToast(null);
    }, 5000);
  };

  const handleRemoveFromList = (mappingId) => {
    if (mappingsToCreate.some((m) => m.id === mappingId)) {
      setMappingsToCreate((prev) => prev.filter((m) => m.id !== mappingId));
    } else {
      const remaining = currentFormCombinations.filter((m) => m.id !== mappingId);
      setMappingsToCreate((prev) => [...prev, ...remaining]);
      setFormData((prev) => ({
        ...prev,
        category: [],
        subCategory: [],
        zone: [],
        module: [],
        role: [],
      }));
    }
  };

  const handleClearList = () => {
    setMappingsToCreate([]);
    setFormData((prev) => ({
      ...prev,
      category: [],
      subCategory: [],
      zone: [],
      module: [],
      role: [],
    }));
  };

  const [pendingSubmit, setPendingSubmit] = useState(false);

  // Defer submit by one macrotask so any open MultiSelectDropdown flushes onSelect -> formData first
  const handleAddSubmit = () => {
    setTimeout(() => {
      setPendingSubmit(true);
    }, 0);
  };

  useEffect(() => {
    if (pendingSubmit) {
      setPendingSubmit(false);
      executeAddSubmit();
    }
  }, [pendingSubmit]);

  // Submit all mappings (Supports both direct 1-click submit and multi-batch staged submission)
  const executeAddSubmit = async () => {
    let finalMappings = [...mappingsToCreate];

    // If current form has complete valid combinations, include them directly
    if (currentFormCombinations.length > 0) {
      if (!validateCurrentForm(false)) {
        setTimeout(() => setModalToast(null), 5000);
        return;
      }
      finalMappings = [...finalMappings, ...currentFormCombinations];
    }

    if (!finalMappings.length) {
      validateCurrentForm(false);
      setTimeout(() => setModalToast(null), 5000);
      return;
    }

    if (!selectedULB) {
      setModalToast({ key: true, label: "Please select a ULB first", error: true });
      setTimeout(() => setModalToast(null), 5000);
      return;
    }

    try {
      setLoading(true);

      const payload = {
        Employees: finalMappings.map((mapping) => ({
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

      console.log("payload", payload);

      const response = await Digit.HRMSService.CreateEmpMapping(selectedULB.code, payload);

      if (response?.ResponseInfo?.status === "successful" || response?.Employees?.length > 0) {
        const mappedULB = selectedULB;
        const mappedEmployee = formData.employeeCode || finalMappings[0]?.employeeInfo;
        const count = finalMappings.length;

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
        setModalToast({ key: true, label: "Failed to create employee mappings", error: true });
      }
    } catch (error) {
      setModalToast({
        key: true,
        label: error?.response?.data?.Errors?.[0]?.message || "Failed to create employee mappings",
        error: true,
      });
      setTimeout(() => {
        setModalToast(null);
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  // Multi-select handler with "Select All" logic
  const handleSelectWithAll = (selectedItems, allItems, field) => {
    setFormData((prev) => {
      const newSelection = handleSelectAllLogic(selectedItems, allItems, prev[field]);
      return { ...prev, [field]: newSelection };
    });
    setFormErrors((prev) => ({ ...prev, [field]: null }));
  };

  // Pagination handlers
  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setPageOffset(0);
  };

  if (isBPALoading || loading) return <Loader />;

  return (
    <React.Fragment>
      <div className="hrms-emp-mapping__container">
        <Header className="hrms-emp-mapping__header">
          {isJurisdictionSearch ? t("Search Employees by jurisdiction") : t("HR_EMPLOYEE_CATEGORY_ZONE_MAPPING")}
        </Header>

        {/* Search Filters */}
        <Card className="hrms-emp-mapping__search-card">
          <h3 className="hrms-emp-mapping__search-heading">{t("COMMON_SEARCH_FILTERS") || "Search Filters"}</h3>
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
                select={(ulb) => {
                  setFilterULB(ulb);
                  setFilterEmployee(null);
                }}
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

            {!hideMappingControls && (
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
            )}
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
                {t("COMMON_CLEAR_FILTERS") || "Clear Filters"}
              </button>
            </div>

            {!hideMappingControls && (
              <button onClick={handleAddNew} className="hrms-emp-mapping__add-button">
                + {t("HR_ADD_NEW_MAPPING")}
              </button>
            )}
          </div>
        </Card>

        {/* Results Table */}
        <Card className="hrms-emp-mapping__results-card">
          <MappingTable
            t={t}
            title={`${t("HR_MAPPING_RESULTS")} (${totalRecords})`}
            mappingData={mappingData}
            hasSearched={hasSearched}
            filterULB={filterULB}
            tenantId={tenantId}
            showRoles={showRoles}
            showExport={showExport}
            hideMappingColumns={isJurisdictionSearch}
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
            headerBarMain={
              <div style={{ display: "flex", flexDirection: "column", padding: "16px 20px" }}>
                <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: "#0b0c0c" }}>
                  {t("HR_ADD_NEW_MAPPING") || "Add New Employee Mapping"}
                </h2>
                <span style={{ fontSize: "0.85rem", color: "#616161", marginTop: "4px" }}>
                  {t("HR_ADD_MAPPING_SUBTITLE") || "Configure zones, categories, and module roles for the employee"}
                </span>
              </div>
            }
            headerBarEnd={<CloseBtn onClick={closeAddModal} />}
            actionCancelLabel={t("COMMON_CANCEL")}
            actionCancelOnSubmit={closeAddModal}
            actionSaveLabel={`${t("COMMON_SUBMIT")} ${totalEffectiveMappingsCount > 0 ? `(${totalEffectiveMappingsCount})` : ""}`}
            actionSaveOnSubmit={handleAddSubmit}
            formId="add-mapping-form"
            popupStyles={{
              width: "960px",
              maxWidth: "95vw",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              borderRadius: "8px",
              overflow: "hidden",
              margin: "auto",
            }}
            popupModuleMianStyles={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              minHeight: 0,
              overflow: "hidden",
              padding: 0,
            }}
            popupModuleActionBarStyles={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: "16px",
              padding: "14px 24px",
              borderTop: "1px solid #e0e0e0",
              backgroundColor: "#ffffff",
              flexShrink: 0,
              boxSizing: "border-box",
              width: "100%",
            }}
          >
            <div
              className="hrms-emp-mapping__modal-content"
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: "auto",
                padding: "20px 24px",
                boxSizing: "border-box",
              }}
            >
              {/* Modal Toast for Errors / Notifications */}
              {modalToast && (
                <div
                  className={`hrms-emp-mapping__toast ${modalToast.error ? "hrms-emp-mapping__toast--error" : "hrms-emp-mapping__toast--success"}`}
                  style={{ marginBottom: "16px" }}
                >
                  <span className="hrms-emp-mapping__toast-message">{modalToast.label}</span>
                  <button onClick={() => setModalToast(null)} className="hrms-emp-mapping__toast-close-btn">
                    ✖
                  </button>
                </div>
              )}

              {/* 2-Column Responsive Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: "1.25rem",
                  alignItems: "stretch",
                }}
              >
                {/* COLUMN 1: Employee & Location */}
                <div
                  style={{
                    backgroundColor: "#fcfcfc",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "14px",
                      borderBottom: "2px solid #e8e8e8",
                      paddingBottom: "8px",
                    }}
                  >
                    <span style={{ fontSize: "1.1rem" }}>👤</span>
                    <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#0b0c0c" }}>
                      {t("HR_TARGET_EMPLOYEE_AND_ZONE") || "1. Employee & Location"}
                    </h3>
                  </div>

                  {/* ULB Selection */}
                  <div className="hrms-emp-mapping__form-group" style={{ marginBottom: "14px" }}>
                    <CardLabel className="hrms-emp-mapping__label" style={{ marginBottom: "6px", fontWeight: 600 }}>
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
                  <div className="hrms-emp-mapping__form-group" style={{ marginBottom: "14px" }}>
                    <CardLabel className="hrms-emp-mapping__label" style={{ marginBottom: "6px", fontWeight: 600 }}>
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

                    {/* Employee Quick Info Badge */}
                    {formData.employeeCode && (
                      <div
                        style={{
                          marginTop: "8px",
                          padding: "8px 12px",
                          backgroundColor: "#f1f8e9",
                          borderRadius: "6px",
                          border: "1px solid #dcedc8",
                          fontSize: "0.82rem",
                        }}
                      >
                        <div style={{ color: "#2e7d32", fontWeight: 600 }}>
                          <strong>{t("HR_DESIGNATION") || "Designation"}:</strong> {formData.designationCode || "N/A"}
                        </div>
                        <div style={{ color: "#558b2f", fontSize: "0.78rem", marginTop: "3px" }}>
                          <strong>{t("HR_ROLES_LABEL") || "Existing Roles"}:</strong> {formData.roleNames || "No OBPS Roles"}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Zone Multi-Select */}
                  <div className="hrms-emp-mapping__form-group" style={{ marginBottom: "0", marginTop: "auto", position: "relative" }}>
                    <CardLabel className="hrms-emp-mapping__label" style={{ marginBottom: "6px", fontWeight: 600 }}>
                      {t("HR_ZONE_LABEL")} <span className="hrms-emp-mapping__required-asterisk">*</span>
                    </CardLabel>
                    <MultiSelectDropdown
                      options={modalZonesWithSelectAll}
                      optionsKey="name"
                      selected={formData.zone}
                      onSelect={(items) => handleSelectWithAll(items, modalZones, "zone")}
                      defaultLabel={t("COMMON_SELECT_ZONE") || "Select Zones"}
                      defaultUnit={t("HR_ZONES_SELECTED") || "selected"}
                      ServerStyle={{
                        bottom: "44px",
                        top: "auto",
                        zIndex: 1000,
                        maxHeight: "190px",
                        overflowY: "auto",
                        boxShadow: "0 -4px 14px rgba(0,0,0,0.15)",
                        border: "1px solid #d1d5db",
                        borderRadius: "4px",
                        backgroundColor: "#ffffff",
                      }}
                    />
                    {formErrors.zone && <CardLabelError>{formErrors.zone}</CardLabelError>}
                  </div>
                </div>

                {/* COLUMN 2: Scope & Permissions */}
                <div
                  style={{
                    backgroundColor: "#fcfcfc",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "14px",
                      borderBottom: "2px solid #e8e8e8",
                      paddingBottom: "8px",
                    }}
                  >
                    <span style={{ fontSize: "1.1rem" }}>🛡️</span>
                    <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#0b0c0c" }}>
                      {t("HR_SCOPE_AND_PERMISSIONS") || "2. Scope & Permissions"}
                    </h3>
                  </div>

                  {/* Category Multi-Select */}
                  <div className="hrms-emp-mapping__form-group" style={{ marginBottom: "14px", position: "relative" }}>
                    <CardLabel className="hrms-emp-mapping__label" style={{ marginBottom: "6px", fontWeight: 600 }}>
                      {t("HR_CATEGORY_LABEL")} <span className="hrms-emp-mapping__required-asterisk">*</span>
                    </CardLabel>
                    <MultiSelectDropdown
                      options={categoriesWithSelectAll}
                      optionsKey="name"
                      selected={formData.category}
                      onSelect={(items) => handleSelectWithAll(items, categories, "category")}
                      defaultLabel={t("COMMON_SELECT_CATEGORY") || "Select Categories"}
                      defaultUnit={t("HR_CATEGORIES_SELECTED") || "selected"}
                      ServerStyle={{
                        top: "42px",
                        zIndex: 1000,
                        maxHeight: "190px",
                        overflowY: "auto",
                        boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                        border: "1px solid #d1d5db",
                        borderRadius: "4px",
                        backgroundColor: "#ffffff",
                      }}
                    />
                    {formErrors.category && <CardLabelError>{formErrors.category}</CardLabelError>}
                  </div>

                  {/* Sub-Category Multi-Select */}
                  <div className="hrms-emp-mapping__form-group" style={{ marginBottom: "14px", position: "relative" }}>
                    <CardLabel className="hrms-emp-mapping__label" style={{ marginBottom: "6px", fontWeight: 600 }}>
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
                      ServerStyle={{
                        top: "42px",
                        zIndex: 1000,
                        maxHeight: "190px",
                        overflowY: "auto",
                        boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                        border: "1px solid #d1d5db",
                        borderRadius: "4px",
                        backgroundColor: "#ffffff",
                      }}
                    />
                    {formErrors.subCategory && <CardLabelError>{formErrors.subCategory}</CardLabelError>}
                  </div>

                  {/* Module Multi-Select */}
                  <div className="hrms-emp-mapping__form-group" style={{ marginBottom: "14px", position: "relative" }}>
                    <CardLabel className="hrms-emp-mapping__label" style={{ marginBottom: "6px", fontWeight: 600 }}>
                      {t("Module")} <span className="hrms-emp-mapping__required-asterisk">*</span>
                    </CardLabel>
                    <MultiSelectDropdown
                      options={modulesWithSelectAll}
                      optionsKey="name"
                      selected={formData.module}
                      onSelect={(items) => {
                        handleSelectWithAll(items, moduleNames?.["common-masters"]?.obpasmodules, "module");
                      }}
                      defaultLabel={t("Select Module") || "Select Module"}
                      defaultUnit={t("Module Selected") || "selected"}
                      ServerStyle={{
                        top: "42px",
                        zIndex: 1000,
                        maxHeight: "190px",
                        overflowY: "auto",
                        boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                        border: "1px solid #d1d5db",
                        borderRadius: "4px",
                        backgroundColor: "#ffffff",
                      }}
                    />
                    {formErrors.module && <CardLabelError>{formErrors.module}</CardLabelError>}
                  </div>

                  {/* Role Multi-Select */}
                  <div className="hrms-emp-mapping__form-group" style={{ marginBottom: "0", marginTop: "auto", position: "relative" }}>
                    <CardLabel className="hrms-emp-mapping__label" style={{ marginBottom: "6px", fontWeight: 600 }}>
                      {t("Role")} <span className="hrms-emp-mapping__required-asterisk">*</span>
                    </CardLabel>
                    <MultiSelectDropdown
                      options={rolesWithSelectAll}
                      optionsKey="name"
                      selected={formData.role}
                      onSelect={(items) => handleSelectWithAll(items, filteredRoles, "role")}
                      defaultLabel={
                        !selectedULB
                          ? t("HR_SELECT_ULB_FIRST") || "Select ULB first"
                          : !formData.employeeCode
                          ? t("HR_SELECT_EMPLOYEE_FIRST") || "Select Employee first"
                          : !filterSelectAll(formData.module).length
                          ? t("Select module first")
                          : t("Select Role")
                      }
                      defaultUnit={t("Roles Selected")}
                      ServerStyle={{
                        bottom: "44px",
                        top: "auto",
                        zIndex: 1000,
                        maxHeight: "190px",
                        overflowY: "auto",
                        boxShadow: "0 -4px 14px rgba(0,0,0,0.15)",
                        border: "1px solid #d1d5db",
                        borderRadius: "4px",
                        backgroundColor: "#ffffff",
                      }}
                    />
                    {formErrors.role && <CardLabelError>{formErrors.role}</CardLabelError>}
                  </div>
                </div>
              </div>

              {/* LIVE SUMMARY CARD & CALCULATION */}
              {totalEffectiveMappingsCount > 0 && (
                <div
                  ref={previewSectionRef}
                  style={{
                    marginTop: "16px",
                    padding: "12px 16px",
                    backgroundColor: "#e8f4fd",
                    border: "1px solid #b3e5fc",
                    borderRadius: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "10px",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: "#01579b", fontSize: "0.95rem" }}>
                        ⚡ Ready to Map:{" "}
                        <span style={{ color: "#c84c0e", fontSize: "1.05rem" }}>
                          {totalEffectiveMappingsCount} Total Mapping(s)
                        </span>
                        {mappingsToCreate.length > 0 && currentFormCombinations.length > 0 && (
                          <span style={{ fontSize: "0.8rem", color: "#546e7a", marginLeft: "6px" }}>
                            ({mappingsToCreate.length} staged + {currentFormCombinations.length} active)
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: "0.82rem", color: "#455a64", marginTop: "3px" }}>
                        {formData.employeeCode?.name || mappingsToCreate[0]?.employeeName} &bull;{" "}
                        {filterSelectAll(formData.zone).length || mappingsToCreate[0]?.zone ? `${filterSelectAll(formData.zone).length} Zone(s)` : ""} &bull;{" "}
                        {filterSelectAll(formData.category).length || mappingsToCreate[0]?.category ? `${filterSelectAll(formData.category).length} Category(ies)` : ""} &bull;{" "}
                        {filterSelectAll(formData.role).length || mappingsToCreate[0]?.role ? `${filterSelectAll(formData.role).length} Role(s)` : ""}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <button
                        type="button"
                        onClick={handleAddToList}
                        style={{
                          backgroundColor: "#fff",
                          border: "1px solid #c84c0e",
                          color: "#c84c0e",
                          padding: "5px 12px",
                          borderRadius: "4px",
                          fontSize: "0.82rem",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                        title="Stage current configuration and clear inputs to configure another batch"
                      >
                        + {t("HR_ADD_NEW") || "Add New"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPreviewTable((prev) => !prev)}
                        style={{
                          backgroundColor: "#fff",
                          border: "1px solid #0288d1",
                          color: "#0288d1",
                          padding: "5px 12px",
                          borderRadius: "4px",
                          fontSize: "0.82rem",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        {showPreviewTable
                          ? `Hide Preview ▲`
                          : `Preview Rows (${totalEffectiveMappingsCount}) ▼`}
                      </button>
                      <button
                        type="button"
                        onClick={handleClearList}
                        style={{
                          backgroundColor: "#fff",
                          border: "1px solid #e57373",
                          color: "#c62828",
                          padding: "5px 10px",
                          borderRadius: "4px",
                          fontSize: "0.82rem",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        {t("COMMON_CLEAR_ALL") || "Clear All"}
                      </button>
                    </div>
                  </div>

                  {/* Collapsible Preview Table */}
                  {showPreviewTable && (
                    <div
                      style={{
                        marginTop: "12px",
                        maxHeight: "220px",
                        overflowY: "auto",
                        border: "1px solid #cfd8dc",
                        borderRadius: "6px",
                        backgroundColor: "#fff",
                      }}
                    >
                      <table className="hrms-emp-mapping__preview-table" style={{ width: "100%", fontSize: "0.85rem" }}>
                        <thead>
                          <tr style={{ backgroundColor: "#f5f5f5", textAlign: "left" }}>
                            <th style={{ padding: "8px 10px" }}>{t("HR_EMPLOYEE_CODE")}</th>
                            <th style={{ padding: "8px 10px" }}>{t("HR_CATEGORY_LABEL")}</th>
                            <th style={{ padding: "8px 10px" }}>{t("HR_SUB_CATEGORY_LABEL")}</th>
                            <th style={{ padding: "8px 10px" }}>{t("HR_ZONE_LABEL")}</th>
                            <th style={{ padding: "8px 10px" }}>{t("Module")}</th>
                            <th style={{ padding: "8px 10px" }}>{t("Role")}</th>
                            <th style={{ padding: "8px 10px", textAlign: "center" }}>{t("COMMON_ACTION")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allPreviewList.map((mapping) => (
                            <tr key={mapping.id} style={{ borderBottom: "1px solid #eeeeee" }}>
                              <td style={{ padding: "6px 10px" }}>{mapping.employeeCode}</td>
                              <td style={{ padding: "6px 10px" }}>{mapping.category?.name}</td>
                              <td style={{ padding: "6px 10px" }}>{mapping.subCategory?.name}</td>
                              <td style={{ padding: "6px 10px" }}>{mapping.zone?.name}</td>
                              <td style={{ padding: "6px 10px" }}>{mapping?.module?.name}</td>
                              <td style={{ padding: "6px 10px" }}>{mapping.role?.name}</td>
                              <td style={{ padding: "6px 10px", textAlign: "center" }}>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFromList(mapping.id)}
                                  style={{
                                    border: "none",
                                    background: "none",
                                    color: "#d32f2f",
                                    cursor: "pointer",
                                    fontWeight: 600,
                                    fontSize: "0.8rem",
                                  }}
                                >
                                  ✖ {t("COMMON_DELETE")}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
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

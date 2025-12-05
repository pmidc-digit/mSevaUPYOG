import React, { useState, useMemo, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Header,
  Card,
  CardLabel,
  Dropdown,
  SearchField,
  Table,
  Toast,
  Modal,
  CardLabelError,
  SubmitBar,
  TextInput,
  Loader,
  MultiSelectDropdown,
} from "@mseva/digit-ui-react-components";
import { Link, useHistory } from "react-router-dom";

// Close Button Component for Modal
const Close = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="#0B0C0C" />
  </svg>
);

const CloseBtn = (props) => {
  return (
    <div className="icon-bg-secondary" onClick={props.onClick} style={{ backgroundColor: "#FFFFFF", cursor: "pointer" }}>
      <Close />
    </div>
  );
};

const EmpMaping = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();
  const isMobile = window.Digit.Utils.browser.isMobile();

  // ==================== STATE MANAGEMENT ====================
  // Filter states
  const [filterEmployee, setFilterEmployee] = useState(null);
  const [filterCategory, setFilterCategory] = useState(null);
  const [filterZone, setFilterZone] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  
  const [showToast, setShowToast] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    employeeCode: null,
    category: [],
    subCategory: [],
    zone: [],
  });
  const [formErrors, setFormErrors] = useState({});
  const [mappingsToCreate, setMappingsToCreate] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mappingData, setMappingData] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [pageOffset, setPageOffset] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const hasFetched = useRef(false);

  // ==================== MDMS DATA (Category, SubCategory, Zone) ====================
  const { data: mdmsDataBPA, isLoading: isBPALoading } = Digit.Hooks.useCommonMDMS(stateId, "BPA", ["Category", "SubCategory"]);
  console.log("State id", stateId)
  const { data: mdmsDataTenant, isLoading: isTenantLoading } = Digit.Hooks.useCustomMDMS(
    stateId,
    "tenant",
    [{ name: "zoneMaster", filter: `$.[?(@.tanentId == '${tenantId}')]` }]
  );

  // Process MDMS data
  const categories = useMemo(() => {
    if (!mdmsDataBPA?.BPA?.Category) return [];
    return mdmsDataBPA.BPA.Category.filter(cat => cat.active).map(cat => ({
      code: cat.categoryId,
      name: cat.categoryName,
      categoryId: cat.categoryId,
    }));
  }, [mdmsDataBPA]);

  const allSubCategories = useMemo(() => {
    if (!mdmsDataBPA?.BPA?.SubCategory) return [];
    return mdmsDataBPA.BPA.SubCategory.filter(sub => sub.active);
  }, [mdmsDataBPA]);

  const zones = useMemo(() => {
    
    // MDMS filter already returns only matching tenant's data, so we just access the first element's zones
    const zonesOptions = mdmsDataTenant?.tenant?.zoneMaster?.[0]?.zones || [];
    
    console.log("✅ Final zones options:", zonesOptions);
    
    return zonesOptions.map(zone => ({
      code: zone.code,
      name: zone.name,
    }));
  }, [mdmsDataTenant]);

  // Filter subcategories based on selected categories (AND logic - only show subs that belong to ALL selected categories)
  const filteredSubCategories = useMemo(() => {
    if (!formData.category || formData.category.length === 0 || !allSubCategories.length) return [];
    
    const selectedCategoryIds = formData.category.map(cat => cat.categoryId);
    
    // Show subcategories that belong to ANY of the selected categories
    return allSubCategories
      .filter(sub => selectedCategoryIds.includes(sub.categoryId))
      .map(sub => ({
        code: sub.subCategoryId,
        name: sub.subCategoryName,
        subCategoryId: sub.subCategoryId,
        categoryId: sub.categoryId,
      }));
  }, [formData.category, allSubCategories]);

  // Auto-deselect subcategories when their parent categories are deselected
  useEffect(() => {
    if (formData.category && formData.category.length > 0 && formData.subCategory && formData.subCategory.length > 0) {
      const selectedCategoryIds = formData.category.map(cat => cat.categoryId);
      
      // Remove subcategories that don't belong to any selected category
      const validSubCategories = formData.subCategory.filter(subCat =>
        selectedCategoryIds.includes(subCat.categoryId)
      );
      
      if (validSubCategories.length !== formData.subCategory.length) {
        setFormData(prev => ({
          ...prev,
          subCategory: validSubCategories
        }));
      }
    }
  }, [formData.category]);

  // ==================== FETCH DATA WITH PAGINATION ====================
  const fetchMappingData = async () => {
    try {
      setLoading(true);
      
      // Build filter parameters - all are optional
      const filters = {
        limit: pageSize,
        offset: pageOffset,
      };
      
      // Add filters only if selected
      if (filterEmployee) filters.codes = filterEmployee.code;
      if (filterCategory) filters.categories = filterCategory.name;
      if (filterZone) filters.zone = filterZone.code;
      
      console.log("Searching with filters:", filters);
      
      // Fetch employees WITH mappings (obpass API)
      const mappedEmployeesResponse = await Digit.HRMSService.SearchEmpMap(tenantId, filters);
      
      // Transform mapped employees for table
      if (mappedEmployeesResponse?.Employees) {
        console.log("API Response:", mappedEmployeesResponse);
        const transformedData = mappedEmployeesResponse.Employees.map((emp, index) => {
          // API returns arrays for categories, subcategories, and zones
          const categories = emp.categories || [];
          const subcategories = emp.subcategories || [];
          const zones = emp.zones || [];
          
          return {
            id: String(pageOffset + index + 1),
            employeeCode: emp.code,
            uuid: emp.uuid,
            category: categories,
            categoryName: categories.join(', '),
            subCategory: subcategories,
            subCategoryName: subcategories.join(', '),
            zone: zones,
            zoneName: zones.join(', '),
          };
        });
        setMappingData(transformedData);
        
        // Since API doesn't return total count, we use the fetched data length
        // If we got less than pageSize, we're on the last page
        // Otherwise, assume there might be more records
        console.log("Fetched records:", transformedData.length, "Page size:", pageSize);
        
        // Set a high number to enable pagination, will be corrected when we reach the end
        if (transformedData.length < pageSize) {
          // Last page - set exact total
          setTotalRecords(pageOffset + transformedData.length);
        } else {
          // More pages might exist - set total to allow next page
          setTotalRecords(pageOffset + transformedData.length + 1);
        }
      } else {
        console.log("No Employees in response");
        setMappingData([]);
        setTotalRecords(0);
      }
      
    } catch (error) {
      console.error("Error fetching mapping data:", error);
      setShowToast({ key: true, label: "Failed to load employee data", error: true });
    } finally {
      setLoading(false);
    }
  };

  // Fetch employee list for dropdown (only once)
  useEffect(() => {
    const fetchEmployeeList = async () => {
      try {
        const allEmployeesResponse = await Digit.HRMSService.search(tenantId, {
          tenantId: tenantId,
          limit: 100,
          offset: 0,
        });
        
        if (allEmployeesResponse?.Employees) {
          const employeeOptions = allEmployeesResponse.Employees.map(emp => ({
            code: emp.code,
            name: `${emp.user?.name || emp.code} (${emp.code})`,
            uuid: emp.uuid,
            department: emp.assignments?.[0]?.department || "N/A",
          }));
          setEmployeeList(employeeOptions);
        }
      } catch (error) {
        console.error("Error fetching employee list:", error);
      }
    };
    
    fetchEmployeeList();
  }, [tenantId]);

  // Don't auto-fetch on mount - wait for user to click Search
  // useEffect removed - fetchMappingData only called on Search button click

  // Mock data removed - now using MDMS and API calls

  // ==================== SEARCH & FILTER HANDLERS ====================
  const handleSearch = async () => {
    setPageOffset(0); // Reset to first page
    setHasSearched(true);
    await fetchMappingData();
  };

  const handleClearFilters = () => {
    setFilterEmployee(null);
    setFilterCategory(null);
    setFilterZone(null);
    setMappingData([]);
    setTotalRecords(0);
    setPageOffset(0);
    setHasSearched(false);
  };

  // Pagination triggers new search with current filters
  useEffect(() => {
    if (hasSearched) {
      fetchMappingData();
    }
  }, [pageOffset, pageSize]);

  // Calculate current page for display
  const currentPage = Math.floor(pageOffset / pageSize);

  // ==================== MODAL ACTIONS ====================
  const handleDelete = (rowId) => {
    if (window.confirm(t("HR_CONFIRM_DELETE_MAPPING") || "Are you sure you want to delete this mapping?")) {
      setMappingData((prev) => prev.filter((row) => row.id !== rowId));
      setShowToast({ key: true, label: "Mapping deleted successfully!" });

      // TODO: Call API to delete
      // await Digit.HRMSService.deleteMapping(rowId);
    }
  };

  const handleAddNew = () => {
    setFormData({
      employeeCode: null,
      category: [],
      subCategory: [],
      zone: [],
    });
    setFormErrors({});
    setMappingsToCreate([]);
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setFormData({
      employeeCode: null,
      category: [],
      subCategory: [],
      zone: [],
    });
    setFormErrors({});
    setMappingsToCreate([]);
  };

  const validateAddForm = () => {
    const errors = {};

    if (!formData.employeeCode) errors.employeeCode = t("HR_EMPLOYEE_CODE_REQUIRED");
    if (!formData.category || formData.category.length === 0) errors.category = t("HR_CATEGORY_REQUIRED");
    if (!formData.subCategory || formData.subCategory.length === 0) errors.subCategory = t("HR_SUB_CATEGORY_REQUIRED");
    if (!formData.zone || formData.zone.length === 0) errors.zone = t("HR_ZONE_REQUIRED");

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Add mapping to preview list
  const handleAddToList = () => {
    if (!formData.employeeCode) {
      setShowToast({ key: true, label: "Please select an employee", error: true });
      return;
    }

    if (!formData.category || formData.category.length === 0) {
      setShowToast({ key: true, label: "Please select at least one category", error: true });
      return;
    }

    if (!formData.subCategory || formData.subCategory.length === 0) {
      setShowToast({ key: true, label: "Please select at least one sub-category", error: true });
      return;
    }

    if (!formData.zone || formData.zone.length === 0) {
      setShowToast({ key: true, label: "Please select at least one zone", error: true });
      return;
    }

    // Create cartesian product of all selections
    const newMappings = [];
    
    formData.category.forEach(category => {
      formData.subCategory.forEach(subCategory => {
        formData.zone.forEach(zone => {
          newMappings.push({
            id: Date.now() + Math.random(),
            employeeCode: formData.employeeCode.code,
            employeeName: formData.employeeCode.name,
            employeeUUID: formData.employeeCode.uuid,
            category: category,
            subCategory: subCategory,
            zone: zone,
          });
        });
      });
    });

    setMappingsToCreate(prev => [...prev, ...newMappings]);
    
    // Reset form except employee
    setFormData(prev => ({
      employeeCode: prev.employeeCode,
      category: [],
      subCategory: [],
      zone: [],
    }));

    setShowToast({ key: true, label: `${newMappings.length} mapping(s) added to list` });
  };

  // Remove mapping from preview list
  const handleRemoveFromList = (mappingId) => {
    setMappingsToCreate(prev => prev.filter(m => m.id !== mappingId));
  };

  // Clear all mappings
  const handleClearList = () => {
    setMappingsToCreate([]);
  };

  const handleAddSubmit = async () => {
    if (mappingsToCreate.length === 0) {
      setShowToast({ key: true, label: "Please add at least one mapping to the list", error: true });
      return;
    }

    try {
      setLoading(true);

      // Prepare payload for CREATE API with all mappings
      const payload = {
        Employees: mappingsToCreate.map(mapping => ({
          tenantId: tenantId,
          userUUID: mapping.employeeUUID,
          category: mapping.category.name,
          subcategory: mapping.subCategory.name,
          zone: mapping.zone.code,
          assignedTenantId: tenantId.split('.')[0], // Extract "pb" from "pb.amritsar"
        })),
      };

      console.log("Creating mappings payload:", payload);

      // Call CREATE API
      const response = await Digit.HRMSService.CreateEmpMapping(tenantId, payload);

      // Check if creation was successful
      if (response?.ResponseInfo?.status === "successful" || response?.Employees?.length > 0) {
        setShowToast({ key: true, label: `${mappingsToCreate.length} mapping(s) created successfully!` });
        closeAddModal();
        
        // Refresh data after successful create (keep current filters)
        if (hasSearched) {
          await fetchMappingData();
        }
      } else {
        setShowToast({ key: true, label: "Failed to create employee mappings", error: true });
      }
    } catch (error) {
      console.error("Error creating employee mappings:", error);
      setShowToast({ 
        key: true, 
        label: error?.response?.data?.Errors?.[0]?.message || "Failed to create employee mappings", 
        error: true 
      });
    } finally {
      setLoading(false);
    }
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
    setPageOffset(0); // Reset to first page when changing page size
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  // ==================== MULTI-SELECT HANDLERS ====================
  const handleCategorySelect = (selectedItems) => {
    const selectedCategories = selectedItems.map(item => item[1]);
    setFormData(prev => ({
      ...prev,
      category: selectedCategories,
    }));
    setFormErrors(prev => ({ ...prev, category: null }));
  };

  const handleSubCategorySelect = (selectedItems) => {
    const selectedSubCategories = selectedItems.map(item => item[1]);
    setFormData(prev => ({
      ...prev,
      subCategory: selectedSubCategories,
    }));
    setFormErrors(prev => ({ ...prev, subCategory: null }));
  };

  const handleZoneSelect = (selectedItems) => {
    const selectedZones = selectedItems.map(item => item[1]);
    setFormData(prev => ({
      ...prev,
      zone: selectedZones,
    }));
    setFormErrors(prev => ({ ...prev, zone: null }));
  };

  // ==================== TABLE COLUMNS ====================
  const columns = useMemo(
    () => [
      {
        Header: t("HR_EMPLOYEE_CODE"),
        accessor: "employeeCode",
        Cell: ({ row }) => (
          <Link
            to={`/digit-ui/employee/hrms/Mapdetails/${tenantId}/${row.original.employeeCode}/${row.original.uuid}`}
            style={{ color: "#a82227", fontWeight: "600", textDecoration: "none" }}
          >
            {row.original.employeeCode}
          </Link>
        ),
      },
      {
        Header: t("HR_CATEGORY_LABEL"),
        accessor: "categoryName",
        Cell: ({ value }) => (
          <span
            style={{
              display: "inline-block",
              padding: "4px 12px",
              backgroundColor: "#E0F2FE",
              color: "#0369A1",
              borderRadius: "12px",
              fontSize: "13px",
              fontWeight: "500",
            }}
          >
            {value || "N/A"}
          </span>
        ),
      },
      {
        Header: t("HR_SUB_CATEGORY_LABEL"),
        accessor: "subCategoryName",
        Cell: ({ value }) => (
          <span
            style={{
              display: "inline-block",
              padding: "4px 12px",
              backgroundColor: "#DBEAFE",
              color: "#1E40AF",
              borderRadius: "12px",
              fontSize: "13px",
              fontWeight: "500",
            }}
          >
            {value || "N/A"}
          </span>
        ),
      },
      {
        Header: t("HR_ZONE_LABEL"),
        accessor: "zoneName",
        Cell: ({ value }) => (
          <span
            style={{
              display: "inline-block",
              padding: "4px 12px",
              backgroundColor: "#D1F2EB",
              color: "#0D6759",
              borderRadius: "12px",
              fontSize: "13px",
              fontWeight: "500",
            }}
          >
            {value || "N/A"}
          </span>
        ),
      },
      // {
      //   Header: t("HR_ACTIONS_LABEL"),
      //   Cell: ({ row }) => (
      //     <button
      //       onClick={() => handleDelete(row.original.id)}
      //       style={{
      //         background: "none",
      //         border: "none",
      //         color: "#D4351C",
      //         cursor: "pointer",
      //         fontSize: "14px",
      //         fontWeight: "500",
      //       }}
      //     >
      //       {t("COMMON_DELETE")}
      //     </button>
      //   ),
      // },
    ],
    [t, tenantId]
  );

  // ==================== RENDER ====================
  if (isBPALoading || isTenantLoading || loading) {
    return <Loader />;
  }

  return (
    <React.Fragment>
      <div className="ground-container" style={{ padding: isMobile ? "10px" : "20px" }}>
        {/* Breadcrumb */}
        {/* <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          <p className="breadcrumb" style={{ marginLeft: isMobile ? "1vw" : "15px" }}>
            <Link to="/digit-ui/employee" style={{ cursor: "pointer", color: "#666" }}>
              {t("ES_COMMON_HOME")}
            </Link>{" "}
            / <span>{t("HR_COMMON_OBPAS_EMP_MAPING")}</span>
          </p>
          <p className="breadcrumb">
            <Link to="/digit-ui/employee/hrms/inbox" style={{ cursor: "pointer", color: "#666" }}>
              {"<"} {t("CS_COMMON_BACK")}
            </Link>
          </p>
        </div> */}

        {/* Header */}
        <Header style={{ marginLeft: isMobile ? "1vw" : "15px", color: "#FF0000" }}>
          {t("HR_EMPLOYEE_CATEGORY_WARD_MAPPING")}
        </Header>

        {/* Filter Card */}
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
            {/* Employee Filter */}
            <div>
              <CardLabel>{t("HR_EMPLOYEE_CODE")}</CardLabel>
              <Dropdown
                t={t}
                option={employeeList}
                optionKey="name"
                selected={filterEmployee}
                select={setFilterEmployee}
                placeholder={t("COMMON_SELECT_EMPLOYEE") || "Select Employee"}
              />
            </div>

            {/* Category Filter */}
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

            {/* Zone Filter */}
            <div>
              <CardLabel>{t("HR_ZONE_LABEL")}</CardLabel>
              <Dropdown
                t={t}
                option={zones}
                optionKey="name"
                selected={filterZone}
                select={setFilterZone}
                placeholder={t("COMMON_SELECT_ZONE")}
              />
            </div>
          </div>
          
          {/* Search and Clear Buttons - Separate Row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", gap: "10px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={handleSearch}
                style={{
                  backgroundColor: "#a82227",
                  color: "white",
                  border: "none",
                  padding: "10px 24px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "500",
                  fontSize: "14px",
                }}
              >
                🔍 {t("COMMON_SEARCH")}
              </button>
              
              <button
                onClick={handleClearFilters}
                disabled={!filterEmployee && !filterCategory && !filterZone}
                style={{
                  backgroundColor: "white",
                  color: "#a82227",
                  border: "1px solid #a82227",
                  padding: "10px 24px",
                  borderRadius: "4px",
                  cursor: (!filterEmployee && !filterCategory && !filterZone) ? "not-allowed" : "pointer",
                  fontWeight: "500",
                  fontSize: "14px",
                  opacity: (!filterEmployee && !filterCategory && !filterZone) ? 0.5 : 1,
                }}
              >
                {t("COMMON_CLEAR_FILTERS") || "Clear Filters"}
              </button>
            </div>
            
            <button
              onClick={handleAddNew}
              style={{
                backgroundColor: "#a82227",
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

        {/* Filters Card - COMMENTED OUT FOR NOW */}
        {/* <Card style={{ marginTop: "20px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr 1fr auto",
              gap: "16px",
              alignItems: "end",
            }}
          >
            <div>
              <CardLabel>{t("HR_SEARCH_EMPLOYEE")}</CardLabel>
              <SearchField
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t("HR_SEARCH_BY_NAME_OR_CODE")}
              />
            </div>

            <div>
              <CardLabel>{t("HR_FILTER_BY_CATEGORY")}</CardLabel>
              <Dropdown
                t={t}
                option={categories}
                optionKey="name"
                selected={categoryFilter}
                select={setCategoryFilter}
                placeholder={t("COMMON_SELECT_CATEGORY")}
              />
            </div>

            <div>
              <CardLabel>{t("HR_FILTER_BY_WARD")}</CardLabel>
              <Dropdown
                t={t}
                option={wards}
                optionKey="name"
                selected={wardFilter}
                select={setWardFilter}
                placeholder={t("COMMON_SELECT_WARD")}
              />
            </div>

            <div>
              <button
                onClick={handleAddNew}
                style={{
                  backgroundColor: "#a82227",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "500",
                  height: "40px",
                }}
              >
                + {t("HR_ADD_NEW_MAPPING")}
              </button>
            </div>
          </div>

          {(searchTerm || categoryFilter || wardFilter) && (
            <div style={{ marginTop: "15px", textAlign: "right" }}>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCategoryFilter(null);
                  setWardFilter(null);
                }}
                style={{
                  background: "none",
                  border: "1px solid #a82227",
                  color: "#a82227",
                  padding: "8px 20px",
                  cursor: "pointer",
                  borderRadius: "4px",
                }}
              >
                {t("COMMON_CLEAR_FILTERS")}
              </button>
            </div>
          )}
        </Card> */}

        {/* Table Card */}
        <Card style={{ marginTop: "20px" }}>
          <div style={{ marginBottom: "15px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>
              {t("HR_MAPPING_RESULTS")} ({totalRecords})
            </h3>
            
            {/* Page Size Selector */}
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
          </div>

          {!hasSearched ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#666" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
              <h3 style={{ margin: "0 0 8px 0", color: "#505A5F" }}>
                {t("COMMON_NO_SEARCH_YET") || "Apply filters to search"}
              </h3>
              <p style={{ margin: 0, fontSize: "14px" }}>
                {t("COMMON_SELECT_FILTERS_MESSAGE") || "Select one or more filters above and click Search to view employee mappings"}
              </p>
            </div>
          ) : mappingData.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
              <p>{t("COMMON_TABLE_NO_RECORD_FOUND")}</p>
            </div>
          ) : (
            <Table
              t={t}
              data={mappingData}
              columns={columns}
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
          )}

          {/* Pagination Controls */}
          {hasSearched && mappingData.length > 0 && (
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

        {/* Add New Mapping Modal */}
        {showAddModal && (
          <Modal
            headerBarMain={
              <h2 style={{ fontSize: "20px", fontWeight: "600", margin: 0 }}>{t("HR_ADD_NEW_MAPPING")}</h2>
            }
            headerBarEnd={<CloseBtn onClick={closeAddModal} />}
            actionCancelLabel={t("COMMON_CANCEL")}
            actionCancelOnSubmit={closeAddModal}
            actionSaveLabel={`${t("COMMON_SUBMIT")} ${mappingsToCreate.length > 0 ? `(${mappingsToCreate.length})` : ''}`}
            actionSaveOnSubmit={handleAddSubmit}
            formId="add-mapping-form"
            popupStyles={{ width: "900px", maxHeight: "90vh" }}
          >
            <div style={{ padding: "20px", maxHeight: "calc(90vh - 150px)", overflowY: "auto" }}>
              {/* Employee Code Dropdown */}
              <div style={{ marginBottom: "20px" }}>
                <CardLabel>
                  {t("HR_EMPLOYEE_CODE")} <span style={{ color: "red" }}>*</span>
                </CardLabel>
                <Dropdown
                  t={t}
                  option={employeeList}
                  optionKey="name"
                  selected={formData.employeeCode}
                  select={(employee) => {
                    setFormData({ ...formData, employeeCode: employee });
                    setFormErrors({ ...formErrors, employeeCode: null });
                  }}
                  placeholder={t("COMMON_SELECT_EMPLOYEE")}
                />
                {formErrors.employeeCode && <CardLabelError>{formErrors.employeeCode}</CardLabelError>}
              </div>

              {/* Category Multi-Select */}
              <div style={{ marginBottom: "20px" }}>
                <CardLabel>
                  {t("HR_CATEGORY_LABEL")} <span style={{ color: "red" }}>*</span>
                </CardLabel>
                <MultiSelectDropdown
                  options={categories}
                  optionsKey="name"
                  selected={formData.category}
                  onSelect={handleCategorySelect}
                  defaultLabel={t("COMMON_SELECT_CATEGORY") || "Select Categories"}
                  defaultUnit={t("HR_CATEGORIES_SELECTED") || "selected"}
                />
                {formErrors.category && <CardLabelError>{formErrors.category}</CardLabelError>}
              </div>

              {/* Sub-Category Multi-Select (Filtered) */}
              <div style={{ marginBottom: "20px" }}>
                <CardLabel>
                  {t("HR_SUB_CATEGORY_LABEL")} <span style={{ color: "red" }}>*</span>
                </CardLabel>
                <MultiSelectDropdown
                  options={filteredSubCategories}
                  optionsKey="name"
                  selected={formData.subCategory}
                  onSelect={handleSubCategorySelect}
                  defaultLabel={formData.category?.length > 0 ? (t("COMMON_SELECT_SUB_CATEGORY") || "Select Sub-Categories") : (t("HR_SELECT_CATEGORY_FIRST") || "Select category first")}
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
                  options={zones}
                  optionsKey="name"
                  selected={formData.zone}
                  onSelect={handleZoneSelect}
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
                    backgroundColor: "#a82227",
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
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center",
                    marginBottom: "10px" 
                  }}>
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

                  <div style={{ 
                    maxHeight: "300px", 
                    overflow: "auto",
                    border: "1px solid #d6d5d5",
                    borderRadius: "4px"
                  }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead style={{ backgroundColor: "#f3f3f3", position: "sticky", top: 0 }}>
                        <tr>
                          <th style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #d6d5d5", fontSize: "13px" }}>
                            {t("HR_EMPLOYEE_CODE")}
                          </th>
                          <th style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #d6d5d5", fontSize: "13px" }}>
                            {t("HR_CATEGORY_LABEL")}
                          </th>
                          <th style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #d6d5d5", fontSize: "13px" }}>
                            {t("HR_SUB_CATEGORY_LABEL")}
                          </th>
                          <th style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #d6d5d5", fontSize: "13px" }}>
                            {t("HR_ZONE_LABEL")}
                          </th>
                          <th style={{ padding: "10px", textAlign: "center", borderBottom: "1px solid #d6d5d5", fontSize: "13px" }}>
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
        {showToast && (
          <Toast
            error={showToast.error}
            label={showToast.label}
            onClose={() => setShowToast(null)}
            isDleteBtn
          />
        )}
      </div>
    </React.Fragment>
  );
};

export default EmpMaping;
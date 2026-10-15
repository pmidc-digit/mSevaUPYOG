// Constants
export const OBPS_GROUP_ID = "025";

// Utility: Fetch and cache OBPS roles
export const fetchOBPSRoles = async (stateId) => {
  try {
    // Check sessionStorage first
    const cachedRoles = sessionStorage.getItem("OBPS_ROLES");
    if (cachedRoles) {
      return JSON.parse(cachedRoles);
    }

    // Fetch from MDMS
    const response = await Digit.MDMSService.getMultipleTypes(stateId, "ACCESSCONTROL-ROLES", ["roles"]);
    const allRoles = response?.["ACCESSCONTROL-ROLES"]?.roles || [];

    // Filter OBPS roles (groupId === "025")
    const obpsRoles = allRoles.filter((role) => role.groupId === OBPS_GROUP_ID);
    const obpsRoleCodes = obpsRoles.map((role) => role.code);

    // Create a map for quick lookup: code -> name
    const obpsRoleMap = {};
    obpsRoles.forEach((role) => {
      obpsRoleMap[role.code] = role.name;
    });

    const cacheData = {
      codes: obpsRoleCodes,
      map: obpsRoleMap,
    };

    // Cache in sessionStorage
    sessionStorage.setItem("OBPS_ROLES", JSON.stringify(cacheData));
    return cacheData;
  } catch (error) {
    console.error("Error fetching OBPS roles:", error);
    return { codes: [], map: {} };
  }
};

// Utility: Get employee's OBPS role names
export const getEmployeeOBPSRoles = (employee, obpsRoleMap) => {
  if (!employee?.user?.roles || !obpsRoleMap) return "No OBPS Roles";

  const obpsRoleNames = employee.user.roles.filter((role) => obpsRoleMap[role.code]).map((role) => obpsRoleMap[role.code]);

  return obpsRoleNames.length > 0 ? obpsRoleNames.join(", ") : "No OBPS Roles";
};

// Utility: Add "Select All" option to array
export const addSelectAllOption = (items, codeKey = "code", nameKey = "name") => {
  if (!items || items.length === 0) return [];
  return [{ [codeKey]: "ALL", [nameKey]: "Select All" }, ...items];
};

// Utility: Handle "Select All" logic
export const handleSelectAllLogic = (selectedItems, allItems, currentFormValue) => {
  const selected = selectedItems.map((item) => item[1]);
  const hasSelectAll = selected.find((item) => item.code === "ALL");
  const wasSelectAllPreviouslySelected = currentFormValue?.some((item) => item.code === "ALL");

  let newSelection;

  if (hasSelectAll && !wasSelectAllPreviouslySelected) {
    // User just clicked "Select All" - select everything
    const selectAllOption = { code: "ALL", name: "Select All" };
    newSelection = [{ ...selectAllOption }, ...allItems.map((item) => ({ ...item }))];
  } else if (!hasSelectAll && wasSelectAllPreviouslySelected) {
    // User just deselected "Select All" - clear everything
    newSelection = [];
  } else if (hasSelectAll && wasSelectAllPreviouslySelected) {
    // "Select All" is still selected, but user deselected an individual item
    newSelection = selected.filter((item) => item.code !== "ALL").map((item) => ({ ...item }));
  } else {
    // Normal selection without "Select All"
    const selectedWithoutSelectAll = selected?.filter((item) => item.code !== "ALL");

    // Check if all items are now selected - if so, add "Select All"
    if (selectedWithoutSelectAll?.length === allItems?.length && allItems?.length > 0) {
      const selectAllOption = { code: "ALL", name: "Select All" };
      newSelection = [{ ...selectAllOption }, ...allItems?.map((item) => ({ ...item }))];
    } else {
      newSelection = selectedWithoutSelectAll?.map((item) => ({ ...item }));
    }
  }

  return newSelection;
};

// Utility: Filter out "Select All" options
export const filterSelectAll = (items) => {
  return items?.filter((item) => item.code !== "ALL") || [];
};

// Utility: Create cartesian product for mappings
export const createMappingCombinations = (employeeData, categories, subCategories, zones, module, roles, roleGroups = []) => {
  const newMappings = [];
  const actualCategories = filterSelectAll(categories);
  const actualSubCategories = filterSelectAll(subCategories);
  const actualZones = filterSelectAll(zones);
  const actualModules = filterSelectAll(module);

  actualCategories.forEach((category) => {
    actualSubCategories.forEach((subCategory) => {
      actualModules.forEach((module) => {
        const moduleRoles = filterSelectAll(roles).filter((role) =>
          roleGroups.some((group) => group.groupCode === module.code && group.groupId === role.groupId)
        );
        moduleRoles.forEach((role) => {
          actualZones.forEach((zone) => {
            newMappings.push({
              id: Date.now() + Math.random(),
              employeeCode: employeeData.code,
              employeeName: employeeData.name,
              employeeUUID: employeeData.uuid,
              category,
              subCategory,
              zone,
              module,
              role,
              employeeInfo: employeeData,
            });
          });
        });
      });
    });
  });

  return newMappings;
};

// Utility: Transform API response to table data
export const transformMappingData = (
  employees = [],
  pageOffset = 0,
  categoryMap = {},
  subCategoryMap = {},
  zoneMap = {},
  employeeMap = {}
) => {
  if (!Array.isArray(employees) || employees.length === 0) return [];

  // Check if response is flat mapping records from /egov-hrms/obpass/employees/_search
  const isFlatRecord = employees.some((emp) => emp.userUUID && (emp.category || emp.zone));

  if (isFlatRecord) {
    // Group mappings by employee (userUUID)
    const groupedByEmployee = {};

    employees.forEach((item) => {
      const userUUID = item.userUUID || item.uuid;
      if (!userUUID) return;

      if (!groupedByEmployee[userUUID]) {
        const empInfo = employeeMap[userUUID];
        groupedByEmployee[userUUID] = {
          userUUID,
          employeeCode: item.employeeCode || item.code || empInfo?.code || userUUID,
          // Capture the tenant the employee's record lives in (e.g. pb.punjab for state-level employees)
          userTenantId: item.tenantId || empInfo?.employeeObj?.user?.tenantId || null,
          categories: new Set(),
          subCategories: new Set(),
          zones: new Set(),
        };
      }

      if (item.category) {
        const catName = categoryMap[item.category] || item.category;
        groupedByEmployee[userUUID].categories.add(catName);
      }
      if (item.subcategory) {
        const subCatName = subCategoryMap[item.subcategory] || item.subcategory;
        groupedByEmployee[userUUID].subCategories.add(subCatName);
      }
      if (item.zone) {
        const zoneName = zoneMap[item.zone] || item.zone;
        groupedByEmployee[userUUID].zones.add(zoneName);
      }
    });

    return Object.values(groupedByEmployee).map((emp, index) => ({
      id: String(pageOffset + index + 1),
      employeeCode: emp.employeeCode,
      uuid: emp.userUUID,
      userTenantId: emp.userTenantId,
      category: Array.from(emp.categories),
      categoryName: Array.from(emp.categories).join(", ") || "N/A",
      subCategory: Array.from(emp.subCategories),
      subCategoryName: Array.from(emp.subCategories).join(", ") || "N/A",
      zone: Array.from(emp.zones),
      zoneName: Array.from(emp.zones).join(", ") || "N/A",
    }));
  }

  // Already grouped or standard format
  return employees.map((emp, index) => {
    const empInfo = employeeMap[emp.uuid] || employeeMap[emp.userUUID];
    const rawCategories = Array.isArray(emp.categories)
      ? emp.categories
      : emp.category
      ? [emp.category]
      : [];
    const rawSubCategories = Array.isArray(emp.subcategories)
      ? emp.subcategories
      : emp.subcategory
      ? [emp.subcategory]
      : [];
    const rawZones = Array.isArray(emp.zones)
      ? emp.zones
      : emp.zone
      ? [emp.zone]
      : [];

    const categoryNames = rawCategories.map((c) => categoryMap[c] || c);
    const subCategoryNames = rawSubCategories.map((s) => subCategoryMap[s] || s);
    const zoneNames = rawZones.map((z) => zoneMap[z] || z);

    return {
      id: String(pageOffset + index + 1),
      employeeCode: emp.code || emp.employeeCode || empInfo?.code || emp.uuid,
      uuid: emp.userUUID || emp.uuid,
      category: categoryNames,
      categoryName: categoryNames.join(", ") || "N/A",
      subCategory: subCategoryNames,
      subCategoryName: subCategoryNames.join(", ") || "N/A",
      zone: zoneNames,
      zoneName: zoneNames.join(", ") || "N/A",
    };
  });
};

// Utility: Calculate pagination values
export const calculatePagination = (dataLength, pageSize, pageOffset) => {
  const totalRecords = dataLength < pageSize ? pageOffset + dataLength : pageOffset + dataLength + 1;
  const currentPage = Math.floor(pageOffset / pageSize);
  const totalPages = Math.ceil(totalRecords / pageSize);

  return { totalRecords, currentPage, totalPages };
};

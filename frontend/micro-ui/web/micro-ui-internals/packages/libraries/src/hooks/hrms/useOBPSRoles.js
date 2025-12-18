import { useState, useEffect } from "react";

// Utility: Fetch and cache OBPS roles
const fetchOBPSRoles = async (stateId) => {
  try {
    const cachedRoles = sessionStorage.getItem('OBPS_ROLES');
    if (cachedRoles) {
      return JSON.parse(cachedRoles);
    }

    const response = await Digit.MDMSService.getMultipleTypes(stateId, "ACCESSCONTROL-ROLES", ["roles"]);
    const allRoles = response?.['ACCESSCONTROL-ROLES']?.roles || [];
    
    const OBPS_GROUP_ID = "025";
    const obpsRoles = allRoles.filter(role => role.groupId === OBPS_GROUP_ID);
    const obpsRoleCodes = obpsRoles.map(role => role.code);
    
    const obpsRoleMap = {};
    obpsRoles.forEach(role => {
      obpsRoleMap[role.code] = role.name;
    });

    const cacheData = {
      codes: obpsRoleCodes,
      map: obpsRoleMap,
    };

    sessionStorage.setItem('OBPS_ROLES', JSON.stringify(cacheData));
    return cacheData;
  } catch (error) {
    console.error("Error fetching OBPS roles:", error);
    return { codes: [], map: {} };
  }
};

const useOBPSRoles = (stateId) => {
  const [obpsRoles, setObpsRoles] = useState({ codes: [], map: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOBPSRoles = async () => {
      setLoading(true);
      const roles = await fetchOBPSRoles(stateId);
      setObpsRoles(roles);
      setLoading(false);
    };
    loadOBPSRoles();
  }, [stateId]);

  return { obpsRoles, loading };
};

export default useOBPSRoles;

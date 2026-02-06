import { CardLabel, Dropdown, LabelFieldPair, Loader, RemoveableTag, MultiSelectDropdown, LinkLabel } from "@mseva/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import cleanup from "../Utils/cleanup";
// import MultiSelectDropdown from "./Multiselect";

const Jurisdictions = ({ t, config, onSelect, userType, formData }) => {
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const [inactiveJurisdictions, setInactiveJurisdictions] = useState([]);
  const { data: data = {}, isLoading } = Digit.Hooks.hrms.useHrmsMDMS(tenantId, "egov-hrms", "HRMSRolesandDesignation") || {};

  const [jurisdictions, setjurisdictions] = useState(
    formData?.Jurisdictions && formData?.Jurisdictions?.length > 0
      ? formData.Jurisdictions.map((jurisdiction, index) => ({
          ...jurisdiction,
          key: jurisdiction.key !== undefined ? jurisdiction.key : index + 1,
          service: jurisdiction?.service || null, // Preserve service field
        }))
      : [
          {
            id: undefined,
            key: 1,
            hierarchy: null,
            boundaryType: null,
            boundary: null,
            service: null,
            roles: [],
          },
        ]
  );

  useEffect(() => {
    const jurisdictionsData = jurisdictions?.map((jurisdiction) => {
      let res = {
        id: jurisdiction?.id,
        hierarchy: typeof jurisdiction?.hierarchy === 'string'
          ? jurisdiction?.hierarchy
          : jurisdiction?.hierarchy?.code,
        boundaryType: typeof jurisdiction?.boundaryType === 'string'
          ? jurisdiction?.boundaryType
          : jurisdiction?.boundaryType?.label,
        boundary: typeof jurisdiction?.boundary === 'string'
          ? jurisdiction?.boundary
          : jurisdiction?.boundary?.code,
        tenantId: typeof jurisdiction?.boundary === 'string'
          ? jurisdiction?.boundary
          : jurisdiction?.boundary?.code,
        service: jurisdiction?.service, 
        auditDetails: jurisdiction?.auditDetails,
      };
      res = cleanup(res);
      if (jurisdiction?.roles) {
        res["roles"] = jurisdiction?.roles.map((ele) => {
          return ele;
        });
      }
      return res;
    });

    onSelect(
      config.key,
      [...jurisdictionsData, ...inactiveJurisdictions].filter((value) => Object.keys(value).length !== 0)
    );
  }, [jurisdictions]);

  const reviseIndexKeys = () => {
    setjurisdictions((prev) => prev.map((unit, index) => ({ ...unit, key: index + 1 })));
  };

  const handleAddUnit = () => {
    setjurisdictions((prev) => {
      const maxKey = prev.length > 0 ? Math.max(...prev.map(j => j.key || 0)) : 0;
      return [
        ...prev,
        {
          key: maxKey + 1,
          hierarchy: null,
          boundaryType: null,
          boundary: null,
          service: null,
          roles: [],
        },
      ];
    });
  };
  const handleRemoveUnit = (unit) => {
    if (unit.id) {
      let res = {
        id: unit?.id,
        hierarchy: typeof unit?.hierarchy === 'string',
        boundaryType: unit?.boundaryType?.label,
        boundary: unit?.boundary?.code,
        tenantId: unit?.boundary?.code,
        auditDetails: unit?.auditDetails,
        isdeleted: true,
        isActive: false,
      };
      res = cleanup(res);
      if (unit?.roles) {
        res["roles"] = unit?.roles.map((ele) => {
          delete ele.description;
          return ele;
        });
      }
      setInactiveJurisdictions([...inactiveJurisdictions, res]);
    }
    setjurisdictions((prev) => prev.filter((el) => el.key !== unit.key));
    if (FormData.errors?.Jurisdictions?.type == unit.key) {
      clearErrors("Jurisdictions");
    }
    reviseIndexKeys();
  };
  let hierarchylist = [];
  let boundaryTypeoption = [];
  const [focusIndex, setFocusIndex] = useState(-1);

  function gethierarchylistdata() {
    return data?.MdmsRes?.["egov-location"]["TenantBoundary"].map((ele) => ele.hierarchyType);
  }

  function getboundarydata() {
    return [];
  }

  function getroledata() {
    return data?.MdmsRes?.["ACCESSCONTROL-ROLES"].roles.map((role) => {
      return { code: role.code, name: role?.name ? role?.name : " ", labelKey: "ACCESSCONTROL_ROLES_ROLES_" + role.code };
    });
  }
  
  // Helper function to get hierarchy value for dropdown
  const getHierarchyValue = (jurisdiction, hierarchyData) => {
    if (!jurisdiction.hierarchy) return null;
    if (typeof jurisdiction.hierarchy === 'object') return jurisdiction.hierarchy;
    // If it's a string code, find the matching object from MDMS
    return hierarchyData?.find(h => h.code === jurisdiction.hierarchy) || null;
  };
  
  // Helper function to get boundaryType value for dropdown
  const getBoundaryTypeValue = (jurisdiction, boundaryTypeData) => {
    if (!jurisdiction.boundaryType) return null;
    if (typeof jurisdiction.boundaryType === 'object') return jurisdiction.boundaryType;
    // If it's a string label, find matching object
    return boundaryTypeData?.find(bt => bt.label === jurisdiction.boundaryType) || null;
  };
  
  // Helper function to get boundary value for dropdown
  const getBoundaryValue = (jurisdiction, boundaryData) => {
    if (!jurisdiction.boundary) return null;
    if (typeof jurisdiction.boundary === 'object') return jurisdiction.boundary;
    // If it's a string code, find matching object
    return boundaryData?.find(b => b.code === jurisdiction.boundary) || null;
  };

  if (isLoading) {
    return <Loader />;
  }
  return (
    <div>
      {jurisdictions?.map((jurisdiction, index) => (
        <Jurisdiction
          t={t}
          formData={formData}
          jurisdictions={jurisdictions}
          key={jurisdiction.key}
          keys={jurisdiction.key}
          data={data}
          jurisdiction={jurisdiction}
          setjurisdictions={setjurisdictions}
          index={index}
          focusIndex={focusIndex}
          setFocusIndex={setFocusIndex}
          gethierarchylistdata={gethierarchylistdata}
          hierarchylist={hierarchylist}
          boundaryTypeoption={boundaryTypeoption}
          getboundarydata={getboundarydata}
          getroledata={getroledata}
          handleRemoveUnit={handleRemoveUnit}
          getHierarchyValue={getHierarchyValue}
          getBoundaryTypeValue={getBoundaryTypeValue}
          getBoundaryValue={getBoundaryValue}
        />
      ))}
      <LinkLabel
        style={{
          display: "inline-block",
          padding: "8px 16px",
          background: "linear-gradient(135deg, #2563eb, #1e40af)",
          color: "#FFFFFF",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "13px",
          fontWeight: "600",
          textDecoration: "none",
          marginTop: "16px",
          marginBottom: "8px",
          border: "none",
          transition: "background-color 0.2s ease",
        }}
        onClick={handleAddUnit}
      >
        {t("HR_ADD_JURISDICTION")}
      </LinkLabel>
    </div>
  );
};

function Jurisdiction({
  t,
  data,
  jurisdiction,
  jurisdictions,
  setjurisdictions,
  gethierarchylistdata,
  handleRemoveUnit,
  hierarchylist,
  getroledata,
  roleoption,
  index,
  getHierarchyValue,
  getBoundaryTypeValue,
  getBoundaryValue,
}) {
  console.log(`🔷 JURISDICTION COMPONENT RENDER - Key: ${jurisdiction.key}, Index: ${index}, Boundary: ${typeof jurisdiction?.boundary === 'string' ? jurisdiction?.boundary : jurisdiction?.boundary?.code}`);
  
  const tenantId = Digit.ULBService.getCurrentTenantId();

  const [BoundaryType, selectBoundaryType] = useState([]);
  const [Boundary, selectboundary] = useState([]);
  const [getRoles, setRoles] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const jurisdictionKeyRef = React.useRef(jurisdiction.key);
  
  // Initialize Boundary dropdown immediately if data is available
  useEffect(() => {
    if (data?.MdmsRes?.tenant?.tenants) {
      const allCities = data?.MdmsRes?.tenant?.tenants
        .filter((city) => city.code != Digit.ULBService.getStateId())
        .map((city) => {
          return { ...city, i18text: Digit.Utils.locale.getCityLocale(city.code) };
        });
      selectboundary(allCities);
    }
  }, [data?.MdmsRes]);
  
  useEffect(() => {
    // Get hierarchy code - handle both string and object formats
    const hierarchyCode = typeof jurisdiction?.hierarchy === 'string' 
      ? jurisdiction?.hierarchy 
      : jurisdiction?.hierarchy?.code;
    
    if (hierarchyCode && data?.MdmsRes?.["egov-location"]["TenantBoundary"]) {
      const boundaryTypes = data?.MdmsRes?.["egov-location"]["TenantBoundary"]
        .filter((ele) => {
          return ele?.hierarchyType?.code == hierarchyCode;
        })
        .map((item) => {
          return { ...item.boundary, i18text: Digit.Utils.locale.convertToLocale(item.boundary.label, "EGOV_LOCATION_BOUNDARYTYPE") };
        });
      selectBoundaryType(boundaryTypes);
    }
  }, [jurisdiction?.hierarchy, data?.MdmsRes]);
  const tenant = Digit.ULBService.getCurrentTenantId();

  const { data: roleGroups = [], isLoading: roleGroupsLoading } = Digit.Hooks.useCustomMDMS(tenantId, "ACCESSCONTROL-ROLES", [
    { name: "roleGroups" },
  ]);

  console.log("roleGroups", roleGroups);

  // Initialize boundary object only once on mount if needed
  useEffect(() => {
    console.log(`🔷🔶 BOUNDARY INIT useEffect - Key: ${jurisdiction.key}, KeyRef: ${jurisdictionKeyRef.current}, isInitialized: ${isInitialized}, Boundary length: ${Boundary?.length}`);
    
    // Only run if this is the correct component instance for this jurisdiction key
    if (jurisdictionKeyRef.current !== jurisdiction.key) {
      console.log(`🔷⚠️ KEY MISMATCH - Resetting initialization. Old: ${jurisdictionKeyRef.current}, New: ${jurisdiction.key}`);
      // Jurisdiction data has changed, reset initialization
      setIsInitialized(false);
      jurisdictionKeyRef.current = jurisdiction.key;
    }
    
    // Only run if not already initialized and boundary exists
    if (!isInitialized && Boundary?.length > 0 && jurisdiction?.boundary) {
      const boundaryCode = typeof jurisdiction?.boundary === 'string' 
        ? jurisdiction?.boundary 
        : jurisdiction?.boundary?.code;
      
      console.log(`🔷🎯 Attempting to initialize boundary for Key: ${jurisdiction.key}, BoundaryCode: ${boundaryCode}, Type: ${typeof jurisdiction?.boundary}`);
      
      // Only convert string to object, don't update if already an object
      if (boundaryCode && typeof jurisdiction?.boundary === 'string') {
        const boundaryObj = Boundary?.find((ele) => ele.code === boundaryCode);
        if (boundaryObj) {
          console.log(`🔷✅ Converting string to object for Key: ${jurisdiction.key}, Boundary: ${boundaryCode}`);
          selectedboundary(boundaryObj);
          setIsInitialized(true);
        }
      } else if (typeof jurisdiction?.boundary === 'object') {
        console.log(`🔷 ${jurisdiction.key}, marking initialized`);
        // Already an object, mark as initialized
        setIsInitialized(true);
      }
    }
  }, [Boundary, isInitialized, jurisdiction?.boundary, jurisdiction.key]);
  
  // Restore roles when jurisdiction already has a service selected (e.g., when navigating back)
  useEffect(() => {
    if (jurisdiction?.service && data?.MdmsRes?.["ACCESSCONTROL-ROLES"]?.roles) {
      handleService(jurisdiction.service);
    }
  }, [jurisdiction?.service, data?.MdmsRes]);

  const selectHierarchy = (value) => {
    const currentKey = jurisdiction.key;
    console.log(`🔷📍 selectHierarchy called - Key: ${currentKey}, Value:`, value?.code || value);
    setjurisdictions((pre) => {
      console.log(`🔷📍 selectHierarchy setState - Updating key: ${currentKey}`, pre.map(j => `Key:${j.key} Boundary:${j.boundary?.code || j.boundary}`));
      return pre.map((item) => {
        if (item.key === currentKey) {
          return { ...item, hierarchy: value };
        }
        return item;
      });
    });
  };

  const selectboundaryType = (value) => {
    const currentKey = jurisdiction.key;
    console.log(`🔷📍 selectboundaryType called - Key: ${currentKey}, Value:`, value?.label || value);
    setjurisdictions((pre) => {
      console.log(`🔷📍 selectboundaryType setState BEFORE - Updating key: ${currentKey}`, pre.map(j => `Key:${j.key} Boundary:${j.boundary?.code || j.boundary}`));
      const result = pre.map((item) => {
        if (item.key === currentKey) {
          console.log(`🔷✏️ Updating boundaryType for Key: ${currentKey}`);
          return { ...item, boundaryType: value };
        }
        return item;
      });
      console.log(`🔷📍 selectboundaryType setState AFTER`, result.map(j => `Key:${j.key} Boundary:${j.boundary?.code || j.boundary}`));
      return result;
    });
  };

  const selectedboundary = (value) => {
    const currentKey = jurisdiction.key;
    const boundaryCode = value?.code || value;
    console.log(`🔷🎯 selectedboundary called - Key: ${currentKey}, Value: ${boundaryCode}`);
    setjurisdictions((pre) => {
      console.log(`🔷🎯 selectedboundary setState BEFORE - Updating key: ${currentKey}`);
      console.log('🔷BEFORE STATE:', pre.map(j => `Key:${j.key} Boundary:${j.boundary?.code || j.boundary} BoundaryType:${j.boundaryType?.label || j.boundaryType}`));
      
      const result = pre.map((item) => {
        if (item.key === currentKey) {
          console.log(`🔷✅ UPDATING BOUNDARY for Key: ${currentKey} to ${boundaryCode}`);
          return { 
            ...item, 
            boundary: value,
            tenantId: boundaryCode
          };
        }
        console.log(`🔷⏭️ SKIPPING Key: ${item.key} (current: ${currentKey})`);
        return item;
      });
      
      console.log('🔷AFTER STATE:', result.map(j => `Key:${j.key} Boundary:${j.boundary?.code || j.boundary} BoundaryType:${j.boundaryType?.label || j.boundaryType}`));
      return result;
    });
  };

  const handleService = (value) => {
    console.log("value", value);

    const groupId = value?.groupId;

    const rolesData = data?.MdmsRes?.["ACCESSCONTROL-ROLES"].roles;

    console.log("rolesData==", rolesData);

    const filterData = rolesData?.filter((item) => item?.groupId == groupId);
    console.log("filterData==", filterData);

    const mapRoles = filterData?.map((roles) => {
      return { code: roles.code, name: roles?.name ? roles?.name : " ", labelKey: "ACCESSCONTROL_ROLES_ROLES_" + roles.code, description: value?.groupName || roles?.description || "" };
    });

    console.log("mapRoles", mapRoles);

    setRoles(mapRoles);
    
    // Store the selected service in jurisdiction state
    const currentKey = jurisdiction.key;
    setjurisdictions((pre) => pre.map((item) => {
      if (item.key === currentKey) {
        return { ...item, service: value };
      }
      return item;
    }));
  };

  const selectrole = (e, data) => {
    let res = [];
    e &&
      e?.map((ob) => {
        res.push(ob?.[1]);
      });

    res?.forEach((resData) => {
      resData.labelKey = "ACCESSCONTROL_ROLES_ROLES_" + resData.code;
      resData.description = resData?.description || data?.groupName || ""
    });

    console.log("res====", res);

    const currentKey = jurisdiction.key;
    setjurisdictions((pre) => pre.map((item) => {
      if (item.key === currentKey) {
        return { ...item, roles: res };
      }
      return item;
    }));
  };

  const onRemove = (index, key) => {
    let afterRemove = jurisdiction?.roles.filter((value, i) => {
      return i !== index;
    });
    const currentKey = jurisdiction.key;
    setjurisdictions((pre) => pre.map((item) => {
      if (item.key === currentKey) {
        return { ...item, roles: afterRemove };
      }
      return item;
    }));
  };
  return (
    <div key={jurisdiction?.keys} style={{ marginBottom: "16px" }}>
      <div style={{ border: "1px solid #E3E3E3", padding: "16px", marginTop: "8px" }}>
        <LabelFieldPair>
          <div className="label-field-pair" style={{ width: "100%" }}>
            <h2 className="card-label card-label-smaller hrms-text-transform-none" style={{ color: "#505A5F" }}>
              {t("HR_JURISDICTION")} {index + 1}
            </h2>
          </div>
          {jurisdictions.length > 1 ? (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: "16px",
                paddingRight: "8px",
              }}
            >
              <div
              className="hrms-delete-icon-button"
                onClick={() => handleRemoveUnit(jurisdiction)}
                // onMouseEnter={(e) => {
                //   const svg = e.currentTarget.querySelector("svg");
                //   const path = svg.querySelector("path");
                //   e.currentTarget.style.transform = "scale(1.1)";
                //   e.currentTarget.style.opacity = "0.8";
                //   path.style.fill = "#2341e9b2";
                // }}
                // onMouseLeave={(e) => {
                //   const svg = e.currentTarget.querySelector("svg");
                //   const path = svg.querySelector("path");
                //   e.currentTarget.style.transform = "scale(1)";
                //   e.currentTarget.style.opacity = "1";
                //   path.style.fill = "#6b7280";
                // }}
                // style={{
                //   cursor: "pointer",
                //   padding: "4px",
                //   borderRadius: "4px",
                //   display: "flex",
                //   alignItems: "center",
                //   justifyContent: "center",
                //   transition: "all 0.2s ease",
                //   backgroundColor: "transparent",
                // }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 16C1 17.1 1.9 18 3 18H11C12.1 18 13 17.1 13 16V4H1V16ZM14 1H10.5L9.5 0H4.5L3.5 1H0V3H14V1Z" fill="#6b7280" />
                </svg>
              </div>
            </div>
          ) : null}
        </LabelFieldPair>
        <LabelFieldPair>
          <CardLabel isMandatory={true} className="card-label-smaller hrms-text-transform-none">{`${t("HR_HIERARCHY_LABEL")}`}<span className="hrms-emp-mapping__required-asterisk"> * </span></CardLabel>
          <Dropdown
            className="form-field"
            selected={getHierarchyValue(jurisdiction, gethierarchylistdata(hierarchylist))}
            disable={false}
            isMandatory={true}
            option={gethierarchylistdata(hierarchylist) || []}
            select={selectHierarchy}
            optionKey="code"
            placeholder={t("HR_HIERARCHY_PLACEHOLDER")}
            t={t}
          />
        </LabelFieldPair>
        <LabelFieldPair>
          <CardLabel className="card-label-smaller hrms-text-transform-none">{`${t("HR_BOUNDARY_TYPE_LABEL")} `}<span className="hrms-emp-mapping__required-asterisk"> * </span></CardLabel>
          <Dropdown
            className="form-field"
            isMandatory={true}
            selected={getBoundaryTypeValue(jurisdiction, BoundaryType)}
            disable={BoundaryType?.length === 0}
            option={BoundaryType}
            select={selectboundaryType}
            optionKey="i18text"
            placeholder={t("HR_BOUNDARY_TYPE_PLACEHOLDER")}
            t={t}
          />
        </LabelFieldPair>
        <LabelFieldPair>
          <CardLabel className="card-label-smaller hrms-text-transform-none">{`${t("HR_BOUNDARY_LABEL")} `}<span className="hrms-emp-mapping__required-asterisk"> * </span></CardLabel>
          <Dropdown
            className="form-field"
            isMandatory={true}
            selected={getBoundaryValue(jurisdiction, Boundary)}
            disable={Boundary?.length === 0}
            option={Boundary}
            select={selectedboundary}
            optionKey="i18text"
            placeholder={t("HR_BOUNDARY_PLACEHOLDER")}
            t={t}
          />
        </LabelFieldPair>

        <LabelFieldPair>
          <CardLabel className="card-label-smaller hrms-text-transform-none">{`${t("SELECT_SERVICE")} `}<span className="hrms-emp-mapping__required-asterisk"> * </span></CardLabel>
          <Dropdown
            className="form-field"
            isMandatory={true}
            selected={jurisdiction?.service}
            // disable={Boundary?.length === 0}
            option={roleGroups?.["ACCESSCONTROL-ROLES"]?.roleGroups}
            select={handleService}
            optionKey="groupName"
            placeholder={t("HR_SERVICE_PLACEHOLDER")}
            t={t}
          />
        </LabelFieldPair>

        <LabelFieldPair>
          <CardLabel className="card-label-smaller hrms-text-transform-none">{t("HR_COMMON_TABLE_COL_ROLE")} <span className="hrms-emp-mapping__required-asterisk"> * </span></CardLabel>
          <div className="form-field hrmsMLS">
            <MultiSelectDropdown
              className="form-field"
              isMandatory={true}
              defaultUnit="Selected"
              selected={jurisdiction?.roles}
              // options={getroledata(roleoption)}
              options={getRoles}
              onSelect={selectrole}
              optionsKey="name"
              defaultLabel={t("HR_ROLE_PLACEHOLDER")}
              t={t}
            />
            <div className="tag-container">
              {jurisdiction?.roles.length > 0 &&
                jurisdiction?.roles.map((value, index) => {
                  return <RemoveableTag key={index} text={`${t(value["labelKey"]).slice(0, 22)} ...`} onClick={() => onRemove(index, value)} />;
                })}
            </div>
          </div>
        </LabelFieldPair>
      </div>
    </div>
  );
}

export default Jurisdictions;

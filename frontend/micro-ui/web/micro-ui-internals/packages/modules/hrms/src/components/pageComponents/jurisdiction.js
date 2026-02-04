import { CardLabel, Dropdown, LabelFieldPair, Loader, RemoveableTag, MultiSelectDropdown, LinkLabel } from "@mseva/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import cleanup from "../Utils/cleanup";
// import MultiSelectDropdown from "./Multiselect";

const Jurisdictions = ({ t, config, onSelect, userType, formData }) => {
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const [inactiveJurisdictions, setInactiveJurisdictions] = useState([]);
  const { data: data = {}, isLoading } = Digit.Hooks.hrms.useHrmsMDMS(tenantId, "egov-hrms", "HRMSRolesandDesignation") || {};

  const [jurisdictions, setjurisdictions] = useState(
    formData?.Jurisdictions || [
      {
        id: undefined,
        key: 1,
        hierarchy: null,
        boundaryType: null,
        boundary: null,
        roles: [],
      },
    ]
  );

  useEffect(() => {
    const jurisdictionsData = jurisdictions?.map((jurisdiction) => {
      let res = {
        id: jurisdiction?.id,
        hierarchy: jurisdiction?.hierarchy?.code,
        boundaryType: jurisdiction?.boundaryType?.label,
        boundary: jurisdiction?.boundary?.code,
        tenantId: jurisdiction?.boundary?.code,
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
    setjurisdictions((prev) => prev.map((unit, index) => ({ ...unit, key: index })));
  };

  const handleAddUnit = () => {
    setjurisdictions((prev) => [
      ...prev,
      {
        key: prev.length + 1,
        hierarchy: null,
        boundaryType: null,
        boundary: null,
        roles: [],
      },
    ]);
  };
  const handleRemoveUnit = (unit) => {
    if (unit.id) {
      let res = {
        id: unit?.id,
        hierarchy: unit?.hierarchy?.code,
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
          key={index}
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
}) {
  const tenantId = Digit.ULBService.getCurrentTenantId();

  const [BoundaryType, selectBoundaryType] = useState([]);
  const [Boundary, selectboundary] = useState([]);
  const [getRoles, setRoles] = useState([]);
  useEffect(() => {
    selectBoundaryType(
      data?.MdmsRes?.["egov-location"]["TenantBoundary"]
        .filter((ele) => {
          return ele?.hierarchyType?.code == jurisdiction?.hierarchy?.code;
        })
        .map((item) => {
          return { ...item.boundary, i18text: Digit.Utils.locale.convertToLocale(item.boundary.label, "EGOV_LOCATION_BOUNDARYTYPE") };
        })
    );
  }, [jurisdiction?.hierarchy, data?.MdmsRes]);
  const tenant = Digit.ULBService.getCurrentTenantId();

  const { data: roleGroups = [], isLoading: roleGroupsLoading } = Digit.Hooks.useCustomMDMS(tenantId, "ACCESSCONTROL-ROLES", [
    { name: "roleGroups" },
  ]);

  console.log("roleGroups", roleGroups);

  useEffect(() => {
    selectboundary(
      data?.MdmsRes?.tenant?.tenants
        .filter((city) => city.code != Digit.ULBService.getStateId())
        .map((city) => {
          return { ...city, i18text: Digit.Utils.locale.getCityLocale(city.code) };
        })
    );
  }, [jurisdiction?.boundaryType, data?.MdmsRes]);

  useEffect(() => {
    if (Boundary?.length > 0) {
      selectedboundary(Boundary?.filter((ele) => ele.code == jurisdiction?.boundary?.code)[0]);
    }
  }, [Boundary]);

  const selectHierarchy = (value) => {
    setjurisdictions((pre) => pre.map((item) => (item.key === jurisdiction.key ? { ...item, hierarchy: value } : item)));
  };

  const selectboundaryType = (value) => {
    setjurisdictions((pre) => pre.map((item) => (item.key === jurisdiction.key ? { ...item, boundaryType: value } : item)));
  };

  const selectedboundary = (value) => {
    setjurisdictions((pre) => pre.map((item) => (item.key === jurisdiction.key ? { ...item, boundary: value } : item)));
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

    // return data?.MdmsRes?.["ACCESSCONTROL-ROLES"].roles.map((role) => {
    //   return { code: role.code, name: role?.name ? role?.name : " ", labelKey: "ACCESSCONTROL_ROLES_ROLES_" + role.code };
    // });
  };

  const selectrole = (e, data) => {
    // const index = jurisdiction?.roles.filter((ele) => ele.code == data.code);
    // let res = null;
    // if (index.length) {
    //   jurisdiction?.roles.splice(jurisdiction?.roles.indexOf(index[0]), 1);
    //   res = jurisdiction.roles;
    // } else {
    //   res = [{ ...data }, ...jurisdiction?.roles];
    // }
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

    setjurisdictions((pre) => pre.map((item) => (item.key === jurisdiction.key ? { ...item, roles: res } : item)));
  };

  const onRemove = (index, key) => {
    let afterRemove = jurisdiction?.roles.filter((value, i) => {
      return i !== index;
    });
    setjurisdictions((pre) => pre.map((item) => (item.key === jurisdiction.key ? { ...item, roles: afterRemove } : item)));
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
                onClick={() => handleRemoveUnit(jurisdiction)}
                onMouseEnter={(e) => {
                  const svg = e.currentTarget.querySelector("svg");
                  const path = svg.querySelector("path");
                  e.currentTarget.style.transform = "scale(1.1)";
                  e.currentTarget.style.opacity = "0.8";
                  path.style.fill = "#2341e9b2";
                }}
                onMouseLeave={(e) => {
                  const svg = e.currentTarget.querySelector("svg");
                  const path = svg.querySelector("path");
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.opacity = "1";
                  path.style.fill = "#6b7280";
                }}
                style={{
                  cursor: "pointer",
                  padding: "4px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease",
                  backgroundColor: "transparent",
                }}
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
            selected={jurisdiction?.hierarchy}
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
            selected={jurisdiction?.boundaryType}
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
            selected={jurisdiction?.boundary}
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
            selected={jurisdiction?.boundary}
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

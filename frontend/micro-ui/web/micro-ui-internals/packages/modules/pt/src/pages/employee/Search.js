import { ActionButton, Localities, Toast } from "@mseva/digit-ui-react-components";
import PropertyType from "../../utils/PropertyType";
import React, { memo, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const styles = {
 
  heroTitle: { margin: "1rem", fontSize: "24px", fontWeight: 700, color: "#0b0c0c", lineHeight: 1.3 },
  formCard: {
    padding: "20px",
    borderRadius: "12px",
    backgroundColor: "#ffffff",
    border: "1px solid #e0e3eb",
    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.06)",
    boxSizing: "border-box",
    width: "100%",
    minWidth: 0,
  },
  resultsWrap: { marginTop: "20px", width: "100%", minWidth: 0, boxSizing: "border-box" },
};

const PTSearchFields = {
  searchId: {
    tenantId: {
      type: "ulb",
      label: "PT_SEARCH_ULB",
      placeHolder: "PT_SEARCH_ULB_PLACEHOLDER",
      validation: {
        required: "PTULBMANDATORY",
      },
    },
    mobileNumber: {
      type: "text",
      label: "PT_HOME_SEARCH_RESULTS_OWN_MOB_LABEL",
      placeHolder: "PT_HOME_SEARCH_RESULTS_OWN_MOB_PLACEHOLDER",
      validation: {
        minLength: {
          value: 10,
          message: "CORE_COMMON_MOBILE_ERROR",
        },
        maxLength: {
          value: 10,
          message: "CORE_COMMON_MOBILE_ERROR",
        },
        pattern: {
          value: /[6789][0-9]{9}/,
          message: "CORE_COMMON_MOBILE_ERROR",
        },
      },
    },
    propertyIds: {
      type: "text",
      label: "PT_PROPERTY_UNIQUE_ID",
      placeHolder: "PT_PROPERTY_UNIQUE_ID_PLACEHOLDER",
      validation: {
        pattern: {
          value:
            "/[A-Za-z]{2}-[A-Za-z]{2}-[0-9]{4}-[0-9]{4}-[0-9]{2}-[0-9]{2}-[0-9]{6}|[A-Za-z]{2}-[A-Za-z]{2}-[0-9]{4}-[0-9]{2}-[0-9]{2}-[0-9]{6}/,PG-PT-dddd-dddd-dd-dd-dddddd",
          message: "ERR_INVALID_PROPERTY_ID",
        },
      },
    },
    oldpropertyids: {
      type: "text",
      label: "PT_EXISTING_PROPERTY_ID",
      placeholder: "PT_EXISTING_PROPERTY_ID_PLACEHOLDER",
      validation: {
        pattern: {
          value:
            "/[A-Za-z]{2}-[A-Za-z]{2}-[0-9]{4}-[0-9]{4}-[0-9]{2}-[0-9]{2}-[0-9]{6}|[A-Za-z]{2}-[A-Za-z]{2}-[0-9]{4}-[0-9]{2}-[0-9]{2}-[0-9]{6}/,PG-PT-dddd-dddd-dd-dd-dddddd",
          message: "ERR_INVALID_PROPERTY_ID",
        },
      },
    },
    locality: {
      type: "custom",
      label: "PT_SEARCH_LOCALITY",
      placeHolder: "PT_SEARCH_LOCALITY_PLACEHOLDER",
      customComponent: Localities,
      customCompProps: {
        boundaryType: "revenue",
        keepNull: false,
        optionCardStyles: { height: "600px", overflow: "auto", zIndex: "10" },
        disableLoader: true,
      },
    },
    name: {
      type: "text",
      label: "PT_SEARCHPROPERTY_TABEL_OWNERNAME",
      placeHolder: "PT_SEARCH_OWNER_NAME_PLACEHOLDER",
      validation: {
        minLength: {
          value: 3,
          message: "PT_MIN_3CHAR",
        },
        pattern: {
          value: "^[a-zA-Z ]+$",
          message: "PAYMENT_INVALID_NAME",
        },
      },
    },
    surveyId: {
      type: "text",
      label: "PT_SEARCH_SURVEYID",
      placeHolder: "PT_SEARCH_SURVEY_ID_PLACEHOLDER",
      validation: {
        minLength: {
          value: 3,
          message: "PT_MIN_3CHAR",
        },
        pattern: {
          value: "^[a-zA-Z ]+$",
          message: "PAYMENT_INVALID_NAME",
        },
      },
    },

    // acknowledgementIds: {
    //   type: "text",
    //   label: "PT_PROPERTY_APPLICATION_NO",
    //   placeholder: "PT_PROPERTY_APPLICATION_NO_PLACEHOLDER",
    //   validation: {
    //     pattern: {
    //       value: /^[a-zA-Z0-9-]*$/i,
    //       message: "ERR_INVALID_PROPERTY_ID",
    //     },
    //   },
    // }
  },
  searchDetail: {
    locality: {
      type: "custom",
      label: "PT_SEARCH_LOCALITY",
      placeHolder: "PT_SEARCH_LOCALITY_PLACEHOLDER",
      validation: {
        required: "PTLOCALITYMANDATORY",
      },
      customComponent: Localities,
      customCompProps: {
        boundaryType: "revenue",
        keepNull: false,
        optionCardStyles: { height: "600px", overflow: "auto", zIndex: "10" },
        disableLoader: true,
      },
    },
    // doorNo: {
    //   type: "text",
    //   label: "PT_SEARCHPROPERTY_TABEL_DOOR_NO",
    //   placeHolder: "PT_SEARCH_DOOR_NO_PLACEHOLDER",
    //   validation: {
    //     pattern: {
    //       value:  "[A-Za-z0-9#,/ -()]{1,63}",
    //       message: "ERR_INVALID_DOOR_NO",
    //     },
    //   },
    // },
  },
  defaulterNotice: {
    // propertyType: {
    //   type: "custom",
    //   label: "PT_SEARCH_PROPERTY_TYPE",
    //   placeHolder: "PT_SEARCH_PROPERTY_TYPE_PLACEHOLDER",
    //   validation: {
    //     required: "PTPROPERTYTYPEMANDATORY",
    //   },
    //   customComponent: PropertyType,
    //   customCompProps: {
    //     keepNull: false,
    //     optionCardStyles: { height: "600px", overflow: "auto", zIndex: "10" },
    //     disableLoader: true,
    //   },
    // }
    // propertyType: {
    //   type: "propertyType",
    //   label: "PT_SEARCHPROPERTY_TABEL_PROPERTY_TYPE",
    //   placeHolder: "PT_SEARCH_DOOR_NO_PLACEHOLDER",
    // },
  },
};

const Search = () => {
  const { t } = useTranslation();
  const tenantId = window.location.href.includes("employee") ? Digit.ULBService.getCurrentTenantId() : localStorage.getItem("CITIZEN.CITY");
  console.log("tenantId in prop search", tenantId);
  const defaultValues = {
    tenantId: {
      code: tenantId,
    },
    propertyIds: "",
    mobileNumber: "",
    oldpropertyids: "",
    locality: "",
    name: "",
    // propertyType:""
  };
  const [payload, setPayload] = useState({});
  const [searchTenantId, setSearchTenantId] = useState(tenantId);
  const [formData, setFormData] = useState(defaultValues);
  const [searchBy, setSearchBy] = useState("searchId");
  const [showToast, setShowToast] = useState(null);
  const SearchComponent = memo(Digit.ComponentRegistryService.getComponent("PropertySearchForm"));
  const SearchResultComponent = memo(Digit.ComponentRegistryService.getComponent("PropertySearchResults"));
  const SearchPTIDPropComponent = memo(Digit.ComponentRegistryService.getComponent("SearchPTIDProp"));
  const { data: ptSearchConfig, isLoading } = Digit.Hooks.pt.useMDMS(Digit.ULBService.getStateId(), "DIGIT-UI", "HelpText", {
    select: (data) => {
      return data?.["DIGIT-UI"]?.["HelpText"]?.[0]?.PT;
    },
  });

  const onReset = useCallback(() => {
    setFormData({
      ...defaultValues,
      tenantId: {
        code: tenantId,
      },
    });
    setPayload({});
    setSearchTenantId(tenantId);
    setShowToast(null);
  });

  useEffect(() => {
    if (sessionStorage.getItem("searchDetailValue") == 1 && searchBy === "searchId") {
      setSearchBy("searchDetail");
    }
  }, [searchBy]);
  const onSubmit = useCallback((_data) => {
    console.log("_data", _data);
    const selectedTenantId = _data?.tenantId?.code || tenantId;

    if (Object.keys(_data).includes("propertyType")) {
      setFormData(_data);
      console.log("_data2", payload);
      setPayload({ locality: _data.locality.code, propertyType: _data.propertyType.code });
      setSearchTenantId(selectedTenantId);
      console.log("_data3", payload);
    } else {
      setFormData(_data);
      console.log("_data5", formData);

      const hasOwnerName = typeof _data?.name === "string" ? !!_data.name.trim() : !!_data?.name;
      const hasPropertyId = typeof _data?.propertyIds === "string" ? !!_data.propertyIds.trim() : !!_data?.propertyIds;
      const hasMobileNumber = typeof _data?.mobileNumber === "string" ? !!_data.mobileNumber.trim() : !!_data?.mobileNumber;
      const hasOldPropertyId = typeof _data?.oldpropertyids === "string" ? !!_data.oldpropertyids.trim() : !!_data?.oldpropertyids;
      const hasLocality = !!(_data?.locality?.code || (typeof _data?.locality === "string" && _data.locality.trim()));
      const hasSurveyId = typeof _data?.surveyId === "string" ? !!_data.surveyId.trim() : !!_data?.surveyId;

      const isOnlyNameFilled = hasOwnerName && !hasPropertyId && !hasMobileNumber && !hasOldPropertyId && !hasLocality && !hasSurveyId;

      const hasAnyField = hasOwnerName || hasPropertyId || hasMobileNumber || hasOldPropertyId || hasLocality || hasSurveyId;

      if (!hasAnyField) {
        setShowToast({ warning: true, label: "ERR_PT_FILL_VALID_FIELDS" });
      } else if (isOnlyNameFilled) {
        setShowToast({
          warning: true,
          label:
            t("ERR_PT_PROVIDE_ONE_MORE_FIELD") !== "ERR_PT_PROVIDE_ONE_MORE_FIELD"
              ? "ERR_PT_PROVIDE_ONE_MORE_FIELD"
              : "Please provide at least one more additional field (Property ID, Mobile Number, Existing Property ID, Locality, or Survey ID)",
        });
      } else {
        const finalPayload = Object.keys(_data)
          .filter((k) => _data[k])
          .reduce(
            (acc, key) => ({
              ...acc,
              [key]: key === "tenantId" ? _data[key]?.code : typeof _data[key] === "object" ? _data[key]?.code : _data[key],
            }),
            {}
          );

        console.log("FINAL PAYLOAD", finalPayload);

        setPayload(finalPayload);
        setSearchTenantId(selectedTenantId);
        setShowToast(null);
      }
    }
  });
  return (
    <React.Fragment>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <h1 style={styles.heroTitle}>{t("SEARCH_PROPERTY")}</h1>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-end", gap: "12px", marginLeft: "auto" }}>
            <ActionButton to="/digit-ui/employee/pt/new-application" label={t("ES_TITLE_NEW_REGISTRATION")} showPlusIcon />
            <ActionButton to="/digit-ui/employee/pt/search" label={t("PT_SEARCH_PROPERTY")} primary />
            <ActionButton to="/digit-ui/employee/pt/application-search" label={t("ES_COMMON_APPLICATION_SEARCH")} />
          </div>
        </div>
      <div style={styles.formCard}>
        <SearchComponent
          t={t}
          payload={formData}
          searchBy={searchBy}
          setSearchBy={setSearchBy}
          PTSearchFields={PTSearchFields}
          tenantId={tenantId}
          onSubmit={onSubmit}
          onReset={onReset}
        />
      </div>

      <div style={styles.resultsWrap}>
      {Object.keys(payload).includes("propertyType") ? (
        <SearchPTIDPropComponent
          t={t}
          showToast={showToast}
          setShowToast={setShowToast}
          tenantId={searchTenantId}
          payload={payload}
          ptSearchConfig={{ ...ptSearchConfig }}
        />
      ) : Object.keys(payload).length > 0 ? (
        <SearchResultComponent
          t={t}
          showToast={showToast}
          setShowToast={setShowToast}
          tenantId={searchTenantId}
          payload={payload}
          ptSearchConfig={{ ...ptSearchConfig }}
        />
      ) : (
        ""
      )}
      </div>
      {showToast && (
        <Toast
          error={showToast.error}
          warning={showToast.warning}
          label={t(showToast.label)}
          onClose={() => {
            setShowToast(null);
          }}
        />
      )}
    </React.Fragment>
  );
};

export default Search;

import { useState, useEffect, useMemo } from "react";
import { sortDropdownNames, stringReplaceAll } from "../../../../modules/obps/src/utils";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";

const useEDCRForm = ({ formData }) => {
  const stateId = Digit.ULBService.getStateId();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const [citymoduleList, setCitymoduleList] = useState([]);
  const [name, setName] = useState(formData?.Scrutiny?.[0]?.applicantName || "");
  const [ulb, setUlb] = useState(formData?.Scrutiny?.[0]?.ulbName || "");
  const [areaType, setAreaType] = useState(formData?.Scrutiny?.[0]?.areaType || null);
  const [schName, setSchName] = useState(formData?.Scrutiny?.[0]?.schemeName || "");
  const [schemeArea, setSchemeArea] = useState(formData?.Scrutiny?.[0]?.schemeType || null);
  const [cluApprove, setCluApproved] = useState(formData?.Scrutiny?.[0]?.isCluApproved || null);
  const [coreArea, setCoreArea] = useState(formData?.Scrutiny?.[0]?.coreType || null);
  const [siteReserved, setSiteReserved] = useState(formData?.Scrutiny?.[0]?.siteReserved || null);
  const [approvedCS, setApprovedCS] = useState(formData?.Scrutiny?.[0]?.approvedControlSheet || null);
  const [tenantIdData, setTenantIdData] = useState(formData?.Scrutiny?.[0]?.tenantIdData || null);
  const [uploadedFile, setUploadedFile] = useState(formData?.Scrutiny?.[0]?.proofIdentity?.fileStoreId || null);
  const [selectLayout, setSelectLayout] = useState(formData?.Scrutiny?.[0]?.proofIdentity?.fileStoreId || null);
  const [file, setFile] = useState(formData?.owners?.documents?.proofIdentity || null);
  const [error, setError] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [layoutMessage, setLayoutMessage] = useState("");
  const [layoutFile, setLayoutFile] = useState(null);
  const [dxfFile, setDxfFile] = useState(null);
  const [selectedCity, setSelectedCity] = useState(() => ({ code: Digit.ULBService.getCitizenCurrentTenant(true) }));

  const { t } = useTranslation();

  const { data: citymodules, isLoading } = Digit.Hooks.obps.useMDMS(stateId, "tenant", ["citymodule"]);

  const { data: mdmsData, isLoading: isMdmsLoading } = Digit.Hooks.useCustomMDMS(stateId, "BPA", [{ name: "EDCRNewBuildingPlanScrutiny" }]);
  const { data: cities } = Digit.Hooks.useTenants();

  const location = useLocation();
  const edcrMaster = mdmsData?.BPA?.EDCRNewBuildingPlanScrutiny?.[0] || {};
  const areaTypeOptions = edcrMaster?.areaType?.filter((o) => o.active) || [];
  const schemeAreaOptions = edcrMaster?.schemeArea?.filter((o) => o.active) || [];
  const cluApproveOptions = edcrMaster?.cluApprove?.filter((o) => o.active) || [];
  const coreAreaOptions = edcrMaster?.coreArea?.filter((o) => o.active) || [];
  const siteReservedOptions = [
    { code: "YES", value: "Yes" },
    { code: "NO", value: "No" },
  ];
  const approvedControlSheetOptions = [
    { code: "YES", value: "Yes" },
    { code: "NO", value: "No" },
  ];

  console.log("FORM DATA --->", JSON.stringify(formData, null, 2));

  useEffect(() => {
    if (citymodules?.tenant?.citymodule?.length > 0) {
      const list = citymodules?.tenant?.citymodule?.filter((d) => d.code === "BPAAPPLY");
      list?.[0]?.tenants?.forEach((data) => {
        data.i18nKey = `TENANT_TENANTS_${stringReplaceAll(data?.code?.toUpperCase(), ".", "_")}`;
      });
      if (Array.isArray(list?.[0]?.tenants)) list?.[0]?.tenants.reverse();
      const sorted = sortDropdownNames(list?.[0]?.tenants, "code", t);
      setCitymoduleList(sorted);
    }
  }, [citymodules]);

  const handleAreaTypeChange = (value) => {
    setAreaType(value);
    setSchName("");
    setSchemeArea(null);
    setCluApproved(null);
    setCoreArea(null);
  };

  const selectFile = (e) => {
    setUploadedFile(e.target.files[0]);
    setFile(e.target.files[0]);
  };

  const handleLayoutUpload = (e) => {
    setSelectLayout(e.target.files[0]);
    setFile(e.target.files[0]);
    setLayoutFile(e.target.files[0]);
  };

  const handleDXFUpload = (e) => {
    setUploadedFile(e.target.files[0]);
    setFile(e.target.files[0]);
    setDxfFile(e.target.files[0]);
  };

  const texts = useMemo(
    () => ({
      header: t("CS_COMMON_CHOOSE_LOCATION"),
      submitBarLabel: t("CORE_COMMON_CONTINUE"),
    }),
    [t]
  );

  function selectCity(city) {
    setSelectedCity(city);
    console.log("selected city", city);
    setShowError(false);
  }
  console.log("selected city", selectCity);
  const RadioButtonProps = useMemo(() => {
    return {
      options: cities,
      optionsKey: "i18nKey",
      additionalWrapperClass: "reverse-radio-selection-wrapper",
      onSelect: selectCity,
      selectedOption: selectedCity,
    };
  }, [cities, t, selectedCity]);

  const cityOptions = cities?.map((city) => ({
    ...city,
    displayName: t(city.i18nKey),
  }));

  const isFormValid = () => {
    if (!name || !selectedCity?.code || !areaType) return false;

    if (areaType?.code === "SCHEME_AREA") {
      if (!schemeArea || !schName || !siteReserved) return false;

      if (siteReserved?.code === "YES") {
        if (!approvedCS) return false;

        if (approvedCS?.code === "YES") {
          if (!layoutFile) return false;
          return true;
        }
      }
      return !!dxfFile;
    }

    if (areaType?.code === "NON_SCHEME_AREA") {
      if (!cluApprove) return false;

      if (cluApprove?.code !== "NO") {
        if (!coreArea) return false;
      }

      return !!dxfFile;
    }

    return true;
  };

  console.log({
    areaType,
    layoutFile,
    name,
    siteReserved,
    ulb,
    dxfFile,
    areaType,
    schemeArea,
    schName,
    cluApprove,
    coreArea,
    uploadedFile,
    approvedCS,
    formValid: isFormValid(),
  });

  const getFormData = () => {
    const data = {
      applicantName: name,
      ulbName: ulb,
      areaType: areaType,
      file: file,
    };

    if (areaType?.code === "SCHEME_AREA") {
      data.schemeType = schemeArea;
      data.schemeName = schName;
      data.siteReserved = siteReserved;
      if (siteReserved?.code === "YES") data.approvedControlSheet = approvedCS;
    } else {
      data.isCluApproved = cluApprove;
      data.coreType = coreArea;
    }

    return data;
  };

  return {
    stateId,
    tenantId,
    isLoading,
    name,
    setName,
    ulb,
    setUlb,
    areaType,
    handleAreaTypeChange,
    schName,
    setSchName,
    schemeArea,
    setSchemeArea,
    cluApprove,
    setCluApproved,
    coreArea,
    setCoreArea,
    tenantIdData,
    setTenantIdData,
    uploadedFile,
    setUploadedFile,
    setSelectLayout,
    file,
    setFile,
    error,
    setError,
    uploadMessage,
    setUploadMessage,
    setLayoutMessage,
    siteReserved,
    setSiteReserved,
    approvedCS,
    setApprovedCS,
    citymoduleList,
    selectFile,
    selectLayout,
    layoutMessage,
    isFormValid,
    getFormData,
    handleLayoutUpload,
    handleDXFUpload,
    layoutFile,

    areaTypeOptions,
    schemeAreaOptions,
    cluApproveOptions,
    coreAreaOptions,
    siteReservedOptions,
    approvedControlSheetOptions,

    cityOptions,
    selectedCity,
    setSelectedCity,
  };
};

export default useEDCRForm;

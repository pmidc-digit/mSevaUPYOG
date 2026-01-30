import { CardLabel, CardLabelError, Dropdown, FormStep, LinkButton, Loader, TextInput, Toast, UploadFile } from "@mseva/digit-ui-react-components";
import React, { useEffect, useState, useRef } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { getPattern, stringReplaceAll, sortDropdownNames } from "../utils";

import useEDCRForm from "../../../../libraries/src/hooks/obps/useEDCRForm";
import { set } from "lodash";
import { CustomLoader } from "./CustomLoader";

const EDCRForm = ({ t, config, onSelect, userType, formData, ownerIndex = 0, addNewOwner, isShowToast, isSubmitBtnDisable, setIsShowToast, errorStyle }) => {
  const { pathname: url } = useLocation();
  const [nameError, setNameError] = useState("");
  const history = useHistory();
  const containerRef = useRef(null);
  //actual state up side

  // want to have same update name in my form

  const {
    approvedCS,
    approvedControlSheetOptions,
    areaType,
    areaTypeOptions,
    cityOptions,
    citymoduleList,
    cluApprove,
    cluApproveOptions,
    coreArea,
    purchasableFar,
    coreAreaOptions,
    dxfFile,
    error,
    file,
    getFormData,
    handleAreaTypeChange,
    handleDXFUpload,
    handleLayoutUpload,
    isFormValid,

    layoutFile,
    layoutMessage,
    name,
    schName,
    schemeArea,
    schemeAreaOptions,
    selectedCity,
    setApprovedCS,
    setCitymoduleList,
    setCluApproved,

    setError,
    setFile,
    setLayoutFile,
    setLayoutMessage,
    setName,
    setSchName,
    setSchemeArea,
    setSelectedCity,
    setSiteReserved,
    setTenantIdData,
    setUlb,
    setUploadMessage,
    setUploadedFile,
    setcoreArea,
    setPurchasableFar,
    setSelectLayout,
    siteReserved,
    siteReservedOptions,
    purchasableFarOptions,
    showSkip,

    tenantIdData,
    ulb,
    uploadMessage,
    uploadedFile,
  } = useEDCRForm({ formData });
  let tenantId = Digit.SessionStorage.get("CITIZEN.COMMON.HOME.CITY")?.code || Digit.ULBService.getCurrentTenantId(); 
  const { data: cities } = Digit.Hooks.useTenants();

  const stateId = Digit.ULBService.getStateId();
  console.log(stateId, tenantId, t, "TEN STATE");

  let validation = {};

  const onSkip = () => {
    setUploadMessage("NEED TO DELETE");
  };

  const common = [
    {
      code: "YES",
      i18nKey: "YES",
    },
    {
      code: "NO",
      i18nKey: "NO",
    },
  ];

  const { isLoading, data: citymodules } = Digit.Hooks.obps.useMDMS(stateId, "tenant", ["citymodule"]);


  // const tenantId = localStorage.getItem("CITIZEN.CITY");

  useEffect(() => {
    if(cities){
    const selectedCity = cities.find((city) => city.code === tenantId);
    setSelectedCity({...selectedCity, displayName: t(selectedCity.i18nKey)});
    setUlb(tenantId);
    }
  }, [tenantId, cities]);

  useEffect(() => {
    if (citymodules?.tenant?.citymodule?.length > 0) {
      const list = citymodules?.tenant?.citymodule?.filter((data) => data.code == "BPAAPPLY");
      list?.[0]?.tenants?.forEach((data) => {
        data.i18nKey = `TENANT_TENANTS_${stringReplaceAll(data?.code?.toUpperCase(), ".", "_")}`;
      });
      if (Array.isArray(list?.[0]?.tenants)) list?.[0]?.tenants.reverse();
      let sortTenants = sortDropdownNames(list?.[0]?.tenants, "code", t);
      setCitymoduleList(sortTenants);
    }
  }, [citymodules]);

  useEffect(() => {
    if (uploadMessage || isShowToast) {
      setName("");

      setcoreArea("");
      setUploadedFile(null);
      setFile("");
      setUploadMessage("");
    }
    if (isShowToast) {
      history.replace(`/digit-ui/citizen/obps/edcrscrutiny/apply/acknowledgement`, {
        data: isShowToast?.label ? isShowToast?.label : "BPA_INTERNAL_SERVER_ERROR",
        type: "ERROR",
      });
    }
  }, [uploadMessage, isShowToast, isSubmitBtnDisable]);


useEffect(() => {
  const container = containerRef.current;
  if (!container) return;

  const hideSkip = () => {
    const skipBtn = container.querySelector('button.skip, button[data-testid="skip-button"]');
    if (skipBtn) {
      skipBtn.style.display = "none";
    }
  };

  hideSkip();

  const mo = new MutationObserver(hideSkip);
  mo.observe(container, { childList: true, subtree: true });

  return () => mo.disconnect();
}, []);



  function onAdd() {
    setUploadMessage("NEED TO DELETE");
  }

  const handleSubmit = () => {
    const data = {};
    data.tenantId = tenantIdData;
    data.applicantName = name;
    data.file = file;
    data.coreArea = coreArea;
    data.ulb = ulb;
    data.areaType = areaType;
    data.schemeArea = schemeArea;
    data.schName = schName;
    data.siteReserved = siteReserved;
    data.approvedCS = approvedCS;
    data.cluApprove = cluApprove;
    data.purchasableFar = purchasableFar;
    data.layoutFile = layoutFile;

    if (areaType?.code === "SCHEME_AREA") {
      data.coreArea = "NO";
    } else if (areaType?.code === "NON_SCHEME_AREA") {
      data.coreArea = coreArea;
    }

    onSelect(config.key, data);
  };

  if (isLoading ) {
    return <Loader />;
  }
  // if(isSubmitBtnDisable){
  //   return <div>      
  //       <div className="loader-message">{t("EDCR_SCRUTINY_LOADING_MESSAGE")}</div>
  //     </div>
  // }

  if (isSubmitBtnDisable) {
  return (
    <CustomLoader message={"EDCR_SCRUTINY_LOADING_MESSAGE"} />
  );
}


  return (


    <React.Fragment>



      <div  
      onKeyDown={(e) => {
      if (e.key === "Enter") {
        e.preventDefault();
      }
    }}
    ref={containerRef}
    >

      
      <FormStep  config={{ ...config, texts: { ...config.texts, skipText: null } }} onSelect={handleSubmit} isDisabled={!isFormValid() || nameError} t={t}>
         <CardLabelError>{nameError}</CardLabelError>
        <CardLabel>{t("EDCR_APPLICANT_NAME")}</CardLabel>
      <TextInput
        t={t}
        isMandatory={true}
        type="text"
        name="applicantName" 
        value={name} 
        // onChange={(e) => setName(e.target.value)}
        onChange={(e) => {
          const value = e.target.value;
          setName(value);
          const regex = /^[A-Za-z\s]*$/;
          if (!regex.test(value)) {
            setNameError(t("APPLICANT_NAME_INVALID_PATTERN"));
          } else {
            setNameError("");
          }
        }}
        />
        {/* <CardLabelError style={{...errorStyle, color:"black"}}>{"*"+t("EDCR_APPLICANT_NAME_DISCLAIMER")}</CardLabelError> */}
  
        

        <CardLabel>{t("EDCR_ULB_NAME")}</CardLabel>
        <Dropdown
          t={t}
          isMandatory={true}
          option={cityOptions}
          optionKey="displayName"
          selected={selectedCity}
          select={(city) => {
            setSelectedCity(city);
            setUlb(city?.code);
          }}
          placeholder={t("COMMON_TABLE_SEARCH")}
          disable={true}
        />

        <CardLabel>{t("EDCR_SCRUTINY_AREA_TYPE")}</CardLabel>
        <Dropdown t={t} isMandatory={true} option={areaTypeOptions} selected={areaType} optionKey="value" select={handleAreaTypeChange} />

        {areaType?.code === "SCHEME_AREA" && (
          <React.Fragment>
            <CardLabel>{t("EDCR_SCRUTINY_SCHEME_AREA_TYPES")}</CardLabel>
            <Dropdown t={t} isMandatory={true} option={schemeAreaOptions} selected={schemeArea} optionKey="value" select={setSchemeArea} />

            <CardLabel>{t("EDCR_SCHEME_NAME")}</CardLabel>
            <TextInput t={t} isMandatory={true} type="text" name="schemeName" value={schName} onChange={(e) => setSchName(e.target.value)} />

            <CardLabel>{t("EDCR_IS_SITE_RESERVED")}</CardLabel>
            <Dropdown t={t} isMandatory={true} option={siteReservedOptions} selected={siteReserved} optionKey="value" select={setSiteReserved} />

            {siteReserved?.code === "YES" && (
              <React.Fragment>
                <CardLabel>{t("EDCR_IS_APPROVED_CONTROL_SHEET")}</CardLabel>
                <Dropdown
                  t={t}
                  isMandatory={true}
                  option={approvedControlSheetOptions}
                  selected={approvedCS}
                  optionKey="value"
                  select={setApprovedCS}
                />
              </React.Fragment>
            )}

            {approvedCS?.code === "YES" && (
              <React.Fragment>
                <CardLabel>{t("EDCR_SCRUTINY_SCHEME_UPLOAD_LAYOUT")}</CardLabel>
                <UploadFile
                  id={"edcr-layout"}
                 
                  onUpload={handleLayoutUpload}
                  onDelete={() => {
                    setLayoutFile(null);
                    setFile("");
                  }}
                  message={layoutFile ? `1 ${t(`PT_ACTION_FILEUPLOADED`)}` : t(`ES_NO_FILE_SELECTED_LABEL`)}
                  error={error}
                  uploadMessage={layoutMessage}
                />
              </React.Fragment>
            )}
          </React.Fragment>
        )}

        {areaType?.code === "NON_SCHEME_AREA" && (
          <React.Fragment>
            <CardLabel>{t("EDCR_SCRUTINY_CLU_APPROVED")}</CardLabel>
            <Dropdown t={t} isMandatory={true} option={cluApproveOptions} selected={cluApprove} optionKey="value" select={setCluApproved} />

          
              <React.Fragment>
                <CardLabel>{t("EDCR_IS_CORE_AREA")}</CardLabel>
                <Dropdown t={t} isMandatory={true} option={coreAreaOptions} selected={coreArea} optionKey="value" select={setcoreArea} />
              </React.Fragment>
          
          </React.Fragment>
        )}


         <React.Fragment>
                <CardLabel>{t("EDCR_IS_PURCHASABLEFAR")}</CardLabel>
                <Dropdown t={t} isMandatory={true} option={purchasableFarOptions} selected={purchasableFar} optionKey="value" select={setPurchasableFar} />
              </React.Fragment>

        {approvedCS?.code !== "YES" && (
          <React.Fragment>
            <CardLabel>{t("EDCR_UPLOAD_DXF_FILE")}</CardLabel>
            <UploadFile
              id={"edcr-doc"}
             
              onUpload={handleDXFUpload}
              accept=".dxf"
              onDelete={() => {
                setUploadedFile(null);
                setFile("");
              }}
              message={uploadedFile ? `1 ${t(`PT_ACTION_FILEUPLOADED`)}` : t(`ES_NO_FILE_SELECTED_LABEL`)}
              error={error}
              uploadMessage={uploadMessage}
            />
            {/* <p style={{ padding: "10px", fontSize: "14px" }}>{t("EDCR_ONLY_DXF_FILE")}</p> */}
            <p>{t("EDCR_ONLY_DXF_FILE")}</p>
          </React.Fragment>
        )}
        
      </FormStep>
      </div>
    </React.Fragment>
  );
};

export default EDCRForm;

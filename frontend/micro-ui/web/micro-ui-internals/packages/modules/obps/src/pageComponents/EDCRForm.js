import { CardLabel, Dropdown, FormStep, Loader, TextInput, Toast, UploadFile } from "@mseva/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { getPattern, stringReplaceAll, sortDropdownNames } from "../utils";

import useEDCRForm from "../../../../libraries/src/hooks/obps/useEDCRForm";

const EDCRForm = ({ t, config, onSelect, userType, formData, ownerIndex = 0, addNewOwner, isShowToast, isSubmitBtnDisable, setIsShowToast }) => {
  const { pathname: url } = useLocation();
  const history = useHistory();
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
    setSelectLayout,
    siteReserved,
    siteReservedOptions,

    tenantIdData,
    ulb,
    uploadMessage,
    uploadedFile,
  } = useEDCRForm({ formData });
  let tenantId = Digit.SessionStorage.get("CITIZEN.COMMON.HOME.CITY")?.code || Digit.ULBService.getCurrentTenantId() || "pb.amritsar"; // fallback hardcoded tenant (update this to your ULB)

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
    data.layoutFile = layoutFile


     if (areaType?.code === "SCHEME_AREA") {
    data.coreArea = "NO";
  } else if (areaType?.code === "NON_SCHEME_AREA") {
    data.coreArea = coreArea;
  }


  
    onSelect(config.key, data);
  };

  if (isLoading || isSubmitBtnDisable) {
    return <Loader />;
  }

  return (
    // <FormStep
    //     t={t}
    //     config={config}
    //     onSelect={handleSubmit}
    //     onSkip={onSkip}
    //     isDisabled={!tenantIdData || !name || !coreArea || !file || isSubmitBtnDisable}
    //     onAdd={onAdd}
    //     isMultipleAllow={true}
    // >
    //     <CardLabel>{`${t("EDCR_SCRUTINY_CITY")} *`}</CardLabel>
    //     <Dropdown
    //         t={t}
    //         isMandatory={false}
    //         option={citymoduleList}
    //         selected={tenantIdData}
    //         optionKey="i18nKey"
    //         select={setTypeOfTenantID}
    //         uploadMessage={uploadMessage}
    //     />
    //     <CardLabel>{`${t("EDCR_SCRUTINY_NAME_LABEL")} *`}</CardLabel>
    //     <TextInput
    //         isMandatory={false}
    //         optionKey="i18nKey"
    //         t={t}
    //         name="applicantName"
    //         onChange={setApplicantName}
    //         uploadMessage={uploadMessage}
    //         value={name}
    //         {...(validation = {
    //             isRequired: true,
    //             //pattern: "^[a-zA-Z]+(( )+[a-zA-z]+)*$",
    //             pattern: "^[a-zA-Z ]+$",
    //             type: "text",
    //             title: t("TL_NAME_ERROR_MESSAGE"),
    //         })}
    //     />
    //     <CardLabel>{`${t("BPA_CORE_AREA")}`}</CardLabel>
    //     <Dropdown
    //         t={t}
    //         isMandatory={false}
    //         option={common}
    //         selected={coreArea}
    //         optionKey="i18nKey"
    //         select={setCoreArea}
    //         uploadMessage={uploadMessage}
    //     />
    //     <CardLabel>{`${t("BPA_PLAN_DIAGRAM_LABEL")} *`}</CardLabel>
    //     <UploadFile
    //         id={"edcr-doc"}
    //         extraStyleName={"propertyCreate"}
    //         // accept=".dxf"
    //         onUpload={selectfile}
    //         onDelete={() => {
    //             setUploadedFile(null);
    //             setFile("");
    //         }}
    //         message={uploadedFile ? `1 ${t(`PT_ACTION_FILEUPLOADED`)}` : t(`ES_NO_FILE_SELECTED_LABEL`)}
    //         error={error}
    //         uploadMessage={uploadMessage}
    //     />
    //     <div style={{ disabled: "true", height: "30px", width: "100%", fontSize: "14px" }}>{t("EDCR_UPLOAD_FILE_LIMITS_LABEL")}</div>
    //     {isShowToast && <Toast error={isShowToast.key} label={t(isShowToast.label)} onClose={() => setIsShowToast(null)} isDleteBtn={true} />}
    //     {/* {isSubmitBtnDisable ? <Loader /> : null} */}
    // </FormStep>

    <React.Fragment>
      <FormStep config={config} onSelect={handleSubmit} onSkip={onSkip} isDisabled={!isFormValid()} t={t}>
        <CardLabel>{t("EDCR_APPLICANT_NAME")}</CardLabel>
        <TextInput t={t} isMandatory={true} type="text" name="applicantName" value={name} onChange={(e) => setName(e.target.value)} />

        <CardLabel>{t("EDCR_ULB_NAME")}</CardLabel>
        <Dropdown
          t={t}
          isMandatory={true}
          option={cityOptions}
          optionKey="displayName"
          selected={selectedCity}
          select={(city) => {
            setSelectedCity(city);
            setUlb(city?.code); // Also set ulb here
          }}
          placeholder={t("COMMON_TABLE_SEARCH")}
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
                  extraStyleName={"propertyCreate"}
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

            {cluApprove?.code !== "NO" && (
              <React.Fragment>
                <CardLabel>{t("EDCR_IS_CORE_AREA")}</CardLabel>
                <Dropdown t={t} isMandatory={true} option={coreAreaOptions} selected={coreArea} optionKey="value" select={setcoreArea} />
              </React.Fragment>
            )}
          </React.Fragment>
        )}

        {approvedCS?.code !== "YES" && (
          <React.Fragment>
            <CardLabel>{t("EDCR_UPLOAD_DXF_FILE")}</CardLabel>
            <UploadFile
              id={"edcr-doc"}
              extraStyleName={"propertyCreate"}
              onUpload={handleDXFUpload}
              onDelete={() => {
                setUploadedFile(null);
                setFile("");
              }}
              message={uploadedFile ? `1 ${t(`PT_ACTION_FILEUPLOADED`)}` : t(`ES_NO_FILE_SELECTED_LABEL`)}
              error={error}
              uploadMessage={uploadMessage}
            />
          </React.Fragment>
        )}
      </FormStep>
    </React.Fragment>
  );
};

export default EDCRForm;

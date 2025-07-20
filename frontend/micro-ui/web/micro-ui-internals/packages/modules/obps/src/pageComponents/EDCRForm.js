import { CardLabel, Dropdown, FormStep, Loader, TextInput, Toast, UploadFile } from "@mseva/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { stringReplaceAll, sortDropdownNames } from "../utils";
import { DROPDOWN_OPTIONS } from "./EDCRFormjson";

const EDCRForm = ({ t, config, onSelect, userType, formData, ownerIndex = 0, addNewOwner, isShowToast, isSubmitBtnDisable, setIsShowToast }) => {
  const { pathname: url } = useLocation();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();
  const history = useHistory();
  const [citymoduleList, setCitymoduleList] = useState([]);
  const [name, setName] = useState(formData?.Scrutiny?.[0]?.applicantName || "");
  const [ulb, setUlb] = useState(formData?.Scrutiny?.[0]?.ulbName || "");
  const [areaType, setAreaType] = useState(formData?.Scrutiny?.[0]?.areaType || null);
  const [schName, setSchName] = useState(formData?.Scrutiny?.[0]?.areaType?.code === "SCHEME_AREA" ? formData?.Scrutiny?.[0]?.schemeName || "" : "");
  const [schemeArea, setSchemeArea] = useState(
    formData?.Scrutiny?.[0]?.areaType?.code === "SCHEME_AREA" ? formData?.Scrutiny?.[0]?.schemeType || null : null
  );
  const [cluApprove, setCluApproved] = useState(
    formData?.Scrutiny?.[0]?.areaType?.code !== "SCHEME_AREA" ? formData?.Scrutiny?.[0]?.isCluApproved || null : null
  );
  const [coreArea, setCoreArea] = useState(
    formData?.Scrutiny?.[0]?.areaType?.code !== "SCHEME_AREA" ? formData?.Scrutiny?.[0]?.coreType || null : null
  );

  const [tenantIdData, setTenantIdData] = useState(formData?.Scrutiny?.[0]?.tenantIdData || null);
  const [uploadedFile, setUploadedFile] = useState(formData?.Scrutiny?.[0]?.proofIdentity?.fileStoreId || null);
  const [file, setFile] = useState(formData?.owners?.documents?.proofIdentity || null);
  const [error, setError] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [showToast, setShowToast] = useState(null);

  console.log("FORM DATA", formData);


  function setApplicantName(e) {
    setName(e.target.value);
  }

  function setUlbName(e) {
    setUlb(e.target.value);
  }

  function setSchemeName(e) {
    setSchName(e.target.value);
  }

  function setIsCluApproved(value) {
    setCluApproved(value);
  }

  function setSelectCoreArea(value) {
    setCoreArea(value);
  }

  function setTypeOfTenantID(value) {
    setTenantIdData(value);
  }

  function handleAreaTypeChange(value) {
    setAreaType(value);
    setSchName("");
    setSchemeArea(null);
    setCluApproved(null);
    setCoreArea(null);
  }

    function selectfile(e) {
        setUploadedFile(e.target.files[0]);
        setFile(e.target.files[0]);
    }

  const onSkip = () => {
    setUploadMessage("NEED TO DELETE");
  };
  const { isLoading, data: citymodules } = Digit.Hooks.obps.useMDMS(stateId, "tenant", ["citymodule"]);

  useEffect(() => {
    if (citymodules?.tenant?.citymodule?.length > 0) {
      const list = citymodules?.tenant?.citymodule?.filter((data) => data.code == "BPAAPPLY");
      list?.[0]?.tenants?.forEach((data) => {
        data.i18nKey = `TENANT_TENANTS_${stringReplaceAll(data?.code?.toUpperCase(), ".", "_")}`;
      });
      if (Array.isArray(list?.[0]?.tenants)) list?.[0]?.tenants.reverse();
      const sortTenants = sortDropdownNames(list?.[0]?.tenants, "code", t);
      setCitymoduleList(sortTenants);
    }
  }, [citymodules]);

    useEffect(() => {
        if (uploadMessage || isShowToast) {
            setName("");
            setTenantIdData("");
            setcoreArea("");
            setUploadedFile(null);
            setFile("");
            setUploadMessage("");
        }
        if (isShowToast) {
            history.replace(
                `/digit-ui/citizen/obps/edcrscrutiny/apply/acknowledgement`,
                { data: isShowToast?.label ? isShowToast?.label : "BPA_INTERNAL_SERVER_ERROR", type: "ERROR"}
              );
        }
    }, [uploadMessage, isShowToast, isSubmitBtnDisable]);

  function onAdd() {
    setUploadMessage("NEED TO DELETE");
  }
  const isFormValid = () => {
    const baseFieldsValid = tenantIdData && name && file;

    if (!areaType) return false;

    if (areaType?.code === "SCHEME_AREA") {
      return baseFieldsValid && schemeArea && schName;
    } else {
      return baseFieldsValid && cluApprove && coreArea;
    }
  };

  const handleSubmit = () => {
    const data = {};
    data.tenantId = tenantIdData;
    data.applicantName = name;
    data.ulbName = ulb;
    data.areaType = areaType;
    data.file = file;

    if (areaType?.code === "SCHEME_AREA") {
      data.schemeType = schemeArea;
      data.schemeName = schName;
    } else {
      data.isCluApproved = cluApprove;
      data.coreType = coreArea;
    }

    onSelect(config.key, data);
  };

  if (isLoading || isSubmitBtnDisable) {
    return <Loader />;
  }

  console?.log("AREA", areaType);

  return (
    <FormStep
      t={t}
      config={config}
      onSelect={handleSubmit}
      onSkip={onSkip}
      isDisabled={!isFormValid() || isSubmitBtnDisable}
      onAdd={onAdd}
      isMultipleAllow={true}
    >
      <CardLabel>{`${t("EDCR_SCRUTINY_NAME_LABEL")} *`}</CardLabel>
      <TextInput
        isMandatory={false}
        optionKey="i18nKey"
        t={t}
        name="applicantName"
        onChange={setApplicantName}
        uploadMessage={uploadMessage}
        value={name}
        {...(validation = {
          isRequired: true,
          pattern: "^[a-zA-Z ]+$",
          type: "text",
          title: t("TL_NAME_ERROR_MESSAGE"),
        })}
      />

      <CardLabel>{`${t("EDCR_SCRUTINY_ULB_NAME_LABEL")} *`}</CardLabel>
      <TextInput
        isMandatory={false}
        optionKey="i18nKey"
        t={t}
        name="ulbName"
        onChange={setUlbName}
        uploadMessage={uploadMessage}
        value={ulb}
        {...(validation = {
          isRequired: true,
          pattern: "^[a-zA-Z ]+$",
          type: "text",
          title: t("TL_NAME_ERROR_MESSAGE"),
        })}
      />

      <CardLabel>{`${t("EDCR_SCRUTINY_AREA_TYPE")} *`}</CardLabel>
      <Dropdown
        t={t}
        isMandatory={true}
        option={DROPDOWN_OPTIONS.areaType.options}
        selected={areaType}
        optionKey="name"
        select={handleAreaTypeChange}
        uploadMessage={uploadMessage}
      />

      {areaType && (
        <React.Fragment>
          {areaType?.code === "SCHEME_AREA" ? (
            <React.Fragment>
              <CardLabel>{`${t("EDCR_SCRUTINY_TYPE_OF_SCHEME")} *`}</CardLabel>
              <Dropdown
                t={t}
                isMandatory={true}
                option={DROPDOWN_OPTIONS.schemeArea.options}
                selected={schemeArea}
                optionKey="name"
                select={setSchemeArea}
                uploadMessage={uploadMessage}
              />

              <CardLabel>{`${t("EDCR_SCRUTINY_SCHEME_NAME")} *`}</CardLabel>
              <TextInput
                isMandatory={false}
                optionKey="i18nKey"
                t={t}
                name="schemeName"
                onChange={setSchemeName}
                uploadMessage={uploadMessage}
                value={schName}
                {...(validation = {
                  isRequired: true,
                  pattern: "^[a-zA-Z ]+$",
                  type: "text",
                  title: t("TL_NAME_ERROR_MESSAGE"),
                })}
              />
            </React.Fragment>
          ) : (
            <React.Fragment>
              <CardLabel>{`${t("EDCR_IS_CLU_APPROVED")} *`}</CardLabel>
              <Dropdown
                t={t}
                isMandatory={true}
                option={DROPDOWN_OPTIONS.cluApprove.options}
                selected={cluApprove}
                optionKey="name"
                select={setIsCluApproved}
                uploadMessage={uploadMessage}
              />

              <CardLabel>{`${t("EDCR_IS_CORE_AREA")} *`}</CardLabel>
              <Dropdown
                t={t}
                isMandatory={true}
                option={DROPDOWN_OPTIONS.coreArea.options}
                selected={coreArea}
                optionKey="name"
                select={setSelectCoreArea}
                uploadMessage={uploadMessage}
              />
            </React.Fragment>
          )}
        </React.Fragment>
      )}

      <CardLabel>{`${t("BPA_PLAN_DIAGRAM_LABEL")} *`}</CardLabel>
      <UploadFile
        id={"edcr-doc"}
        extraStyleName={"propertyCreate"}
        onUpload={selectfile}
        onDelete={() => {
          setUploadedFile(null);
          setFile("");
        }}
        message={uploadedFile ? `1 ${t(`PT_ACTION_FILEUPLOADED`)}` : t(`ES_NO_FILE_SELECTED_LABEL`)}
        error={error}
        uploadMessage={uploadMessage}
      />

      {/* <div>{t("EDCR_UPLOAD_FILE_LIMITS_LABEL")}</div> */}

      {isShowToast && <Toast error={isShowToast.key} label={t(isShowToast.label)} onClose={() => setIsShowToast(null)} isDleteBtn={true} />}
    </FormStep>
  );
};

export default EDCRForm;

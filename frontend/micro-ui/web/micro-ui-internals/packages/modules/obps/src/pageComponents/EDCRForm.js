import React, { useEffect } from "react";
import { CardLabel, CardHeader, BreakLine, Dropdown, FormStep, TextInput, UploadFile } from "@mseva/digit-ui-react-components";

import useEDCRForm from "../../../../libraries/src/hooks/obps/useEDCRForm";

const EDCRForm = ({ t, config, onSelect, onSkip, formData }) => {
  const {
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
    isFormValid,
    siteReserved,
    setSiteReserved,
    approvedCS,
    setApprovedCS,
    uploadMessage,
    setUploadMessage,
    handleDXFUpload,
    handleLayoutUpload,
    uploadedFile,
    layoutFile,
    setLayoutFile,
    dxfFile,
    layoutMessage,
    error,
    areaTypeOptions,
    schemeAreaOptions,
    cluApproveOptions,
    coreAreaOptions,
    siteReservedOptions,
    approvedControlSheetOptions,

    cityOptions,
    selectedCity,
    setSelectedCity,
  } = useEDCRForm({ formData });
  let tenantId = Digit.SessionStorage.get("CITIZEN.COMMON.HOME.CITY")?.code || Digit.ULBService.getCurrentTenantId() || "pb.amritsar"; // fallback hardcoded tenant (update this to your ULB)

  const stateId = Digit.ULBService.getStateId();
  console.log(stateId, tenantId, t, "TEN STATE");

  // const handleSubmit = () => {
  //   if (!isFormValid()) {
  //     setUploadMessage(t("EDCR_FORM_INCOMPLETE"));
  //     return;
  //   }

  //   const data = {
  //     Scrutiny: [
  //       {
  //         name,
  //         ulb,
  //         areaType,
  //         schemeArea,
  //         schName,
  //         siteReserved,
  //         approvedCS,
  //         cluApprove,
  //         coreArea,
  //       },
  //     ],
  //     owners: {
  //       documents: {
  //         layoutFile,
  //         dxfFile,
  //       },
  //     },
  //   };

  //   onSelect(config.key, data);
  // };

  const handleSubmit = () => {
    if (!isFormValid()) {
      setUploadMessage(t("EDCR_FORM_INCOMPLETE"));
      return;
    }

    const isApprovedCSYes = approvedCS?.code === "YES";

    const documents = isApprovedCSYes ? { layoutFile } : { layoutFile, dxfFile };

    const data = {
      Scrutiny: [
        {
          name,
          ulb,
          areaType,
          schemeArea,
          schName,
          siteReserved,
          approvedCS,
          cluApprove,
          coreArea,
        },
      ],
      owners: {
        documents,
      },
    };

    onSelect(config.key, data);
  };

  console.log(formData, "FORM DATA");

  return (
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
                <Dropdown t={t} isMandatory={true} option={coreAreaOptions} selected={coreArea} optionKey="value" select={setCoreArea} />
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

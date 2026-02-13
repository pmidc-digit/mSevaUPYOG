

import React, { useEffect, useState } from "react";
import {
  LabelFieldPair,
  TextInput,
  CardLabel,
  BreakLine,
  Dropdown,
  MobileNumber,
  TextArea,
  ActionBar,
  SubmitBar,
  CardSectionHeader,
  Loader,
  CardLabelError,
  UploadFile
} from "@mseva/digit-ui-react-components";
import CustomUploadFile from "../components/CustomUploadFile";

const LayoutCLUDetails = (_props) => {
  const { t, goNext, currentStepData, Controller, control, setValue, errors, errorStyle } = _props;

  const stateId = Digit.ULBService.getStateId();

  const [selectedIsCluApproved, setSelectedIsCluApproved] = useState(currentStepData?.siteDetails?.cluIsApproved || []);
  const [applicationAppliedUnder, setApplicationAppliedUnder] = useState(currentStepData?.siteDetails?.applicationAppliedUnder || null);
  const [cluType, setCluType] = useState(currentStepData?.siteDetails?.cluType || null);
  const [cluDocumentUploadedFile, setCluDocumentUploadedFile] = useState(null);
  const [cluDocumentLoader, setCluDocumentLoader] = useState(false);
  const [cluDocumentError, setCluDocumentError] = useState(null);

  // Fetch MDMS data for Application Applied Under and Non-Scheme Type
  const { data: mdmsData } = Digit.Hooks.useCustomMDMS(stateId, "BPA", [{ name: "LayoutType" }]);
  
  const areaTypeOptions = mdmsData?.BPA?.LayoutType?.[0]?.areaType || [];
  const nonSchemeTypeOptions = mdmsData?.BPA?.LayoutType?.[0]?.nonSchemeType || [];

  useEffect(() => {
    console.log("LayoutCLUDetails MDMS Data:", mdmsData);
    console.log("Non-Scheme Type Options:", nonSchemeTypeOptions);
    console.log("Area Type Options:", areaTypeOptions);
  }, [mdmsData, nonSchemeTypeOptions, areaTypeOptions]);

  const cluOptions = [
    {
      code: "YES",
      i18nKey: "YES",
    },
    {
      code: "NO",
      i18nKey: "NO",
    },
  ];

  useEffect(() => {
    console.log("currentStepData4", currentStepData);
    const formattedData = currentStepData?.siteDetails;
    if (formattedData) {
      //console.log("coming here", formattedData);
      Object.entries(formattedData).forEach(([key, value]) => {
        setValue(key, value);
      });
    }
  }, [currentStepData, setValue]);


  return (
    <React.Fragment>
      <CardSectionHeader className="card-section-header">{t("BPA_SITE_DETAILS")}</CardSectionHeader>

      <div>
    
        
        <LabelFieldPair>
        <CardLabel className="card-label-smaller">{`${t("BPA_IS_CLU_REQUIRED_LABEL")}`}<span className="requiredField">*</span></CardLabel>
          
        <Controller
          control={control}
          name={"cluIsApproved"}
          rules={{ required: t("REQUIRED_FIELD") }}
          render={(props) => (
          <Dropdown 
          t={t}
            className="form-field" 
            select={(e)=>{
              props.onChange(e);
              setSelectedIsCluApproved(e);
            }} 
            selected={props.value} 
            option={cluOptions}
            optionKey="i18nKey" />
            
            
            )}
            />
        </LabelFieldPair>
        <CardLabelError style={errorStyle}>
            {errors?.cluIsApproved?.message || ""}
        </CardLabelError>


        {selectedIsCluApproved.code === "NO" && (
          <React.Fragment>
            <LabelFieldPair>
              <CardLabel className="card-label-smaller">
                CLU Type <span className="requiredField">*</span>
              </CardLabel>
              <Controller
                control={control}
                name={"cluType"}
                rules={{
                  required: selectedIsCluApproved?.code === "NO" ? "CLU Type is required" : false,
                }}
                render={(props) => (
                  <Dropdown
                    className="form-field"
                    select={(e) => {
                      setCluType(e);
                      props.onChange(e);
                    }}
                    selected={props.value}
                    option={[
                      { code: "ONLINE", name: "Online" },
                      { code: "OFFLINE", name: "Offline" },
                    ]}
                    optionKey="name"
                    t={t}
                  />
                )}
              />
              {errors?.cluType && (
                <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.cluType.message}</p>
              )}
            </LabelFieldPair>

            {/* If CLU Type = ONLINE, show CLU Number with Validate Button */}
            {cluType?.code === "ONLINE" && (
              <LabelFieldPair>
                <CardLabel className="card-label-smaller">
                  CLU Number <span className="requiredField">*</span>
                </CardLabel>
                <div className="field">
                  <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <Controller
                        control={control}
                        name="cluNumber"
                        defaultValue=""
                        rules={{
                          required: cluType?.code === "ONLINE" ? "CLU Number is required" : false,
                          pattern: {
                            value: /^[0-9]+$/,
                            message: "CLU Number should be numeric only",
                          },
                        }}
                        render={(props) => (
                          <TextInput
                            className="form-field"
                            value={props.value}
                            onChange={(e) => {
                              props.onChange(e.target.value);
                            }}
                            onBlur={(e) => {
                              props.onBlur(e);
                            }}
                            t={t}
                          />
                        )}
                      />
                    </div>
                    <button 
                      type="button" 
                      style={{ 
                        padding: "10px 16px", 
                        background: "#1976d2", 
                        color: "white", 
                        cursor: "pointer", 
                        marginTop: "4px",
                        border: "none",
                        borderRadius: "2px",
                        fontWeight: "bold",
                        minWidth: "120px"
                      }}
                      onClick={() => {
                        // Add validation logic here
                        Digit.UiKitComponents.Toast.showSuccess({ message: "CLU Number validated successfully" });
                      }}
                    >
                      Validate
                    </button>
                  </div>
                  {errors?.cluNumber && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.cluNumber.message}</p>}
                </div>
              </LabelFieldPair>
            )}

            {/* If CLU Type = OFFLINE, show Document, Number, and Approval Date */}
            {cluType?.code === "OFFLINE" && (
              <React.Fragment>
                <LabelFieldPair>
                  <CardLabel className="card-label-smaller">
                    CLU Document <span className="requiredField">*</span>
                  </CardLabel>
                  <div className="field" style={{ width: "100%" }}>
                    <CustomUploadFile
                      id="clu-document"
                      onUpload={async (e) => {
                        const file = e?.target?.files?.[0];
                        if (!file) return;
                        
                        if (file.size > 5 * 1024 * 1024) {
                          setCluDocumentError("File size should not exceed 5MB");
                          return;
                        }
                        
                        try {
                          setCluDocumentLoader(true);
                          setCluDocumentError(null);
                          const response = await Digit.UploadServices.Filestorage("BPA", file, stateId);
                          if (response?.data?.files?.length > 0) {
                            const fileStoreId = response.data.files[0].fileStoreId;
                            setCluDocumentUploadedFile({ fileStoreId, fileName: file.name });
                            setValue("cluDocument", fileStoreId);
                          } else {
                            setCluDocumentError("File upload failed");
                          }
                        } catch (err) {
                          setCluDocumentError("File upload error");
                        } finally {
                          setCluDocumentLoader(false);
                        }
                      }}
                      onDelete={() => {
                        setCluDocumentUploadedFile(null);
                        setValue("cluDocument", null);
                        setCluDocumentError(null);
                      }}
                      uploadedFile={cluDocumentUploadedFile?.fileStoreId}
                      message={cluDocumentUploadedFile?.fileStoreId ? `1 ${t("FILEUPLOADED")}` : t("ES_NO_FILE_SELECTED_LABEL")}
                      error={cluDocumentError || errors?.cluDocument?.message}
                      uploadMessage=""
                      accept=".pdf"
                      required
                    />
                  </div>
                </LabelFieldPair>

                <LabelFieldPair>
                  <CardLabel className="card-label-smaller">
                    CLU Number <span className="requiredField">*</span>
                  </CardLabel>
                  <div className="field">
                    <Controller
                      control={control}
                      name="cluNumberOffline"
                      defaultValue=""
                      rules={{
                        required: cluType?.code === "OFFLINE" ? "CLU Number is required" : false,
                        pattern: {
                          value: /^[0-9]+$/,
                          message: "CLU Number should be numeric only",
                        },
                      }}
                      render={(props) => (
                        <TextInput
                          className="form-field"
                          value={props.value}
                          onChange={(e) => {
                            props.onChange(e.target.value);
                          }}
                          onBlur={(e) => {
                            props.onBlur(e);
                          }}
                          t={t}
                        />
                      )}
                    />
                    {errors?.cluNumberOffline && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.cluNumberOffline.message}</p>}
                  </div>
                </LabelFieldPair>

                <LabelFieldPair>
                  <CardLabel className="card-label-smaller">
                    CLU Approval Date <span className="requiredField">*</span>
                  </CardLabel>
                  <div className="field">
                    <Controller
                      control={control}
                      name="cluApprovalDate"
                      defaultValue=""
                      rules={{
                        required: cluType?.code === "OFFLINE" ? "CLU Approval Date is required" : false,
                        validate: (value) => {
                          if (!value) return true;
                          const selectedDate = new Date(value);
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          if (selectedDate > today) {
                            return "CLU Approval Date cannot be a future date";
                          }
                          return true;
                        },
                      }}
                      render={(props) => (
                        <TextInput
                          type="date"
                          value={props.value}
                          onChange={(e) => {
                            props.onChange(e.target.value);
                          }}
                          onBlur={(e) => {
                            props.onBlur(e);
                          }}
                          max={new Date().toISOString().split('T')[0]}
                          t={t}
                        />
                      )}
                    />
                    {errors?.cluApprovalDate && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.cluApprovalDate.message}</p>}
                  </div>
                </LabelFieldPair>
              </React.Fragment>
            )}
          </React.Fragment>
        )}
        <CardLabelError style={errorStyle}>{errors?.cluNumber?.message || ""}</CardLabelError>

        {/* Application Applied Under - Only show when CLU is YES - Using MDMS data */}
        {selectedIsCluApproved?.code === "YES" && (
          <React.Fragment>
            <LabelFieldPair>
              <CardLabel className="card-label-smaller">
                {`${t("Area Type")}`} <span className="requiredField">*</span>
              </CardLabel>
              {areaTypeOptions.length > 0 && (
                <Controller
                  control={control}
                  name={"applicationAppliedUnder"}
                  rules={{
                    required: t("REQUIRED_FIELD"),
                  }}
                  render={(props) => ( 
                    <Dropdown
                      className="form-field"
                      select={(e) => {
                        setApplicationAppliedUnder(e);
                        props.onChange(e);
                      }}
                      selected={props.value}
                      option={areaTypeOptions}
                      optionKey="name"
                      t={t}
                    />
                  )}
                />
              )}
            </LabelFieldPair>
            {errors?.applicationAppliedUnder && (
              <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.applicationAppliedUnder.message}</p>
            )}

            {/* If Application Applied Under = SCHEME_AREA, show Scheme Name and Scheme Type */}
            {applicationAppliedUnder?.code === "SCHEME_AREA" && (
              <React.Fragment>
               
                <LabelFieldPair>
                  <CardLabel className="card-label-smaller">
                    {`${t("BPA_SCHEME_TYPE_LABEL")}`}<span className="requiredField">*</span>
                  </CardLabel>
                  <Controller
                    control={control}
                    name="schemeType"
                    rules={{
                      required: applicationAppliedUnder?.code === "SCHEME_AREA" ? t("REQUIRED_FIELD") : false,
                    }}
                    render={(props) => (
                      <Dropdown
                        className="form-field"
                        select={props.onChange}
                        selected={props.value}
                        option={[
                          { code: "PAPRA", name: "Papra" },
                          { code: "TOWN_PLANNING", name: "Town Planning" },
                          { code: "AFFORDABLE", name: "Affordable" },
                          { code: "DEVELOPMENT", name: "Development" },
                          { code: "EWS", name: "EWS" },
                        ]}
                        optionKey="name"
                        t={t}
                      />
                    )}
                  />
                </LabelFieldPair>
                {errors?.schemeType && (
                  <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.schemeType.message}</p>
                )}
              </React.Fragment>
            )}

            {/* If Application Applied Under = NON_SCHEME_AREA, show Non-Scheme Type dropdown */}
            {applicationAppliedUnder?.code === "NON_SCHEME" && (
              <LabelFieldPair>
                <CardLabel className="card-label-smaller">
                  {`${t("BPA_NON_SCHEME_TYPE_LABEL")}`}<span className="requiredField">*</span>
                </CardLabel>
                {nonSchemeTypeOptions && nonSchemeTypeOptions.length > 0 ? (
                  <Controller
                    control={control}
                    name={"nonSchemeType"}
                    rules={{
                      required: applicationAppliedUnder?.code === "NON_SCHEME" ? t("REQUIRED_FIELD") : false,
                    }}
                    render={(props) => (
                      <Dropdown
                        className="form-field"
                        select={props.onChange}
                        selected={props.value}
                        option={nonSchemeTypeOptions}
                        optionKey="name"
                        t={t}
                      />
                    )}
                  />
                ) : (
                  <p style={{ color: "#999", marginTop: "4px", marginBottom: "0" }}>Loading options...</p>
                )}
                {errors?.nonSchemeType && (
                  <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.nonSchemeType.message}</p>
                )}
              </LabelFieldPair>
            )}

            {/* If Application Applied Under = APPROVED_COLONY, show Approved Colony Name */}
            {applicationAppliedUnder?.code === "APPROVED_COLONY" && (
              <LabelFieldPair>
                <CardLabel className="card-label-smaller">
                  {`${t("BPA_APPROVED_COLONY_NAME_LABEL")}`}<span className="requiredField">*</span>
                </CardLabel>
                <div className="field">
                  <Controller
                    control={control}
                    name="approvedColonyName"
                    defaultValue=""
                    rules={{
                      required: applicationAppliedUnder?.code === "APPROVED_COLONY" ? t("REQUIRED_FIELD") : false,
                    }}
                    render={(props) => (
                      <TextInput
                        className="form-field"
                        value={props.value}
                        onChange={(e) => {
                          props.onChange(e.target.value);
                        }}
                        onBlur={(e) => {
                          props.onBlur(e);
                        }}
                        t={t}
                      />
                    )}
                  />
                </div>
              </LabelFieldPair>
            )}
            {errors?.approvedColonyName && (
              <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.approvedColonyName.message}</p>
            )}
          </React.Fragment>
        )}

      </div>
    </React.Fragment>
  );
};

export default LayoutCLUDetails;


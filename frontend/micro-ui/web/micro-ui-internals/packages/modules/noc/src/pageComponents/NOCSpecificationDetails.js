import React, { useEffect, useState, useRef } from "react";
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
  UploadFile,
} from "@mseva/digit-ui-react-components";
import NOCCustomUploadFile from "./NOCCustomUploadFile";
import { getCode } from "../utils";

const NOCSpecificationDetails = (_props) => {
  const { t, goNext, currentStepData, Controller, control, setValue, errors, errorStyle, watch, trigger, clearErrors } = _props;

  const tenantId = window.location.href.includes("citizen")
    ? window.localStorage.getItem("CITIZEN.CITY")
    : (window.localStorage.getItem("Employee.tenant-id") || Digit.ULBService.getCurrentTenantId());
  const stateId = Digit.ULBService.getStateId();
  const [selectedBuildingCategory, setSelectedBuildingCategory] = useState(currentStepData?.siteDetails?.specificationBuildingCategory || null);

  const [offlineDocError, setOfflineDocError] = useState(null);
  const [retrievedNoc, setRetrievedNoc] = useState(null);
  const [retrievedNocDocs, setRetrievedNocDocs] = useState([]);
  const [retrievedNocError, setRetrievedNocError] = useState("");
  const [isRetrieving, setIsRetrieving] = useState(false);

  const specificationNocType = watch("specificationNocType");
  const existingNocType = watch("existingNocType");
  const existingNocNumber = watch("existingNocNumber");

  const specCode = getCode(specificationNocType);
  const existCode = getCode(existingNocType);

  const isFinalNoc = specCode === "FINAL";
  const isDigitizationOfManual = specCode === "DIGITIZATION_OF_MANUAL";
  const isOffline = existCode === "OFFLINE";
  const isOnline = existCode === "ONLINE";

  const prevNocTypeRef = useRef(specificationNocType);
  const userHasChangedNocTypeRef = useRef(false);

  useEffect(() => {
    const prevCode = getCode(prevNocTypeRef.current);
    const currentCode = getCode(specificationNocType);
    if (prevCode && prevCode !== currentCode) {
      userHasChangedNocTypeRef.current = true;
      setValue("existingNocType", null);
      setValue("existingNocNumber", "");
      setValue("existingNocDate", "");
      setValue("existingNocDocument", null);
      updateNocValidated(false);
      updateValidatedNocNumber("");
      setRetrievedNoc(null);
      setRetrievedNocDocs([]);
      setRetrievedNocError("");
    }
    prevNocTypeRef.current = specificationNocType;
  }, [specificationNocType]);

  const prevExistingNocTypeRef = useRef(existingNocType);
  const userHasChangedExistingNocTypeRef = useRef(false);

  useEffect(() => {
    const prevCode = getCode(prevExistingNocTypeRef.current);
    const currentCode = getCode(existingNocType);
    if (prevCode && prevCode !== currentCode) {
      userHasChangedExistingNocTypeRef.current = true;
      setValue("existingNocNumber", "");
      setValue("existingNocDate", "");
      setValue("existingNocDocument", null);
      updateNocValidated(false);
      updateValidatedNocNumber("");
      setRetrievedNoc(null);
      setRetrievedNocDocs([]);
      setRetrievedNocError("");
    }
    prevExistingNocTypeRef.current = existingNocType;
  }, [existingNocType]);

  const validatedNocNumberRef = useRef(currentStepData?.siteDetails?.existingNocNumber || "");
  const [validatedNocNumber, setValidatedNocNumber] = useState(currentStepData?.siteDetails?.existingNocNumber || "");

  const updateValidatedNocNumber = (val) => {
    validatedNocNumberRef.current = val;
    setValidatedNocNumber(val);
  };

  const [isNocValidated, setIsNocValidated] = useState(() => {
    if (currentStepData?.siteDetails?.isNocValidated !== undefined) return Boolean(currentStepData.siteDetails.isNocValidated);
    return Boolean(isFinalNoc && isOnline && currentStepData?.siteDetails?.existingNocNumber);
  });

  const updateNocValidated = (val) => {
    setIsNocValidated(val);
    setValue("isNocValidated", val);
    if (val) {
      if (clearErrors) clearErrors("existingNocNumber");
      if (trigger) trigger("existingNocNumber");
    }
  };

  const applicationNo = currentStepData?.applicationNo || currentStepData?.apiData?.applicationNo || currentStepData?.apiData?.Noc?.[0]?.applicationNo || watch("applicationNo");
  const isEditMode = !!applicationNo || window.location.pathname.includes("edit");
  const isInitialized = useRef(false);

  // Restore NOC validation status in edit mode on initial load
  useEffect(() => {
    if (isEditMode && existingNocNumber && !isInitialized.current) {
      updateValidatedNocNumber(existingNocNumber);
      updateNocValidated(true);
      isInitialized.current = true;
    }
  }, [isEditMode, existingNocNumber]);

  useEffect(() => {
    if (isNocValidated && validatedNocNumberRef.current && existingNocNumber && existingNocNumber !== validatedNocNumberRef.current) {
      updateNocValidated(false);
      setRetrievedNocDocs([]);
      setRetrievedNoc(null);
      setRetrievedNocError("");
    }
  }, [existingNocNumber, isNocValidated]);

  useEffect(() => {
    if (isNocValidated && existingNocNumber && retrievedNocDocs.length === 0 && !isRetrieving) {
      handleRetrieveNoc(existingNocNumber);
    }
  }, [isNocValidated, existingNocNumber, retrievedNocDocs.length]);

  const { data: buildingCategory, isLoading: isLoading, error: buildingCategoryError } = Digit.Hooks.noc.useBuildingCategory(stateId);
  const { data: nocType, isLoading: isNocTypeLoading,  } = Digit.Hooks.noc.useNocType(stateId);

 // console.log("nocType here", nocType);

  const options = [
    {
      code: "YES",
      i18nKey: "YES",
    },
    {
      code: "NO",
      i18nKey: "NO",
    },
  ];

  const handleRetrieveNoc = async (nocNum) => {
    const numToSearch = (typeof nocNum === "string" ? nocNum : existingNocNumber)?.trim();
    if (!numToSearch) {
      setRetrievedNocError("Existing NOC Number is required");
      return;
    }

    const nocRegex = /^PB-NOC-SAS-[A-Za-z]+-\d+$/i;
    if (!nocRegex.test(numToSearch)) {
      setRetrievedNocError("");
      setRetrievedNoc(null);
      setRetrievedNocDocs([]);
      setValue("existingNocDocument", null);
      updateNocValidated(false);
      updateValidatedNocNumber("");
      if (trigger) trigger("existingNocNumber");
      return;
    }

    setIsRetrieving(true);
    setRetrievedNocError("");
    try {
      let searchTenantId = tenantId;
      const parts = numToSearch.split("-");
      if (parts.length >= 4 && parts[3]) {
        searchTenantId = `pb.${parts[3].toLowerCase()}`;
      }

      let response = await Digit.NOCService.NOCsearch({
        tenantId: searchTenantId,
        filters: { applicationNo: numToSearch }
      });

      if (!response?.Noc?.[0]) {
        response = await Digit.NOCService.NOCsearch({
          tenantId: searchTenantId,
          filters: { nocNo: numToSearch }
        });
      }

      if (!response?.Noc?.[0] && searchTenantId !== tenantId) {
        response = await Digit.NOCService.NOCsearch({
          tenantId,
          filters: { applicationNo: numToSearch }
        });
      }

      if (!response?.Noc?.[0] && searchTenantId !== tenantId) {
        response = await Digit.NOCService.NOCsearch({
          tenantId,
          filters: { nocNo: numToSearch }
        });
      }

      const nocData = response?.Noc?.[0];
      const fileStoreIds = [];

      if (nocData) {
        setRetrievedNoc(nocData);
        const sanctionLetterFilestoreId = nocData?.nocDetails?.additionalDetails?.sanctionLetterFilestoreId;
        if (sanctionLetterFilestoreId) {
          fileStoreIds.push(sanctionLetterFilestoreId);
        } else {
          const docs = nocData?.documents || [];
          const docsFileStoreIds = docs.map(d => d.fileStoreId || d.filestoreId).filter(Boolean);
          fileStoreIds.push(...docsFileStoreIds);
        }
      }

      const existingDocId = currentStepData?.siteDetails?.existingNocDocument || watch("existingNocDocument");
      if (fileStoreIds.length === 0 && existingDocId) {
        const docIdStr = typeof existingDocId === "string" ? existingDocId : (existingDocId.fileStoreId || existingDocId.filestoreId);
        if (docIdStr) fileStoreIds.push(docIdStr);
      }

      if (fileStoreIds.length > 0) {
        const fileFetchResponse = await Digit.UploadServices.Filefetch(fileStoreIds, searchTenantId || tenantId);
        const pdfFiles = fileFetchResponse?.data || {};

        const mappedDocs = fileStoreIds.map((fid) => {
          let rawUrl = "";
          if (pdfFiles?.fileStoreIds && Array.isArray(pdfFiles.fileStoreIds)) {
            const foundFile = pdfFiles.fileStoreIds.find(f => f?.id === fid || f?.fileStoreId === fid);
            rawUrl = foundFile?.url || "";
          } else if (pdfFiles && typeof pdfFiles === "object") {
            rawUrl = pdfFiles[fid] || "";
          }
          const fileUrl = (typeof rawUrl === "string" ? rawUrl.split(",")?.[0] : "") || rawUrl || "";
          let title = t("NOC_DOCUMENT");
          if (nocData && fid === nocData?.nocDetails?.additionalDetails?.sanctionLetterFilestoreId) {
            title = t("APPROVED_NOC_CERTIFICATE") || "Approved NOC Certificate";
          } else {
            const matchingDoc = nocData?.documents?.find(d => (d.fileStoreId || d.filestoreId) === fid);
            if (matchingDoc?.documentType) {
              title = t(String(matchingDoc.documentType).replace(/\./g, "_"));
            }
          }
          return {
            title,
            url: fileUrl
          };
        });
        setRetrievedNocDocs(mappedDocs);
        updateValidatedNocNumber(numToSearch);
        updateNocValidated(true);
        setRetrievedNocError("");
        if (fileStoreIds[0]) {
          setValue("existingNocDocument", fileStoreIds[0]);
        }
      } else {
        setRetrievedNocError("No NOC application found with this number");
        updateNocValidated(false);
        updateValidatedNocNumber("");
      }
    } catch (err) {
      console.error("Error retrieving NOC: ", err);
      if (currentStepData?.siteDetails?.existingNocNumber === numToSearch && currentStepData?.siteDetails?.existingNocDocument) {
        updateValidatedNocNumber(numToSearch);
        updateNocValidated(true);
        setRetrievedNocError("");
      } else {
        setRetrievedNocError("Error validating NOC. Please try again.");
        updateNocValidated(false);
        updateValidatedNocNumber("");
      }
    } finally {
      setIsRetrieving(false);
    }
  };

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

  useEffect(() => {
    if (userHasChangedNocTypeRef.current || userHasChangedExistingNocTypeRef.current) return;
    if (isFinalNoc && currentStepData?.siteDetails?.existingNocType) {
      const matched = [
        { code: "OFFLINE", name: "Offline" },
        { code: "ONLINE", name: "Online" },
      ].find(obj => getCode(obj) === getCode(currentStepData.siteDetails.existingNocType));
      if (matched) {
        setValue("existingNocType", matched);
      }
    }
  }, [isFinalNoc, currentStepData]);

  useEffect(() => {
    if (userHasChangedNocTypeRef.current || userHasChangedExistingNocTypeRef.current) return;
    if (isDigitizationOfManual || (isFinalNoc && isOffline)) {
      if (currentStepData?.siteDetails?.existingNocNumber) {
        setValue("existingNocNumber", currentStepData.siteDetails.existingNocNumber);
      }
      if (currentStepData?.siteDetails?.existingNocDate) {
        setValue("existingNocDate", currentStepData.siteDetails.existingNocDate);
      }
      if (currentStepData?.siteDetails?.existingNocDocument) {
        setValue("existingNocDocument", currentStepData.siteDetails.existingNocDocument);
      }
    }
    if (isFinalNoc && isOnline) {
      if (currentStepData?.siteDetails?.existingNocNumber) {
        setValue("existingNocNumber", currentStepData.siteDetails.existingNocNumber);
      }
    }
  }, [isFinalNoc, isDigitizationOfManual, existingNocType, currentStepData]);



  return (
    <React.Fragment>
      <CardSectionHeader>{t("NOC_SPECIFICATION_DETAILS")}</CardSectionHeader>

      <div>
        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("NOC_PLOT_AREA_JAMA_BANDI_LABEL")}`}<span className="requiredField">*</span></CardLabel>
          <div className="field">
            <Controller
              control={control}
              name="specificationPlotArea"
              rules={{
                  required: t("REQUIRED_FIELD"),
                  pattern: {
                    value: /^[0-9]*\.?[0-9]+$/,
                    message: t("ONLY_NUMERIC_VALUES_ALLOWED_MSG"),
                  },
                  maxLength: {
                    value: 100,
                    message: t("MAX_100_CHARACTERS_ALLOWED"),
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
            {errors?.specificationPlotArea && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.specificationPlotArea.message}</p>}
          </div>
        </LabelFieldPair>

        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("NOC_BUILDING_CATEGORY_LABEL")}`}<span className="requiredField">*</span></CardLabel>
          <div className="field">
          {!isLoading && buildingCategory.length > 0 && (
            <Controller
              control={control}
              name={"specificationBuildingCategory"}
              rules={{ required: t("REQUIRED_FIELD") }}
              render={(props) => (
                <Dropdown
                  className="form-field"
                  select={(e) => {
                    setSelectedBuildingCategory(e);
                    props.onChange(e);
                  }}
                  selected={props.value}
                  option={buildingCategory}
                  optionKey="name"
                  t={t}
                />
              )}
            />
          )}
          {errors?.specificationBuildingCategory && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.specificationBuildingCategory.message}</p>}
          </div>
        </LabelFieldPair>

        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("NOC_NOC_TYPE_LABEL")}`}<span className="requiredField">*</span></CardLabel>
          <div className="field">
            {!isNocTypeLoading && (
                <Controller
                  control={control}
                  name={"specificationNocType"}
                  rules={{
                    required: t("REQUIRED_FIELD"),
                  }}
                  render={(props) => (
                  <Dropdown className="form-field" select={props.onChange} selected={props.value} option={nocType} optionKey="name" t={t}/>
              )}
              />
            )}
            {errors?.specificationNocType && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.specificationNocType.message}</p>}
          </div>
        </LabelFieldPair>

        {isFinalNoc && (
          <React.Fragment>
            <LabelFieldPair>
              <CardLabel className="card-label-smaller">
                {`${t("NOC_EXISTING_NOC_TYPE_LABEL")}`} <span className="requiredField">*</span>
              </CardLabel>
              <div className="field">
                <Controller
                  control={control}
                  name={"existingNocType"}
                  rules={{
                    required: isFinalNoc ? t("REQUIRED_FIELD") : false,
                  }}
                  render={(props) => (
                    <Dropdown
                      className="form-field"
                      select={(e) => {
                        props.onChange(e);
                      }}
                      selected={props.value}
                      option={[
                        { code: "OFFLINE", name: "Offline" },
                        { code: "ONLINE", name: "Online" },
                      ]}
                      optionKey="name"
                      t={t}
                    />
                  )}
                />
                {errors?.existingNocType && (
                  <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.existingNocType.message}</p>
                )}
              </div>
            </LabelFieldPair>
          </React.Fragment>
        )}

        {((isFinalNoc && isOffline) || isDigitizationOfManual) && (
          <React.Fragment>
            <LabelFieldPair>
              <CardLabel className="card-label-smaller">
                {`${t("NOC_NUMBER_LABEL")}`} <span className="requiredField">*</span>
              </CardLabel>
              <div className="field">
                <Controller
                  control={control}
                  name="existingNocNumber"
                  rules={{
                    required: (isOffline || isDigitizationOfManual) ? t("REQUIRED_FIELD") : false,
                  }}
                  render={(props) => (
                    <TextInput
                      className="form-field"
                      value={props.value}
                      onChange={(e) => props.onChange(e.target.value)}
                      onBlur={props.onBlur}
                      t={t}
                    />
                  )}
                />
                {errors?.existingNocNumber && (
                  <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.existingNocNumber.message}</p>
                )}
              </div>
            </LabelFieldPair>

            <LabelFieldPair>
              <CardLabel className="card-label-smaller">
                {`${t("NOC_DATE_LABEL")}`} <span className="requiredField">*</span>
              </CardLabel>
              <div className="field">
                <Controller
                  control={control}
                  name="existingNocDate"
                  rules={{
                    required: (isOffline || isDigitizationOfManual) ? t("REQUIRED_FIELD") : false,
                    validate: (value) => {
                      if (!value) return true;
                      const selectedDate = new Date(value);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      if (selectedDate > today) {
                        return t("NOC_DATE_CANNOT_BE_FUTURE") || "NOC Date cannot be a future date";
                      }
                      return true;
                    },
                  }}
                  render={(props) => (
                    <TextInput
                      type="date"
                      className="form-field"
                      value={props.value}
                      onChange={(e) => props.onChange(e.target.value)}
                      onBlur={props.onBlur}
                      max={new Date().toISOString().split("T")[0]}
                      t={t}
                    />
                  )}
                />
                {errors?.existingNocDate && (
                  <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.existingNocDate.message}</p>
                )}
              </div>
            </LabelFieldPair>


            <LabelFieldPair className="noc-upload-field-pair">
              <CardLabel className="card-label-smaller">
                {`${t("NOC_UPLOAD_DOCUMENT_LABEL")}`} <span className="requiredField">*</span>
              </CardLabel>
              <div className="field" style={{ width: "100%" }}>
                <Controller
                  control={control}
                  name="existingNocDocument"
                  rules={{
                    required: (isOffline || isDigitizationOfManual) ? t("REQUIRED_FIELD") : false,
                  }}
                  render={(props) => (
                    <NOCCustomUploadFile
                      id="existing-noc-document"
                      onUpload={async (e) => {
                        const file = e?.target?.files?.[0];
                        if (!file) return;

                          if (file.size > 5 * 1024 * 1024) {
                            setOfflineDocError(t("NOC_FILE_SIZE_LIMIT_MSG") || "File size should not exceed 5MB");
                            return;
                          }

                        try {
                          setOfflineDocError(null);
                          const response = await Digit.UploadServices.Filestorage("NOC", file, stateId);
                          if (response?.data?.files?.length > 0) {
                            const fileStoreId = response.data.files[0].fileStoreId;
                            props.onChange(fileStoreId);
                          } else {
                            setOfflineDocError(t("NOC_FILE_UPLOAD_FAILED") || "File upload failed");
                          }
                        } catch (err) {
                          setOfflineDocError(t("NOC_FILE_UPLOAD_ERROR") || "File upload error");
                        } 
                      }}
                      onDelete={() => {
                        props.onChange(null);
                        setOfflineDocError(null);
                      }}
                      uploadedFile={props.value}
                      message={props.value ? `1 ${t("FILEUPLOADED")}` : t("ES_NO_FILE_SELECTED_LABEL")}
                      iserror={offlineDocError || errors?.existingNocDocument?.message}
                      uploadMessage=""
                      accept=".pdf"
                      required
                    />
                  )}
                />

              </div>
            </LabelFieldPair>

          </React.Fragment>
        )}

        {(isFinalNoc && isOnline) && (
          <React.Fragment>
            <LabelFieldPair>
              <CardLabel className="card-label-smaller">
                {`${t("NOC_NUMBER_LABEL")}`} <span className="requiredField">*</span>
              </CardLabel>
              <div className="field">
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <div style={{ flex: 1 }}>
                    <Controller
                      control={control}
                      name="existingNocNumber"
                      rules={{
                        required: (isFinalNoc && isOnline) ? t("REQUIRED_FIELD") : false,
                        validate: (value) => {
                          if (isFinalNoc && isOnline) {
                            if (!value) return t("REQUIRED_FIELD");
                            const nocRegex = /^PB-NOC-.*-\d+$/i;
                            if (!nocRegex.test(value.trim())) {
                              return "Invalid NOC Number format.";
                            }
                            if (!isNocValidated) {
                              return "NOC certificate must be searched and verified";
                            }
                          }
                          return true;
                        }
                      }}
                      render={(props) => (
                        <TextInput
                          className="form-field"
                          value={props.value}
                          onChange={(e) => {
                            const val = e.target.value;
                            props.onChange(val);
                            if (isNocValidated && validatedNocNumberRef.current && val !== validatedNocNumberRef.current) {
                              updateNocValidated(false);
                              setRetrievedNoc(null);
                              setRetrievedNocDocs([]);
                              setValue("existingNocDocument", null);
                            }
                          }}
                          onBlur={props.onBlur}
                          t={t}
                        />
                      )}
                    />
                  </div>
                  {isNocValidated && (
                    <span style={{ color: "#00703c", fontWeight: 500 }}>✓ NOC Validated</span>
                  )}
                  <button
                    type="button"
                    style={{
                      padding: "8px 16px",
                      background: "#1976d2",
                      color: "white",
                      cursor: "pointer",
                      border: "none",
                      borderRadius: "4px",
                      fontWeight: "bold",
                      minWidth: "120px",
                    }}
                    disabled={isRetrieving}
                    onClick={handleRetrieveNoc}
                  >
                    {isRetrieving ? "Searching..." : "Search"}
                  </button>
                </div>
                {!isNocValidated && errors?.existingNocNumber && (
                  <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.existingNocNumber.message}</p>
                )}
                {!errors?.existingNocNumber && retrievedNocError && (
                  <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{retrievedNocError}</p>
                )}
              </div>
            </LabelFieldPair>

            {retrievedNocDocs && retrievedNocDocs.length > 0 && (
              <LabelFieldPair>
                <CardLabel className="card-label-smaller">{t("NOC_RETRIEVED_DOCUMENTS")}</CardLabel>
                <div className="field">
                  {retrievedNocDocs.map((doc, idx) => (
                    <div key={idx} style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "12px" }}>

                      <button
                        type="button"
                        style={{
                          padding: "8px 16px",
                          background: "#1976d2",
                          color: "white",
                          cursor: "pointer",
                          border: "none",
                          borderRadius: "4px",
                          fontWeight: "bold",
                          fontSize: "14px"
                        }}
                        onClick={() => doc.url && window.open(doc.url, "_blank")}
                      >
                        VIEW DOCUMENT
                      </button>
                    </div>
                  ))}
                </div>
              </LabelFieldPair>
            )}
          </React.Fragment>
        )}

        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("NOC_RESTRICTED_AREA_LABEL")}`}<span className="requiredField">*</span></CardLabel>
          <div className="field">
          <Controller
            control={control}
            name={"specificationRestrictedArea"}
            rules={{
              required: t("REQUIRED_FIELD"),
            }}
            render={(props) => (
              <Dropdown
                className="form-field"
                select={props.onChange}
                selected={props.value}
                option={options}
                optionKey="i18nKey"
                t={t}
              />
            )}
          />
          {errors?.specificationRestrictedArea && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.specificationRestrictedArea.message}</p>}
          </div>
        </LabelFieldPair>

        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("NOC_IS_SITE_UNDER_MASTER_PLAN_LABEL")}`}<span className="requiredField">*</span></CardLabel>
          <div className="field">
          <Controller
            control={control}
            name={"specificationIsSiteUnderMasterPlan"}
            rules={{
              required: t("REQUIRED_FIELD"),
            }}
            render={(props) => (
              <Dropdown
                className="form-field"
                select={props.onChange}
                selected={props.value}
                option={options}
                optionKey="i18nKey"
                t={t}
              />
            )}
          />
          {errors?.specificationIsSiteUnderMasterPlan && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.specificationIsSiteUnderMasterPlan.message}</p>}
          </div>
        </LabelFieldPair>
      </div>
    </React.Fragment>
  );
};

export default NOCSpecificationDetails;

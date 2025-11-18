import { 
  CardLabel, 
  FormStep, 
  Loader, 
  RadioButtons, 
  TextInput, 
  UploadFile,
  LabelFieldPair,
  TextArea,
  SubmitBar, 
  CitizenInfoLabel,
  CardHeader ,
  Toast,
  DatePicker,
  Header,
  CardSectionHeader,
  StatusTable, 
  Row,
  InfoBannerIcon,
  ActionBar,
  Dropdown,
  InfoIcon,
  LinkButton
} from "@mseva/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import { useHistory, useRouteMatch } from "react-router-dom";
import DisconnectTimeline from "../components/DisconnectTimeline";
import { stringReplaceAll, createPayloadOfWSDisconnection, updatePayloadOfWSDisconnection, convertDateToEpoch } from "../utils";
import { addDays, format } from "date-fns";

const WSDisconnectionForm = ({ t, config, onSelect, userType }) => {
  let validation = {};
  const stateCode = Digit.ULBService.getStateId();
  const tenantId = Digit.ULBService.getCurrentTenantId();

  const isMobile = window.Digit.Utils.browser.isMobile();
  const applicationData = Digit.SessionStorage.get("WS_DISCONNECTION");
  const history = useHistory();
  const match = useRouteMatch();
  
  const [disconnectionData, setDisconnectionData] = useState({
      type: applicationData.WSDisconnectionForm ? applicationData.WSDisconnectionForm.type : "",
      date: applicationData.WSDisconnectionForm ? applicationData.WSDisconnectionForm.date : "",
      endDate: applicationData.WSDisconnectionForm ? applicationData?.WSDisconnectionForm?.endDate ||"" : "",
      reason: applicationData.WSDisconnectionForm ?  applicationData.WSDisconnectionForm.reason : "",
      documents: applicationData.WSDisconnectionForm ? applicationData.WSDisconnectionForm.documents : []
  });
  const [documents, setDocuments] = useState(applicationData.WSDisconnectionForm ? applicationData.WSDisconnectionForm.documents : []);
  const [error, setError] = useState(null);
  const [disconnectionTypeList, setDisconnectionTypeList] = useState([]);
  const [disconnectionReasonList, setDisconnectionReasonList]=useState([]);
  const [checkRequiredFields, setCheckRequiredFields] = useState(false);
  const [isEnableLoader, setIsEnableLoader] = useState(false);

  const { isMdmsLoading, data: mdmsData } = Digit.Hooks.ws.useMDMS(stateCode, "ws-services-masters", ["disconnectionType"]);
  const {loading, data: disconnectionReason} = Digit.Hooks.ws.useMDMS(stateCode,"ws-services-masters", ["DisconnectionReason"]);
  const { isLoading: wsDocsLoading, data: wsDocs } =  Digit.Hooks.ws.WSSearchMdmsTypes.useWSServicesMasters(stateCode, "DisconnectionDocuments");
  const {isLoading: slaLoading, data: slaData } = Digit.Hooks.ws.useDisconnectionWorkflow({tenantId});
  const isReSubmit = window.location.href.includes("resubmit");
  const {
    isLoading: creatingWaterApplicationLoading,
    isError: createWaterApplicationError,
    data: createWaterResponse,
    error: createWaterError,
    mutate: waterMutation,
  } = Digit.Hooks.ws.useWaterCreateAPI("WATER");

  const {
    isLoading: updatingWaterApplicationLoading,
    isError: updateWaterApplicationError,
    data: updateWaterResponse,
    error: updateWaterError,
    mutate: waterUpdateMutation,
  } = Digit.Hooks.ws.useWSApplicationActions("WATER");


  const {
    isLoading: creatingSewerageApplicationLoading,
    isError: createSewerageApplicationError,
    data: createSewerageResponse,
    error: createSewerageError,
    mutate: sewerageMutation,
  } = Digit.Hooks.ws.useWaterCreateAPI("SEWERAGE");

  const {
    isLoading: updatingSewerageApplicationLoading,
    isError: updateSewerageApplicationError,
    data: updateSewerageResponse,
    error: updateSewerageError,
    mutate: sewerageUpdateMutation,
  } = Digit.Hooks.ws.useWSApplicationActions("SEWERAGE");

  const closeToastOfError = () => { setError(null); };
const getDisconnectionTitle = () => {
  const serviceType = applicationData?.applicationData?.serviceType;
  if (serviceType === "WATER") {
    return t("WS_WATER_DISCONNECTION");
  } else if (serviceType === "SEWARAGE") {
    return t("WS_SEWERAGE_DISCONNECTION");
  } else {
    return t("WS_WATER_AND_SEWERAGE_DISCONNECTION");
  }
};
  useEffect(() => {
    const oldData = {...disconnectionData};
    oldData['documents'] = documents;
    setDisconnectionData(oldData);
  }, [documents]);
  

  useEffect(() => {
    const disconnectionTypes = mdmsData?.["ws-services-masters"]?.disconnectionType || []; 
    disconnectionTypes?.forEach(data => data.i18nKey = `WS_DISCONNECTIONTYPE_${stringReplaceAll(data?.code?.toUpperCase(), " ", "_")}`);

    setDisconnectionTypeList(disconnectionTypes);
    
    // Auto-set Permanent type for employee view if not already set
    if (userType === 'employee' && disconnectionTypes.length > 0 && !disconnectionData?.type?.value) {
      const permanentType = disconnectionTypes.find(type => type.code === "Permanent");
      if (permanentType) {
        setDisconnectionData(prev => ({
          ...prev,
          type: { value: permanentType, code: "type" }
        }));
      }
    }
  }, [mdmsData]);
  useEffect(() => {
    const disconnectionReasons = disconnectionReason?.["ws-services-masters"]?.DisconnectionReason || []; 
    disconnectionReasons?.forEach(data => data.i18nKey = `WS_DISCONNECTIONTYPE_${stringReplaceAll(data?.code?.toUpperCase(), " ", "_")}`);
      setDisconnectionReasonList(disconnectionReasons);
  }, [disconnectionReason]);

  useEffect(() => {
    Digit.SessionStorage.set("WS_DISCONNECTION", {...applicationData, WSDisconnectionForm: disconnectionData});
  }, [disconnectionData]);
  const handleSubmit = () => onSelect(config.key, { WSDisConnectionForm: disconnectionData });

  const handleEmployeeSubmit = () => {
    onSelect(config.key, { WSDisConnectionForm: {...disconnectionData, documents:documents} });
  };


  const onSkip = () => onSelect();

  const filedChange = (val) => {
    const oldData = {...disconnectionData};
    oldData[val.code]=val;
    setDisconnectionData(oldData);
  }

  const onSubmit = async (data) => {
    const appDate= new Date();
    const slaDays = slaData?.slaDays || 0;
    // Validate that slaDays is a number
    if (isNaN(slaDays)) {
      setError({key: "error", message: "INVALID_SLA_DAYS"});
      setTimeout(() => {
        setError(false);
      }, 3000);
      return;
    }
    
    const proposedDate = format(addDays(appDate, slaDays), 'yyyy-MM-dd').toString();

    // Add safety checks for date validation
    if (!data?.date || data?.date === "") {
      setError({key: "error", message: "PROPOSED_DISCONNECTION_DATE_REQUIRED"});
      setTimeout(() => {
        setError(false);
      }, 3000);
      return;
    }

    // Convert dates safely
    const disconnectionDateEpoch = convertDateToEpoch(data?.date);
    const proposedDateEpoch = convertDateToEpoch(proposedDate);
    
    // Updated logic: Disconnection date should be greater than the calculated SLA date
    // This means user cannot schedule disconnection before the minimum SLA period
    if (disconnectionDateEpoch < proposedDateEpoch) {
      setError({key: "error", message: `PROPOSED_DISCONNECTION_INVALID_DATE - Minimum date should be ${proposedDate}`});
      setTimeout(() => {
        setError(false);
      }, 3000);
      return;
    }

    // Check for temporary disconnection end date
    if (data?.type?.value?.name === "Temporary") {
      if (!data?.endDate || data?.endDate === "") {
        setError({key: "error", message: "END_DATE_REQUIRED_FOR_TEMPORARY"});
        setTimeout(() => {
          setError(false);
        }, 3000);
        return;
      }
      
      const endDateEpoch = convertDateToEpoch(data?.endDate);
      if (endDateEpoch <= disconnectionDateEpoch) {
        setError({key: "error", message: "PROPOSED_DISCONNECTION_INVALID_END_DATE"});
        setTimeout(() => {
          setError(false);
        }, 3000);
        return;
      }
    }

    // Check other required fields
    if (wsDocsLoading || documents.length < 2 || !disconnectionData?.reason?.value || disconnectionData?.reason === "" || disconnectionData?.date === "" || disconnectionData?.type === "") {
      setError({ warning: true, message: "PLEASE_FILL_MANDATORY_DETAILS" });
      setTimeout(() => {
        setError(false);
      }, 3000);
      return;
    }

    // Proceed with API calls
    try {
      const payload = await createPayloadOfWSDisconnection(data, applicationData, applicationData?.applicationData?.serviceType);
      
      if (payload?.WaterConnection?.water) {
        if (waterMutation) {
          setIsEnableLoader(true);
          await waterMutation(payload, {
            onError: (error, variables) => {
              setIsEnableLoader(false);
              setError({ key: "error", message: error?.response?.data?.Errors?.[0].message ? error?.response?.data?.Errors?.[0].message : error });
              setTimeout(closeToastOfError, 5000);
            },
            onSuccess: async (data, variables) => {
              let response = await updatePayloadOfWSDisconnection(data?.WaterConnection?.[0], "WATER");
              let waterConnectionUpdate = { WaterConnection: response };
              waterConnectionUpdate = {...waterConnectionUpdate, disconnectRequest: true}
              await waterUpdateMutation(waterConnectionUpdate, {
                onError: (error, variables) => {
                  setIsEnableLoader(false);
                  setError({ key: "error", message: error?.response?.data?.Errors?.[0].message ? error?.response?.data?.Errors?.[0].message : error });
                  setTimeout(closeToastOfError, 5000);
                },
                onSuccess: (data, variables) => {
                  Digit.SessionStorage.set("WS_DISCONNECTION", {...applicationData, DisconnectionResponse: data?.WaterConnection?.[0]});
                  history.push(`/digit-ui/employee/ws/ws-disconnection-response?applicationNumber=${data?.WaterConnection?.[0]?.applicationNo}`);                
                },
              })
            },
          });
        }
      }
      else if(payload?.SewerageConnection?.sewerage){
        if (sewerageMutation) {
          setIsEnableLoader(true);
          await sewerageMutation(payload, {

            onError: (error, variables) => {
              setIsEnableLoader(false);
              setError({ key: "error", message: error?.response?.data?.Errors?.[0].message ? error?.response?.data?.Errors?.[0].message : error });
              setTimeout(closeToastOfError, 5000);
            },
            onSuccess: async (data, variables) => {
              let response = await updatePayloadOfWSDisconnection(data?.SewerageConnections?.[0], "SEWERAGE");
              let sewerageConnectionUpdate = { SewerageConnection: response };
              sewerageConnectionUpdate = {...sewerageConnectionUpdate, disconnectRequest: true};
              await sewerageUpdateMutation(sewerageConnectionUpdate, {
                onError: (error, variables) => {
                  setIsEnableLoader(false);
                  setError({ key: "error", message: error?.response?.data?.Errors?.[0].message ? error?.response?.data?.Errors?.[0].message : error });
                  setTimeout(closeToastOfError, 5000);
                },
                onSuccess: (data, variables) => {
                  Digit.SessionStorage.set("WS_DISCONNECTION", {...applicationData, DisconnectionResponse: data?.SewerageConnections?.[0]});
                  history.push(`/digit-ui/employee/ws/ws-disconnection-response?applicationNumber=${data?.SewerageConnections?.[0]?.applicationNo}`);              
                },
              })
            },
          });
        }
      }
    } catch (error) {
      setIsEnableLoader(false);
      setError({ key: "error", message: "DISCONNECTION_SUBMISSION_FAILED" });
      setTimeout(closeToastOfError, 5000);
    }
    
  } ;

  if (isMdmsLoading || wsDocsLoading || isEnableLoader || slaLoading || loading) return <Loader />


if(userType === 'citizen') {
    return (
      <div>
        {userType === "citizen" && (<DisconnectTimeline currentStep={1} />)}
        <FormStep
          config={config}
          onSelect={handleSubmit}
          onSkip={onSkip}
          t={t}       
        >
          
          <div className="DS-citizen-form-container">
          <CardHeader>{ isReSubmit ? t("RESUBMIT_DISCONNECTION_FORM") : t("WS_APPLICATION_FORM")}</CardHeader>
          <StatusTable>
            <Row key={t("PDF_STATIC_LABEL_CONSUMER_NUMBER_LABEL")} label={`${t("PDF_STATIC_LABEL_CONSUMER_NUMBER_LABEL")}`} text={applicationData?.connectionNo} className="border-none" />
          </StatusTable> 
          
          <CardLabel className="card-label-smaller">{t("WS_DISCONNECTION_TYPE")} <span>*</span></CardLabel>
          <RadioButtons
                t={t}
                options={disconnectionTypeList}
                optionsKey="i18nKey"
                value={disconnectionData.type?.value?.code}
                selectedOption={disconnectionData.type?.value}
                isMandatory={false}
                onSelect={(val) => filedChange({code: "type",value: val})}
                labelKey="WS_DISCONNECTION_TYPE"
            />
            <CardLabel className="card-label-smaller">
            {t("WS_DISCONNECTION_PROPOSED_DATE")} <span>*</span>
            <div className="tooltip">
            <InfoIcon/>
            <span className="tooltiptext">
                   {t("SHOULD_BE_DATE") + " " + slaData?.slaDays + " " + t("DAYS_OF_APPLICATION_DATE")}
                  </span>
            </div>
          </CardLabel>
          <div className="field">
          <DatePicker
            date={disconnectionData?.date}
            onChange={(date) => {
              setDisconnectionData({ ...disconnectionData, date: date });
            }}
          ></DatePicker>
          </div>
          {disconnectionData.type?.value?.code === "Temporary"?
          <div>
          <CardLabel className="card-label-smaller">
            {t("WS_DISCONNECTION_PROPOSED_END_DATE")} <span>*</span>
            <div className="tooltip">
            <InfoIcon/>
            <span className="tooltiptext">
                   {t("SHOULD_BE_DATE") + " "  + " " + t("DAYS_OF_PROPOSED_DATE")}
                  </span>
            </div>
          </CardLabel>
          <div className="field">
          <DatePicker
            date={disconnectionData?.endDate}
            onChange={(date) => {
              setDisconnectionData({ ...disconnectionData, endDate: date });
            }}
          ></DatePicker>
          </div>
          </div>
          :""}
            <LabelFieldPair>
              <CardLabel className="card-label-smaller">{t("WS_DISCONNECTION_REASON")}<span>*</span></CardLabel>              
                <Dropdown
                  option={disconnectionReasonList}
                  isMandatory={false}
                  optionKey="i18nKey"
                  t={t}
                  name={"reason"}
                  value={disconnectionData.reason?.value?.code}
                  selectedOption={disconnectionData.reason?.value}
                  labelKey="WS_DISCONNECTION_REASON"
                  select={(e) => filedChange({code:"reason" , value:e})}
                />              
            </LabelFieldPair>
            <SubmitBar
              label={t("CS_COMMON_NEXT")}
              onSubmit={() => {
                const appDate= new Date();
                const proposedDate= format(addDays(appDate, slaData?.slaDays), 'yyyy-MM-dd').toString();
console.log("disconnectionData",disconnectionData)
                if( convertDateToEpoch(disconnectionData?.date)  <= convertDateToEpoch(proposedDate)){
                  setError({key: "error", message: "PROPOSED_DISCONNECTION_INVALID_DATE"});
                  setTimeout(() => {
                    setError(false);
                  }, 3000);  
                }
                else if (disconnectionData?.type?.value?.code =="Temporary"&& parseInt(convertDateToEpoch(disconnectionData.endDate))  <= parseInt(convertDateToEpoch(disconnectionData?.date)))
                {
                  console.log("Temporary connection")
                  setError({key: "error", message: "PROPOSED_DISCONNECTION_INVALID_END_DATE"});
                  setTimeout(() => {
                    setError(false);
                  }, 3000); 
                }
                else{
                  history.push(match.path.replace("application-form", "documents-upload"));
                }
                
              }}
              disabled={
                disconnectionData?.reason?.value === "" || disconnectionData?.reason === "" || disconnectionData?.date === "" || disconnectionData?.type === "" 
                ? true 
                : false}
             />
            {error && <Toast error={error?.key === "error" ? true : false} label={t(error?.message)} onClose={() => setError(null)} />}
          </div>
        </FormStep>
        <CitizenInfoLabel className="DS-citizen-info-label" text={t(`WS_DISONNECT_APPL_INFO`)} info={t("CS_COMMON_INFO")} />
      </div>
    );
  }
  return (
    <div className="DS-disconnection-page-container">
    <Header className="DS-header">
      {/* {t("WS_WATER_AND_SEWERAGE_DISCONNECTION")} */}
       {getDisconnectionTitle()}
      </Header>
    <FormStep
          config={config}
          onSelect={handleEmployeeSubmit}
          onSkip={onSkip}
          t={t}       
          cardStyle={{
            padding: 0,
            margin: 0,
            boxShadow: "none",
            backgroundColor: "transparent",
            border: "none",
            borderRadius: 0
          }}
    >
      <div className="DS-disconnectionFormUI">
        {/* Application Details Section */}
        <h2>{t("CS_TITLE_APPLICATION_DETAILS")}</h2>
        
        {/* Consumer Number - Inline */}
        <div className="DS-consumer-number-row">
          <label>{t("PDF_STATIC_LABEL_CONSUMER_NUMBER_LABEL")}</label>
          <p>{applicationData?.applicationData?.connectionNo}</p>
        </div>
        
        {/* Disconnection Type - Inline */}
        <div className="DS-disconnection-type-row">
          <div className="DS-label-wrapper">
            <label>
              {t("WS_DISCONNECTION_TYPE")}<span> *</span>
            </label>
            <div className={`tooltip`}>
              <InfoIcon/>
              <span className="tooltiptext" style={{
                whiteSpace: Digit.Utils.browser.isMobile() ? "unset" : "nowrap",
                fontSize: "medium",
                width:  Digit.Utils.browser.isMobile() && window.location.href.includes("/employee") ? "200px" : "",
              }}>
                {`${t(`WS_DISCONNECTION_PERMANENT_TOOLTIP`)}`}
              </span>
            </div>
          </div>
          <p>
            {t("WS_DISCONNECTIONTYPE_PERMANENT")}
          </p>
        </div>
          
        {/* Proposed Disconnection Date */}
        <div className="DS-date-field">
          <div className="DS-label-row">
            <label>
              {t("WS_DISCONNECTION_PROPOSED_DATE")} <span> *</span>
            </label>
            <div className={`tooltip`}>
              <InfoIcon/>
              <span className="tooltiptext" style={{
                whiteSpace: Digit.Utils.browser.isMobile() ? "unset" : "nowrap",
                fontSize: "medium",
              }}>
                {t("SHOULD_BE_DATE")+ " " + slaData?.slaDays + " " + t("DAYS_OF_APPLICATION_DATE")}
              </span>
            </div>
          </div>
          <div className="DS-field-wrapper">
            <DatePicker
              date={disconnectionData?.date}
              onChange={(date) => {
                setDisconnectionData({ ...disconnectionData, date: date });
              }}
            />
          </div>
        </div>
        
        {/* Temporary Disconnection End Date */}
        {disconnectionData.type?.value?.code === "Temporary" && (
          <div className="DS-date-field">
            <div className="DS-label-row">
              <label>
                {t("WS_DISCONNECTION_PROPOSED_END_DATE")} <span> *</span>
              </label>
              <div className={`tooltip`}>
                <InfoIcon/>
                <span className="tooltiptext" style={{
                  whiteSpace: Digit.Utils.browser.isMobile() ? "unset" : "nowrap",
                  fontSize: "medium",
                }}>
                  {t("SHOULD_BE_DATE")+ " " + " " + t("DAYS_OF_APPLICATION_END_DATE")}
                </span>
              </div>
            </div>
            <div className="DS-field-wrapper">
              <DatePicker
                date={disconnectionData?.endDate}
                onChange={(date) => {
                  setDisconnectionData({ ...disconnectionData, endDate: date });
                }}
              />
            </div>
          </div>
        )}
        
        {/* Reason for Disconnection */}
        <div className="DS-reason-field">
          <label>
            {t("WS_DISCONNECTION_REASON")}<span> *</span>
          </label>
          <div className="DS-field-wrapper">
            <Dropdown
              option={disconnectionReasonList}
              isMandatory={false}
              optionKey="i18nKey"
              t={t}
              name={"reason"}
              value={disconnectionData.reason?.value?.code}
              selectedOption={disconnectionData.reason?.value}
              select={(e) => filedChange({code:"reason" , value:e})}
              labelKey="WS_DISCONNECTION_REASON"
            />
          </div>
        </div>
        
        {/* Disconnection Documents Section */}
        <h2>
          {t("WS_DISCONNECTION_DOCUMENTS")}<span> *</span>
        </h2>
        
        {wsDocs?.DisconnectionDocuments?.map((document, index) => { 
                  return (
                    <SelectDocument
                      key={index}
                      document={document}
                      t={t}
                      error={error}
                      setError={setError}
                      setDocuments={setDocuments}
                      documents={documents}
                      setCheckRequiredFields={setCheckRequiredFields}
                    />
                  );
                  })}
                  {error && <Toast error={error?.key === "error" ? true : false} label={t(error?.message)} warning={error?.warning} onClose={() => setError(null)} />}
      </div>


    </FormStep>
    <div className="DS-disconnection-action-bar">
      {/* Left side - Back button */}
      <button
        onClick={() => history.goBack()}
        className="DS-back-button"
      >
        {t("CS_COMMON_BACK")}
      </button>
      
      {/* Right side - Cancel and Submit buttons */}
      <div className="DS-action-buttons">
        <button
          onClick={() => {
            Digit.SessionStorage.del("WS_DISCONNECTION");
            window.location.href = "https://mseva.lgpunjab.gov.in/employee/inbox";
          }}
          className="DS-cancel-button"
        >
          {t("CS_COMMON_CANCEL")}
        </button>
        <button
          onClick={() => onSubmit(disconnectionData)}
          className="DS-submit-button"
        >
          {t("ACTION_TEST_SUBMIT")}
        </button>
      </div>
    </div>
    </div>
  );

};


function SelectDocument({
  t,
  key,
  document: doc,
  setDocuments,
  error,
  setError,
  documents,
  setCheckRequiredFields
}) {

  const filteredDocument = documents?.filter((item) => item?.documentType?.includes(doc?.code))[0];
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const [selectedDocument, setSelectedDocument] = useState(
      filteredDocument
          ? { ...filteredDocument, active: true, code: filteredDocument?.documentType, i18nKey: filteredDocument?.documentType }
          : doc?.dropdownData?.length === 1
              ? doc?.dropdownData[0]
              : {}
  );
  const [file, setFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(() => filteredDocument?.fileStoreId || null);

  const handleSelectDocument = (value) => setSelectedDocument(value);

  function selectfile(e) {
      setFile(e.target.files[0]);
  }

  useEffect(() => {
    if (selectedDocument?.code) {
        setDocuments((prev) => {
            const filteredDocumentsByDocumentType = prev?.filter((item) => item?.documentType !== selectedDocument?.code);
            if (uploadedFile?.length === 0 || uploadedFile === null) return filteredDocumentsByDocumentType;
            const filteredDocumentsByFileStoreId = filteredDocumentsByDocumentType?.filter((item) => item?.fileStoreId !== uploadedFile);
            return [
                ...filteredDocumentsByFileStoreId,
                {
                    documentType: selectedDocument?.code,
                    fileStoreId: uploadedFile,
                    documentUid: uploadedFile,
                    fileName: file?.name || "",
                },
            ];
        });
    }
}, [uploadedFile, selectedDocument]);

  useEffect(() => {
      (async () => {
          setError(null);
          if (file) {
              if (file.size >= 5242880) {
                  setError({key: "error", message: "CS_MAXIMUM_UPLOAD_SIZE_EXCEEDED"});
              } else {
                  try {
                      setUploadedFile(null);
                      const response = await Digit.UploadServices.Filestorage("WS", file, tenantId?.split(".")[0]);
                      if (response?.data?.files?.length > 0) {
                          setUploadedFile(response?.data?.files[0]?.fileStoreId);
                      } else {
                          setError({key: "error", message: "CS_FILE_UPLOAD_ERROR"});
                      }
                  } catch (err) {
                      setError({key: "error", message: "CS_FILE_UPLOAD_ERROR"});
                  }
              }
          }
      })();
  }, [file]);

  return (
    <div className="DS-document-field">
      <label>
        {t(doc?.i18nKey)}<span> *</span>
      </label>
      
      <div className="DS-dropdown-wrapper">
        <Dropdown
          t={t}
          isMandatory={false}
          option={doc?.dropdownData}
          selected={selectedDocument}
          optionKey="i18nKey"
          select={handleSelectDocument}
        />
      </div>

      <div className="DS-upload-wrapper">
        <UploadFile
          id={`noc-doc-1-${key}`}
          extraStyleName={"propertyCreate"}
          accept= "image/*, .pdf, .png, .jpeg, .jpg"
          onUpload={selectfile}
          onDelete={() => {
            setUploadedFile(null);
            setCheckRequiredFields(true);
          }}
          message={uploadedFile ? `1 ${t(`CS_ACTION_FILEUPLOADED`)}` : t(`ES_NO_FILE_SELECTED_LABEL`)}
          error={error}
        />
      </div>
    </div>
  );

}

export default WSDisconnectionForm;
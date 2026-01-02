/** 
 * @author - Shivank Shukla  - NIUA
  
 * Addition of feature of fetching Latitude and Longitude from uploaded photo 

    - i have added a function (extractGeoLocation)  to extract latitude and longitude from an uploaded image file.
    - It takes the file object as input and returns a promise.
    - Within the promise, EXIF.get() is called with the file object to extract EXIF data.
    - Latitude and longitude are then retrieved from the EXIF data and converted to decimal format using the convertToDecimal function.
    - If latitude and longitude are found, the promise is resolved with an object containing latitude and longitude. 
      Otherwise, if not found still it resolve the promise with latitude and longitude as NULL value.
    - The convertToDecimal function converts GPS coordinates from degrees, minutes, and seconds format to decimal format.

    - The getData function is modified to include the geolocation extraction logic.
    - When files are uploaded (e?.length > 0), the function extractGeoLocation extracts geolocation if any
    - If geolocation extraction is successful, it logs the latitude and longitude to the console.
    - After extracting geolocation, the function continues with the existing logic to handle the uploaded files. 
*/

import React, { useEffect, useMemo, useState } from "react";
import {
  CardLabel,
  Dropdown,
  UploadFile,
  Toast,
  Loader,
  FormStep,
  MultiUploadWrapper,
  CitizenInfoLabel,
  LabelFieldPair,
  ActionBar,
  SubmitBar
} from "@mseva/digit-ui-react-components";
import Timeline from "../components/Timeline";
import DocumentsPreview from "../../../templates/ApplicationDetails/components/DocumentsPreview";
import { stringReplaceAll } from "../utils";
import cloneDeep from "lodash/cloneDeep";
import EXIF from "exif-js";
import CustomUploadFile from "../components/CustomUploadFile";
import { LoaderNew } from "../components/LoaderNew";

const DocumentDetails = ({ t, config, onSelect, userType, formData, setError: setFormError, clearErrors: clearFormErrors, formState, currentStepData, onGoBack }) => {
  const stateId = Digit.ULBService.getStateId();
  const [documents, setDocuments] = useState(currentStepData?.createdResponse?.documents ?? []);
  const [error, setError] = useState(null);
  const [enableSubmit, setEnableSubmit] = useState(true);
  const [checkRequiredFields, setCheckRequiredFields] = useState(false);
  const checkingFlow = formData?.uiFlow?.flow;
  const [showToast, setShowToast] = useState(null);

  const [isNextButtonDisabled, setIsNextButtonDisabled] = useState(false);
  const isMobile = Digit.Utils.browser.isMobile()
  const [apiLoading, setApiLoading] = useState(false);
  const tenantId = localStorage.getItem("CITIZEN.CITY")

  const beforeUploadDocuments = cloneDeep(formData?.PrevStateDocuments || []);
  // const {data: bpaTaxDocuments, isLoading} = Digit.Hooks.obps.useBPATaxDocuments(stateId, formData, beforeUploadDocuments || []);
  console.log("currentStepData",currentStepData)
  const searchObj = currentStepData?.createdResponse
  const { data: bpaTaxDocuments, isLoading } = Digit.Hooks.obps.useBPATaxDocuments(
    stateId,
    {
      status: searchObj?.status,
      riskType: searchObj?.riskType,
      data: {
        serviceType: searchObj?.additionalDetails?.serviceType,
        applicationType: searchObj?.additionalDetails?.applicationType,
      }
    },
    beforeUploadDocuments || []
  );

  const { isLoading: bpaDocsLoading, data: bpaDocs } = Digit.Hooks.obps.useMDMS(stateId, "BPA", ["DocTypeMapping"]);
  console.log("bpaTaxDocuments", 
    bpaDocs?.BPA?.DocTypeMapping.filter(data => (data.WFState == searchObj?.status && data.RiskType == searchObj?.riskType && data.ServiceType == searchObj?.additionalDetails?.serviceType && data.applicationType == searchObj?.additionalDetails?.applicationType))
  )

  console.log(formData, "FDFDFDF");
  console.log(bpaTaxDocuments, "bpabpa");

  // useEffect(() => {
  //   console.log("documentInScrutiny", formData, documents);
  // }, [documents]);


  // const handleSubmit = () => {
  //   let document = formData.documents.documents;
  //   // let documentStep;

  //   console.log("documentInScrutiny", formData, documents);
  //   let RealignedDocument = [];
  //   bpaTaxDocuments &&
  //     bpaTaxDocuments.map((ob) => {
  //       documents &&
  //         documents
  //           // .filter((x) => ob.code === stringReplaceAll(x?.additionalDetails.category, "_", "."))
  //           .filter((x) => ob.code === stringReplaceAll(x?.documentType || x?.additionalDetails?.category || "", "_", "."))

  //           .map((doc) => {
  //             RealignedDocument.push(doc);
  //           });
  //     });
  //   // documentStep = [...document, {}];
  //   const documentStep = {
  //     documents: RealignedDocument.length > 0 ? RealignedDocument : documents,
  //   };
  //   console.log("DocumentInCall", documentStep);
  //   // onSelect(config.key, documentStep);
  // };

  const handleSubmit = async () => {
    // console.log("documentInScrutiny", formData, documents);
    const mandatoryList = bpaTaxDocuments?.filter((document) => ((document.code !== "ARCHITECT.UNDERTAKING" && document.code !== "CITIZEN.UNDERTAKING" && document.code !== "SITEPHOTOGRAPH_ONE") && document?.required))
    const updatedDocuments = documents?.map((item) => {
      const id = currentStepData?.createdResponse?.documents?.find((doc) => doc?.documentType === item?.documentType)?.id || null;
      return {
        ...item,
        id
      }
    })

    const missingDocuments = mandatoryList?.filter(
      (mandatoryDoc) =>
        !updatedDocuments?.some(
          (doc) =>
            doc?.documentType === mandatoryDoc?.code // must exist with id
        )
    );
    // console.log("documentInScrutiny", mandatoryList, missingDocuments, updatedDocuments);


    if(missingDocuments?.length > 0){
      setShowToast({
        key: "error",
        label: `${t("Missing Fields")}: ${t(missingDocuments?.[0]?.code)}`
      })
      return;
    }
    
      const userInfo = Digit.UserService.getUser()
      const accountId = userInfo?.info?.uuid
      const workflowAction = formData?.data?.applicationNo ? "SAVE_AS_DRAFT" : "INITIATE";

          try{
        setApiLoading(true);
        const result = await Digit.OBPSService.update({ BPA: {
          ...currentStepData?.createdResponse,
          documents: [...updatedDocuments],
          workflow: {
            action: workflowAction,
            assignes: [accountId]
          }
        } }, tenantId)
        if(result?.ResponseInfo?.status === "successful"){
          setApiLoading(false);
          onSelect("");
        }else{
          alert(t("BPA_CREATE_APPLICATION_FAILED"));
          setApiLoading(false);
        }
        console.log("APIResponse", result);
      }catch(e){
        console.log("error", e);
        alert(t("BPA_CREATE_APPLICATION_FAILED"));
        setApiLoading(false);
      }
  };

  const onSkip = () => onSelect();
  function onAdd() { }
  useEffect(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth" // use "auto" for instant scroll
      });
  }, [])
  useEffect(() => {
    const allRequiredDocumentsCode = bpaTaxDocuments.filter((e) => e.required).map((e) => e.code);

    const reqDocumentEntered = allRequiredDocumentsCode.filter((reqCode) =>
      documents.reduce((acc, doc) => {
        if (reqCode == `${doc?.documentType?.split(".")?.[0]}.${doc?.documentType?.split(".")?.[1]}`) {
          return true;
        } else {
          return acc;
        }
      }, false)
    );
    if (reqDocumentEntered.length == allRequiredDocumentsCode.length && documents.length > 0) {
      setEnableSubmit(false);
    } else {
      setEnableSubmit(true);
    }
  }, [documents, checkRequiredFields]);

  if(apiLoading) return (<Loader />)

  return (
    <div>
      {(window.location.href.includes("/bpa/building_plan_scrutiny/new_construction") ||
        window.location.href.includes("/ocbpa/building_oc_plan_scrutiny/new_construction")) &&
        formData?.applicationNo ? (
        <CitizenInfoLabel
          info={t("CS_FILE_APPLICATION_INFO_LABEL")}
          text={`${t("BPA_APPLICATION_NUMBER_LABEL")} ${formData?.applicationNo} ${t("BPA_DOCS_INFORMATION")}`}
          className={"info-banner-wrap-citizen-override"}
        />
      ) : (
        ""
      )}
      {/* {isMobile && <Timeline currentStep={checkingFlow === "OCBPA" ? 3 : 3} flow={checkingFlow === "OCBPA" ? "OCBPA" : ""} />} */}
      {!isLoading ? (
        <FormStep
          t={t}
          config={{...config, texts:{header: "BPA_DOCUMENT_DETAILS_LABEL"},}}
          onSelect={handleSubmit}
          onSkip={onSkip}
          // isDisabled={window.location.href.includes("editApplication")||window.location.href.includes("sendbacktocitizen")?false:enableSubmit}
          // isDisabled={(window.location.href.includes("editApplication") || window.location.href.includes("sendbacktocitizen") ? false : enableSubmit) || isNextButtonDisabled}
          onAdd={onAdd}
        >
          {/* {bpaTaxDocuments?.map((document, index) => { */}
          {bpaTaxDocuments
            ?.filter((document) => document.code !== "ARCHITECT.UNDERTAKING" && document.code !== "CITIZEN.UNDERTAKING" && document.code !== "SITEPHOTOGRAPH_ONE")
            .map((document, index) => {
              return (
                <div
                
                >
                  <SelectDocument
                    key={index}
                    document={document}
                    t={t}
                    error={error}
                    setError={setError}
                    setDocuments={setDocuments}
                    documents={documents}
                    setCheckRequiredFields={setCheckRequiredFields}
                    formData={formData}
                    beforeUploadDocuments={beforeUploadDocuments || []}
                    isNextButtonDisabled={isNextButtonDisabled}
                    setIsNextButtonDisabled={setIsNextButtonDisabled}
                  />
                </div>
              );
            })}
          {error && <Toast label={error} onClose={() => setError(null)} error />}
        </FormStep>
      ) : (
        <Loader />
      )}

      <ActionBar>
        <SubmitBar
          label="Back"
        
          onSubmit={onGoBack}
        />
        {<SubmitBar label={t(`CS_COMMON_NEXT`)} onSubmit={handleSubmit} disabled={apiLoading}/>}
      </ActionBar>
      {showToast && (
              <Toast
                error={showToast.key}
                label={t(showToast.label)}
                onClose={() => {
                  setShowToast(null);
                }}
                isDleteBtn={"true"}
              />
      )}
    </div>
  );
};



function SelectDocument({
  t,
  document: doc,
  setDocuments,
  error,
  setError,
  documents,
  action,
  formData,
  setFormError,
  clearFormErrors,
  config,
  formState,
}) {
  const filteredDocument = documents?.filter((item) => item?.documentType?.includes(doc?.code))[0];
  const tenantId = Digit.ULBService.getCurrentTenantId();

  const [file, setFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(() => filteredDocument?.fileStoreId || null);
  const [loader, setLoader] = useState(false);

  const handleSelectDocument = (value) => setSelectedDocument(value);

  function selectfile(e) {
    setFile(e.target.files[0]);
  }
  const { dropdownData } = doc;
  // const { dropdownFilter, enabledActions, filterCondition } = doc?.additionalDetails;
  var dropDownData = dropdownData;
  let hideInput = false;

  const [isHidden, setHidden] = useState(hideInput);
  const stateId = Digit.ULBService.getStateId();

  const addError = () => {
    let type = formState.errors?.[config.key]?.type;
    if (!Array.isArray(type)) type = [];
    if (!type.includes(doc.code)) {
      type.push(doc.code);
      setFormError(config.key, { type });
    }
  };

  const removeError = () => {
    let type = formState.errors?.[config.key]?.type;
    if (!Array.isArray(type)) type = [];
    if (type.includes(doc?.code)) {
      type = type.filter((e) => e != doc?.code);
      if (!type.length) {
        clearFormErrors(config.key);
      } else {
        setFormError(config.key, { type });
      }
    }
  };

  useEffect(() => {
    if (uploadedFile) {
      setDocuments((prev) => {
        const filteredDocumentsByDocumentType = prev?.filter((item) => item?.documentType !== doc?.code);

        if (uploadedFile?.length === 0 || uploadedFile === null) {
          return filteredDocumentsByDocumentType;
        }

        const filteredDocumentsByFileStoreId = filteredDocumentsByDocumentType?.filter((item) => item?.fileStoreId !== uploadedFile);
        return [
          ...filteredDocumentsByFileStoreId,
          {
            documentType: doc?.code,
            fileStoreId: uploadedFile,
            documentUid: uploadedFile,
          },
        ];
      });
    } else if (uploadedFile === null) {
      setDocuments((prev) => prev.filter((item) => item?.documentType !== doc?.code));
    }
    // if (!isHidden) {
    //   if (!uploadedFile || !doc?.code) {
    //     addError();
    //   } else if (uploadedFile && doc?.code) {
    //     removeError();
    //   }
    // } else if (isHidden) {
    //   removeError();
    // }
  }, [uploadedFile, isHidden]);

  useEffect(() => {
    (async () => {
      setError(null);
      if (file) {
        if (file.size >= 5242880) {
          setError(t("CS_MAXIMUM_UPLOAD_SIZE_EXCEEDED"));
          if (!formState.errors[config.key]) setFormError(config.key, { type: doc?.code });
        } else {
          setLoader(true);
          try {
            setUploadedFile(null);
            const response = await Digit.UploadServices.Filestorage("PT", file, stateId);
            setLoader(false);
            if (response?.data?.files?.length > 0) {
              setUploadedFile(response?.data?.files[0]?.fileStoreId);
            } else {
              setError(t("CS_FILE_UPLOAD_ERROR"));
            }
          } catch (err) {
            setLoader(false);
            setError(t("CS_FILE_UPLOAD_ERROR"));
          }
        }
      }
    })();
  }, [file]);

  function routeTo(filestoreId) {
        getUrlForDocumentView(filestoreId)
      }

      const getUrlForDocumentView = async (filestoreId) => {
        if (filestoreId?.length === 0) return;
        try {
          const result = await Digit.UploadServices.Filefetch([filestoreId], stateId);
          if (result?.data) {
            const fileUrl = result.data[filestoreId];
            if (fileUrl) {
              window.open(fileUrl, "_blank");
            } else {
              setError(t("CS_FILE_FETCH_ERROR"));
            }
          }else {
            setError(t("CS_FILE_FETCH_ERROR"));
          }
        } catch (e) {
          setError(t("CS_FILE_FETCH_ERROR"));
        } 
      }



  return (
    <div>
      <LabelFieldPair>
        {/* {console.log("doc", doc)} */}
        <CardLabel className="card-label-smaller">
          {t(doc?.code)} {doc?.required && " *"}
        </CardLabel>
        <div className="field">
          <CustomUploadFile
            id={"tl-doc"}
            onUpload={selectfile}
            onDelete={() => {
              setUploadedFile(null);
            }}
            uploadedFile={uploadedFile}
            message={uploadedFile ? `1 ${t(`CS_ACTION_FILEUPLOADED`)}` : t(`CS_ACTION_NO_FILEUPLOADED`)}
            textStyles={{ width: "100%" }}
            accept="image/*,.pdf"
          // disabled={enabledActions?.[action].disableUpload || !selectedDocument?.code}
          />
          <p style={{ padding: "10px", fontSize: "14px" }}>{t("Only .pdf, .png, .jpeg, .jpg files are accepted with maximum size of 5 MB")}</p>
          {/* {uploadedFile ? <div>
            <SubmitBar onSubmit={() => {routeTo(uploadedFile)}} label={t("CS_VIEW_DOCUMENT")} />
          </div> : null } */}
        </div>
      </LabelFieldPair>
      {loader && <LoaderNew page={true} />}

    </div>
  );
}

export default DocumentDetails;
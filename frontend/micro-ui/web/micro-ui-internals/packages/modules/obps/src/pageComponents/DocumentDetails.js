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
} from "@mseva/digit-ui-react-components";
import Timeline from "../components/Timeline";
import DocumentsPreview from "../../../templates/ApplicationDetails/components/DocumentsPreview";
import { stringReplaceAll } from "../utils";
import cloneDeep from "lodash/cloneDeep";
import EXIF from "exif-js";

const DocumentDetails = ({ t, config, onSelect, userType, formData, setError: setFormError, clearErrors: clearFormErrors, formState }) => {
  const stateId = Digit.ULBService.getStateId();
  const [documents, setDocuments] = useState(formData?.documents?.documents ?? []);
  const [error, setError] = useState(null);
  const [enableSubmit, setEnableSubmit] = useState(true);
  const [checkRequiredFields, setCheckRequiredFields] = useState(false);
  const checkingFlow = formData?.uiFlow?.flow;

  const [isNextButtonDisabled, setIsNextButtonDisabled] = useState(false);

  const beforeUploadDocuments = cloneDeep(formData?.PrevStateDocuments || []);
  // const {data: bpaTaxDocuments, isLoading} = Digit.Hooks.obps.useBPATaxDocuments(stateId, formData, beforeUploadDocuments || []);
  const { data: bpaTaxDocuments, isLoading } = Digit.Hooks.obps.useBPATaxDocuments(
    stateId,
    {
      status: "INPROGRESS",
      RiskType: "LOW",
      ServiceType: "NEW_CONSTRUCTION",
      applicationType: "BUILDING_PLAN_SCRUTINY",
    },
    beforeUploadDocuments || []
  );

  console.log(formData, "FDFDFDF");
  console.log(bpaTaxDocuments, "bpabpa");

  useEffect(() => {
    console.log("documentInScrutiny", formData, documents);
  }, [documents]);

  
  const handleSubmit = () => {
    let document = formData.documents.documents;
    // let documentStep;

    console.log("documentInScrutiny", formData, documents);
    let RealignedDocument = [];
    bpaTaxDocuments &&
      bpaTaxDocuments.map((ob) => {
        documents &&
          documents
            // .filter((x) => ob.code === stringReplaceAll(x?.additionalDetails.category, "_", "."))
            .filter((x) => ob.code === stringReplaceAll(x?.documentType || x?.additionalDetails?.category || "", "_", "."))

            .map((doc) => {
              RealignedDocument.push(doc);
            });
      });
    // documentStep = [...document, {}];
    const documentStep = {
      documents: RealignedDocument.length > 0 ? RealignedDocument : documents,
    };
    onSelect(config.key, documentStep);
  };
  const onSkip = () => onSelect();
  function onAdd() {}
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

  return (
    <div>
      <Timeline currentStep={checkingFlow === "OCBPA" ? 3 : 3} flow={checkingFlow === "OCBPA" ? "OCBPA" : ""} />
      {!isLoading ? (
        <FormStep
          t={t}
          config={config}
          onSelect={handleSubmit}
          onSkip={onSkip}
          // isDisabled={window.location.href.includes("editApplication")||window.location.href.includes("sendbacktocitizen")?false:enableSubmit}
          // isDisabled={(window.location.href.includes("editApplication") || window.location.href.includes("sendbacktocitizen") ? false : enableSubmit) || isNextButtonDisabled}
          onAdd={onAdd}
        >
          {/* {bpaTaxDocuments?.map((document, index) => { */}
          {bpaTaxDocuments
            ?.filter((document) => document.code !== "ARCHITECT.UNDERTAKING" && document.code !== "CITIZEN.UNDERTAKING")
            .map((document, index) => {
              return (
                <div
                  style={{
                    background: "#FAFAFA",
                    border: "1px solid #D6D5D4",
                    padding: "8px",
                    borderRadius: "4px",
                    maxWidth: "600px",
                    minWidth: "280px",
                    marginBottom: "15px",
                    paddingTop: "15px",
                  }}
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
  const [geoLocation, setGeoLocation] = useState({ latitude: null, longitude: null });
const [showGeo, setShowGeo] = useState(false);


  const handleSelectDocument = (value) => setSelectedDocument(value);

async function selectfile(e) {
  const uploaded = e.target.files[0];
  setFile(uploaded);

  if (uploaded) {
    const geo = await extractGeoLocation(uploaded);
    setGeoLocation(geo);

    if (!geo.latitude || !geo.longitude) {
      setError("This image does not contain GPS location data");
      setUploadedFile(null);
    } else {
      // ⏳ Delay showing location (e.g., 2s)
      setShowGeo(false);
      setTimeout(() => setShowGeo(true), 2000);
    }
  }
}

  const { dropdownData } = doc;
  // const { dropdownFilter, enabledActions, filterCondition } = doc?.additionalDetails;
  var dropDownData = dropdownData;
  let hideInput = false;

  const [isHidden, setHidden] = useState(hideInput);

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
          try {
            setUploadedFile(null);
            const response = await Digit.UploadServices.Filestorage("PT", file, Digit.ULBService.getStateId());
            if (response?.data?.files?.length > 0) {
              setUploadedFile(response?.data?.files[0]?.fileStoreId);
            } else {
              setError(t("CS_FILE_UPLOAD_ERROR"));
            }
          } catch (err) {
            setError(t("CS_FILE_UPLOAD_ERROR"));
          }
        }
      }
    })();
  }, [file]);


// Converts GPS DMS to decimal
function convertToDecimal([degrees, minutes, seconds], ref) {
  const d = degrees?.numerator / degrees?.denominator || 0;
  const m = minutes?.numerator / minutes?.denominator || 0;
  const s = seconds?.numerator / seconds?.denominator || 0;

  let decimal = d + m / 60 + s / 3600;
  if (ref === "S" || ref === "W") {
    decimal = -decimal;
  }
  return decimal;
}

function extractGeoLocation(file) {
  return new Promise((resolve) => {
    EXIF.getData(file, function () {
      const lat = EXIF.getTag(this, "GPSLatitude");
      const lon = EXIF.getTag(this, "GPSLongitude");
      const latRef = EXIF.getTag(this, "GPSLatitudeRef");
      const lonRef = EXIF.getTag(this, "GPSLongitudeRef");

      if (lat && lon && latRef && lonRef) {
        const latitude = convertToDecimal(lat, latRef);
        const longitude = convertToDecimal(lon, lonRef);
        resolve({ latitude, longitude });
      } else {
        resolve({ latitude: null, longitude: null });
      }
    });
  });
}

  return (
    <div style={{ marginBottom: "24px" }}>
      <LabelFieldPair>
        {/* {console.log("doc", doc)} */}
        <CardLabel style={{width:"100%"}} className="card-label-smaller">
          {t(doc?.code)} {doc?.required && " *"}
        </CardLabel>
        <div className="field">
          <UploadFile
            id={"tl-doc"}
            onUpload={selectfile}
            onDelete={() => {
              setUploadedFile(null);
            }}
            message={uploadedFile ? `1 ${t(`CS_ACTION_FILEUPLOADED`)}` : t(`CS_ACTION_NO_FILEUPLOADED`)}
            textStyles={{ width: "100%" }}
            accept="image/*,.pdf"
            // disabled={enabledActions?.[action].disableUpload || !selectedDocument?.code}
          />
        </div>
        {doc.code === "SITEPHOTOGRAPH_ONE" && showGeo && geoLocation.latitude && geoLocation.longitude && (
          <div style={{ marginTop: "1rem", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "8px" }}>
            <strong>📍 Extracted Geo Location:</strong>
            <div>Latitude: {geoLocation.latitude}</div>
            <div>Longitude: {geoLocation.longitude}</div>
          </div>
        )}
      </LabelFieldPair>

      
    </div>
  );
}

export default DocumentDetails;

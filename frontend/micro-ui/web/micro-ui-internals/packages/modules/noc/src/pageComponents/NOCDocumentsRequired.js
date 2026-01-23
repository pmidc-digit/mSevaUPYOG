import React, { use, useEffect, useState, useMemo } from "react";
import {
  CardLabel,
  Dropdown,
  UploadFile,
  Toast,
  Loader,
  FormStep,
  LabelFieldPair,
  MultiUploadWrapper,
  CitizenInfoLabel,
  ViewsIcon,
  CardSectionSubText,
  CardSectionHeader,
  CardSubHeader
} from "@mseva/digit-ui-react-components";
import EXIF from "exif-js";
import { useDispatch, useSelector } from "react-redux";
import { pdfDownloadLink } from "../utils";
import { UPDATE_NOCNewApplication_FORM, UPDATE_NOCNewApplication_CoOrdinates} from "../redux/action/NOCNewApplicationActions";
import NOCCustomUploadFile from "./NOCCustomUploadFile";

const NOCDocumentsRequired = ({ t, config, onSelect, userType, formData, setError: setFormError, clearErrors: clearFormErrors, formState }) => {
  const tenantId = Digit.ULBService.getStateId();
  const [documents, setDocuments] = useState(formData?.documents?.documents);
  console.log("documents in childStep three", documents);
  const [error, setError] = useState(null);
  const [enableSubmit, setEnableSubmit] = useState(true);
  const [checkRequiredFields, setCheckRequiredFields] = useState(false);
  const [geocoordinates,setGeoCoordinates]= useState(null);

  const stateId = Digit.ULBService.getStateId();
  const dispatch = useDispatch();

  const { isLoading, data } = Digit.Hooks.pt.usePropertyMDMS(stateId, "NOC", ["Documents"]);
  console.log("data for documents here", data)
  console.log("formData here =====", formData);

  const coordinates = useSelector(function (state) {
      return state?.noc?.NOCNewApplicationFormReducer?.coordinates || {};
  });

  useEffect(()=>{
    if(Object.keys(coordinates).length>0){
      setGeoCoordinates(coordinates);
    }
  },[coordinates]);

  console.log("coordinates (from redux)", coordinates);

  console.log("geocoordinates", geocoordinates);

  const currentStepData= useSelector((state)=>state?.noc?.NOCNewApplicationFormReducer?.formData)|| {};

const isFirm = currentStepData?.applicationDetails?.owners?.some((owner) => {
  const code = owner?.ownerType?.code ?? owner?.ownerType;

  return String(code).toLowerCase() === "firm";
});
  const isVacant=currentStepData?.siteDetails?.buildingStatus?.code === "VACANT" || false;
  //console.log("isVacant", isVacant);

  let filteredDocuments = isVacant ? data?.NOC?.Documents?.filter((doc)=> doc.code !== "OWNER.BUILDINGDRAWING") : data?.NOC?.Documents;
  if (isFirm) {
    filteredDocuments = filteredDocuments?.map(doc => doc.code === "OWNER.AUTHORIZATIONLETTER" ? { ...doc, required: true } : doc);
  }
  console.log("filteredDocuments", filteredDocuments);

  useEffect(() => {
    setDocuments((prev) => {
      const arr = Array.isArray(prev) ? prev : [];
      const hasAuth = arr.some((d) => d.documentType === "OWNER.AUTHORIZATIONLETTER");
      if (isFirm && !hasAuth) {
        return [...arr, { documentType: "OWNER.AUTHORIZATIONLETTER", filestoreId: "", documentUid: "", documentAttachment: "" }];
      } else if (!isFirm && hasAuth) {
        return arr.filter((d) => d.documentType !== "OWNER.AUTHORIZATIONLETTER");
      }

      return arr;
    });
  }, [isFirm]);


  const handleSubmit = () => {
    let document = formData.documents;
    let documentStep;
    documentStep = { ...document, documents: documents };
    //console.log("documentStep", documentStep);
    onSelect(config.key, documentStep);
  };
  const onSkip = () => onSelect();
  function onAdd() {}

  useEffect(() => {
    let count = 0;
    data?.PetService?.Documents?.map((doc) => {
      doc.hasDropdown = true;

      let isRequired = false;

      console.log('documents in pet', documents)
      documents?.map((data) => {
        if (doc.required && data?.documentType.includes(doc.code)) isRequired = true;
      });
      if (!isRequired && doc.required) count = count + 1;
    });
    if ((count == "0" || count == 0) && documents?.length > 0) setEnableSubmit(false);
    else setEnableSubmit(true);
  }, [documents, checkRequiredFields]);

  //logic for buildingStatus
  useEffect(() => {
  const currentStatus = currentStepData?.siteDetails?.buildingStatus?.code;

  if (currentStatus === "VACANT") {
    // Remove OWNER.BUILDINGDRAWING from documents state so that it can be updated in redux accoordingly
    setDocuments((prevDocs) =>
      prevDocs?.filter((doc) => doc.documentType !== "OWNER.BUILDINGDRAWING")
    );
  }
}, [currentStepData?.siteDetails?.buildingStatus?.code]);

  //logic for preview image feature
  const documentObj = {
  value: {
    workflowDocs: documents?.map(doc => ({
      documentType: doc.documentType,
      filestoreId: doc.filestoreId,
      documentUid: doc.documentUid,
      documentAttachment: doc.documentAttachment
    }))
   }
 };

 const { isLoading: isDocLoading, data: docPreviewData } = Digit.Hooks.noc.useNOCDocumentSearch(documentObj);

 const documentLinks = documents?.map(doc => ({
  code: doc.documentType,
  link: pdfDownloadLink(docPreviewData?.pdfFiles, doc.filestoreId)
 }));


  return (
    <div>
      {/* <Timeline currentStep={4} /> */}
      {!isLoading ? (
        <FormStep t={t} config={config} onSelect={handleSubmit} onSkip={onSkip} isDisabled={enableSubmit} onAdd={onAdd}>
          {filteredDocuments?.map((document, index) => {
            return (
              <div className="bpa-doc-required-card">
              <PTRSelectDocument
                key={index}
                document={document}
                t={t}
                error={error}
                setError={setError}
                setDocuments={setDocuments}
                documents={documents}
                setCheckRequiredFields={setCheckRequiredFields}
                handleSubmit={handleSubmit}
                geocoordinates={geocoordinates}
                setGeoCoordinates={setGeoCoordinates}
                // coordinates={coordinates}
                dispatch={dispatch}
                previewLink={documentLinks?.find(link => link.code === document.code)?.link}
              />
              </div>
            );
          })}
          {error && <Toast label={error} isDleteBtn={true} onClose={() => setError(null)} error />}
        </FormStep>
      ) : (
        <Loader />
      )}
    </div>
  );
};

function PTRSelectDocument({ t, document: doc, setDocuments, setError, documents, action, formData, handleSubmit, id, geocoordinates, setGeoCoordinates,dispatch, previewLink }) {
  const filteredDocument = documents?.filter((item) => item?.documentType?.includes(doc?.code))[0];
  // console.log("filetetetetet",filteredDocument, documents, doc);

  const tenantId = Digit.ULBService.getCurrentTenantId();
  const [selectedDocument, setSelectedDocument] = useState(
    filteredDocument
      ? { ...filteredDocument, active: doc?.active === true, code: filteredDocument?.documentType }
      : doc?.dropdownData?.length === 1
      ? doc?.dropdownData[0]
      : {}
  );

  const [file, setFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(() => filteredDocument?.filestoreId || null);

  const handlePTRSelectDocument = (value) => setSelectedDocument(value);

  function selectfile(e) {
    //console.log("e here==>", e);
    //console.log("e.target.files[0] here==>", e.target.files[0]);

    const selectedFile = e.target.files[0];
    console.log("selectedFile here", selectedFile);

    if (!selectedFile) return;

    const fileType = selectedFile.type.toLowerCase();

    // For site photos, check for GPS data and prevent upload if missing
    if ((doc?.code === "OWNER.SITEPHOTOGRAPHONE" || doc?.code === "OWNER.SITEPHOTOGRAPHTWO") && (fileType.includes("image/jpeg") || fileType.includes("image/jpg") || fileType.includes("image/png"))) {
      const reader = new FileReader();
      reader.onload = function () {
        const img = new Image();
        img.onload = function () {
          EXIF.getData(img, function () {
            const lat = EXIF.getTag(this, "GPSLatitude");
            const lon = EXIF.getTag(this, "GPSLongitude");
            const latRef = EXIF.getTag(this, "GPSLatitudeRef") || "N";
            const lonRef = EXIF.getTag(this, "GPSLongitudeRef") || "E";

            let latitude = null;
            let longitude = null;

            if (lat && lon) {
              latitude = convertToDecimal(lat).toFixed(6);
              longitude = convertToDecimal(lon).toFixed(6);
              console.log("📍 Latitude:", latitude, "Longitude:", longitude);

              // Set file and update coordinates
              setFile(selectedFile);
              if (doc?.code === "OWNER.SITEPHOTOGRAPHONE") {
                dispatch(UPDATE_NOCNewApplication_CoOrdinates("Latitude1", latitude));
                dispatch(UPDATE_NOCNewApplication_CoOrdinates("Longitude1", longitude));
                setGeoCoordinates((prev) => ({
                  ...prev,
                  Latitude1: latitude,
                  Longitude1: longitude
                }));
              } else if (doc?.code === "OWNER.SITEPHOTOGRAPHTWO") {
                dispatch(UPDATE_NOCNewApplication_CoOrdinates("Latitude2", latitude));
                dispatch(UPDATE_NOCNewApplication_CoOrdinates("Longitude2", longitude));
                setGeoCoordinates((prev) => ({
                  ...prev,
                  Latitude2: latitude,
                  Longitude2: longitude
                }));
              }
            } else {
              alert("⚠️ No GPS data found in image. Please upload a photo with location details.");
              // Do not set file, preventing upload
              if (window.location.pathname.includes("edit")) {
                if (doc?.code === "OWNER.SITEPHOTOGRAPHONE") {
                  dispatch(UPDATE_NOCNewApplication_CoOrdinates("Latitude1", ""));
                  dispatch(UPDATE_NOCNewApplication_CoOrdinates("Longitude1", ""));
                } else if (doc?.code === "OWNER.SITEPHOTOGRAPHTWO") {
                  dispatch(UPDATE_NOCNewApplication_CoOrdinates("Latitude2", ""));
                  dispatch(UPDATE_NOCNewApplication_CoOrdinates("Longitude2", ""));
                }
              }
              return;
            }
          });
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(selectedFile);
    } else {
      // For other documents or non-image files, proceed as before
      setFile(selectedFile);
      if (selectedFile && selectedFile.type === "image/jpeg") {
        extractGeoLocation(selectedFile).then((location) => {
          console.log("Latitude:", location.latitude);
          console.log("Longitude:", location.longitude);

          if (doc?.code === "OWNER.SITEPHOTOGRAPHONE") {
            if (location.latitude !== null && location.longitude !== null) {
              dispatch(UPDATE_NOCNewApplication_CoOrdinates("Latitude1", location.latitude));
              dispatch(UPDATE_NOCNewApplication_CoOrdinates("Longitude1", location.longitude));
              setGeoCoordinates((prev) => ({
                ...prev,
                Latitude1: location.latitude,
                Longitude1: location.longitude
              }));
            } else {
              if (window.location.pathname.includes("edit")) {
                dispatch(UPDATE_NOCNewApplication_CoOrdinates("Latitude1", ""));
                dispatch(UPDATE_NOCNewApplication_CoOrdinates("Longitude1", ""));
              }
              alert("Please upload a photo with location details.");
            }
          }

          if (doc?.code === "OWNER.SITEPHOTOGRAPHTWO") {
            if (location.latitude !== null && location.longitude !== null) {
              dispatch(UPDATE_NOCNewApplication_CoOrdinates("Latitude2", location.latitude));
              dispatch(UPDATE_NOCNewApplication_CoOrdinates("Longitude2", location.longitude));
              setGeoCoordinates((prev) => ({
                ...prev,
                Latitude2: location.latitude,
                Longitude2: location.longitude
              }));
            } else {
              if (window.location.pathname.includes("edit")) {
                dispatch(UPDATE_NOCNewApplication_CoOrdinates("Latitude2", ""));
                dispatch(UPDATE_NOCNewApplication_CoOrdinates("Longitude2", ""));
              }
              alert("Please upload a photo with location details.");
            }
          }
        });
      }
    }
  }
  const { dropdownData } = doc;

  var dropDownData = dropdownData;

  const [isHidden, setHidden] = useState(false);
  const [getLoading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedDocument?.code) {
     // console.log("selectedDocument here", selectedDocument);
      setDocuments((prev) => {
        const filteredDocumentsByDocumentType = prev?.filter((item) => item?.documentType !== selectedDocument?.code);

        if (uploadedFile?.length === 0 || uploadedFile === null) {
          return filteredDocumentsByDocumentType;
        }

        const filteredDocumentsByFileStoreId = filteredDocumentsByDocumentType?.filter((item) => item?.fileStoreId !== uploadedFile) || [];
        return [
          ...filteredDocumentsByFileStoreId,
          {
            documentType: selectedDocument?.code,
            filestoreId: uploadedFile,
            documentUid: uploadedFile,
            documentAttachment: uploadedFile
          },
        ];
      });
    }
  }, [uploadedFile, selectedDocument]);

  useEffect(() => {
    if (documents?.length > 0) {
      console.log("documents here", documents);
      handleSubmit();
    }
  }, [documents]);

  useEffect(() => {
    if (action === "update") {
      const originalDoc = formData?.originalData?.documents?.filter((e) => e.documentType.includes(doc?.code))[0];
      const docType = dropDownData
        .filter((e) => e.code === originalDoc?.documentType)
        .map((e) => ({ ...e, i18nKey: e?.code?.replaceAll(".", "_") }))[0];
      if (!docType) setHidden(true);
      else {
        setSelectedDocument(docType);
        setUploadedFile(originalDoc?.fileStoreId);
      }
    } else if (action === "create") {
    }
  }, []);

  useEffect(() => {
    if (!doc?.hasDropdown) {
      setSelectedDocument({ code: doc?.code, i18nKey: doc?.code?.replaceAll(".", "_") });
      // setHidden(true);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setError(null);
      if (file) {
        setLoading(true);
        if (file.size >= 5242880) {
          setLoading(false);
          setError(t("CS_MAXIMUM_UPLOAD_SIZE_EXCEEDED"));
          // if (!formState.errors[config.key]) setFormError(config.key, { type: doc?.code });
        } else {
          try {
            setUploadedFile(null);
            const response = await Digit.UploadServices.Filestorage("NOC", file, Digit.ULBService.getStateId());
            setLoading(false);
            if (response?.data?.files?.length > 0) {
              setUploadedFile(response?.data?.files[0]?.fileStoreId);
            } else {
              setError(t("CS_FILE_UPLOAD_ERROR"));
            }
          } catch (err) {
            setLoading(false);
            setError(t("CS_FILE_UPLOAD_ERROR"));
          }
        }
      }
    })();
  }, [file]);

  useEffect(() => {
    if (isHidden) setUploadedFile(null);
  }, [isHidden]);

  function convertToDecimal(coordinate) {
    const degrees = coordinate[0];
    const minutes = coordinate[1];
    const seconds = coordinate[2];
    return degrees + minutes / 60 + seconds / 3600;
  }

  function extractGeoLocation(file) {
      console.log("file", file);
  
      return new Promise((resolve) => {
        try {
          // if (file && file.type === "image/jpeg" && file.size > 1000) {
          EXIF.getData(file, function () {
           // console.log("comign here as well");
  
            const lat = EXIF.getTag(this, "GPSLatitude");
            const lon = EXIF.getTag(this, "GPSLongitude");
  
            console.log("lat====", lat);
            if (lat && lon) {
              // Convert GPS coordinates to decimal format
              const latDecimal = convertToDecimal(lat).toFixed(6);
              const lonDecimal = convertToDecimal(lon).toFixed(6);
              resolve({ latitude: latDecimal, longitude: lonDecimal });
            } else {
              resolve({ latitude: null, longitude: null });
              if (doc?.code === "OWNER.SITEPHOTOGRAPHONE") {
                {
                  alert("Please Upload a Photo with Location Details");
                }
              } else {
                null;
              }
            }
          });
          // }
        } catch (error) {
          console.log("EXIF parsing failed:", error);
          resolve({ latitude: null, longitude: null });
        }
      });
    }

  return (
      <div className="bpa-doc-required-wrapper">
      {getLoading && <Loader />}

        <LabelFieldPair>
          <CardLabel className="bpa-doc-required-label">
            {t(doc?.code.replaceAll(".", "_"))} {doc?.required && <span className="requiredField">*</span>} 
          </CardLabel>

      <div className="bpa-doc-required-field">
        {(doc?.code === "OWNER.OWNERPHOTO" || doc?.code === "OWNER.SITEPHOTOGRAPHONE" || doc?.code === "OWNER.SITEPHOTOGRAPHTWO") ? (
         <NOCCustomUploadFile
            id={"noc-doc"}
            onUpload={selectfile}
            onDelete={() => {
              setUploadedFile(null);
            }}
            uploadedFile={uploadedFile}
            message={uploadedFile ? `1 ${t(`CS_ACTION_FILEUPLOADED`)}` : t(`CS_ACTION_NO_FILEUPLOADED`)}
            textStyles={{ width: "100%" }}
            accept=".jpg, .jpeg, .png"
          />
        ):(
          <NOCCustomUploadFile
            id={"noc-doc"}
            onUpload={selectfile}
            onDelete={() => {
              setUploadedFile(null);
            }}
            uploadedFile={uploadedFile}
            message={uploadedFile ? `1 ${t(`CS_ACTION_FILEUPLOADED`)}` : t(`CS_ACTION_NO_FILEUPLOADED`)}
            textStyles={{ width: "100%" }}
            accept=".pdf, .jpeg, .jpg, .png"
          />
        )}
      </div>
     
      {doc?.code === "OWNER.OWNERPHOTO" || doc?.code === "OWNER.SITEPHOTOGRAPHONE" || doc?.code === "OWNER.SITEPHOTOGRAPHTWO"  ? (<p style={{ padding: "10px", fontSize: "14px" }}>{t("Only .png, .jpeg, .jpg files are accepted with maximum size of 5 MB")}</p>) : (<p style={{ padding: "10px", fontSize: "14px" }}>{t("Only .pdf, .png, .jpeg, .jpg files are accepted with maximum size of 5 MB")}</p>)}
      {doc?.code === "OWNER.SITEPHOTOGRAPHONE" &&  (geocoordinates?.Latitude1 && geocoordinates?.Longitude1) &&  <p className="bpa-doc-required-coordinates">Latitude: {geocoordinates.Latitude1} & Longitude: {geocoordinates.Longitude1} </p>}
      {doc?.code === "OWNER.SITEPHOTOGRAPHTWO" &&  (geocoordinates?.Latitude2 && geocoordinates?.Longitude2) &&  <p className="bpa-doc-required-coordinates">Latitude: {geocoordinates.Latitude2} & Longitude: {geocoordinates.Longitude2}</p>}
     

      </LabelFieldPair>
    </div>
  );
}

export default NOCDocumentsRequired;

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
  //console.log("data for documents here", data)
  //console.log("formData here =====", formData);

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
      documents?.map((data) => {
        if (doc.required && data?.documentType.includes(doc.code)) isRequired = true;
      });
      if (!isRequired && doc.required) count = count + 1;
    });
    if ((count == "0" || count == 0) && documents?.length > 0) setEnableSubmit(false);
    else setEnableSubmit(true);
  }, [documents, checkRequiredFields]);

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
          {data?.NOC?.Documents?.map((document, index) => {
            return (
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
    setFile(selectedFile);
    // setFile(e.target.files[0]);
    console.log("selectedFile here", selectedFile);

   if (selectedFile && selectedFile.type === "image/jpeg") {
    extractGeoLocation(selectedFile).then((location) => {
      console.log("Latitude:", location.latitude);
      console.log("Longitude:", location.longitude);

      if (doc?.code === "OWNER.SITEPHOTOGRAPHONE") {
        if (location.latitude !== null && location.longitude !== null) {
          dispatch(UPDATE_NOCNewApplication_CoOrdinates("Latitude1",location.latitude));
          dispatch(UPDATE_NOCNewApplication_CoOrdinates("Longitude1",location.longitude));
          setGeoCoordinates((prev)=>{
          return {
            ...prev,
            Latitude1:location.latitude,
            Longitude1:location.longitude
          }
          })
        } else {
          if(window.location.pathname.includes("edit")){
          dispatch(UPDATE_NOCNewApplication_CoOrdinates("Latitude1",""));
          dispatch(UPDATE_NOCNewApplication_CoOrdinates("Longitude1",""));
          }

          alert("Please upload a photo with location details.");
        }
      }

      if (doc?.code === "OWNER.SITEPHOTOGRAPHTWO") {
        if (location.latitude !== null && location.longitude !== null) {
          
          dispatch(UPDATE_NOCNewApplication_CoOrdinates("Latitude2",location.latitude));
          dispatch(UPDATE_NOCNewApplication_CoOrdinates("Longitude2",location.longitude));
          setGeoCoordinates((prev)=>{
          return {
            ...prev,
            Latitude2:location.latitude,
            Longitude2:location.longitude
          }
          })
        } else {
          if(window.location.pathname.includes("edit")){
          dispatch(UPDATE_NOCNewApplication_CoOrdinates("Latitude2",""));
          dispatch(UPDATE_NOCNewApplication_CoOrdinates("Longitude2",""));
          }
          
          alert("Please upload a photo with location details.");
        }
      }
    });
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
      //console.log("file", file);
  
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
    <div style={{ marginBottom: "24px" }}>
      {getLoading && <Loader />}
      {doc?.hasDropdown ? (
        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{t(doc?.code.replaceAll(".", "_"))}</CardLabel>
          <Dropdown
            className="form-field"
            selected={selectedDocument}
            style={{ width: "100%" }}
            option={dropDownData.map((e) => ({ ...e, i18nKey: e.code?.replaceAll(".", "_") }))}
            select={handlePTRSelectDocument}
            optionKey="i18nKey"
            t={t}
          />
        </LabelFieldPair>
      ) : null}
      {!doc?.hasDropdown ? (
        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{t(doc?.code.replaceAll(".", "_"))} 
            <span>{doc?.required ? " *" : ""}</span>
          </CardLabel>
        </LabelFieldPair>
      ) : null}
      <LabelFieldPair>

        {(doc?.code === "OWNER.OWNERPHOTO" || doc?.code === "OWNER.SITEPHOTOGRAPHONE" || doc?.code === "OWNER.SITEPHOTOGRAPHTWO") ? (
          <UploadFile
            onUpload={selectfile}
            onDelete={() => {
              setUploadedFile(null);
            }}
            id={id}
            message={uploadedFile ? `1 ${t(`CS_ACTION_FILEUPLOADED`)}` : t(`CS_ACTION_NO_FILEUPLOADED`)}
            textStyles={{ width: "100%" }}
            inputStyles={{ width: "280px" }}
            accept=".jpg, .jpeg, .png"
            buttonType="button"
            error={!uploadedFile}
          />
        ) : (
          <UploadFile
            onUpload={selectfile}
            onDelete={() => {
              setUploadedFile(null);
            }}
            id={id}
            message={uploadedFile ? `1 ${t(`CS_ACTION_FILEUPLOADED`)}` : t(`CS_ACTION_NO_FILEUPLOADED`)}
            textStyles={{ width: "100%" }}
            inputStyles={{ width: "280px" }}
            accept=".pdf, .jpeg, .jpg, .png" //  to accept document of all kind
            buttonType="button"
            error={!uploadedFile}
          />
        )}

      {previewLink && (
        <div
            style={{ cursor: "pointer", padding:"10px", marginLeft:"25px"}}
            onClick={(e) => {
             e.preventDefault(); // Prevent any default behavior
             window.open(previewLink, "_blank"); // Open in new tab
            }}
        >
         <ViewsIcon/>
        </div> 
       )}
      
     
       {doc?.code === "OWNER.SITEPHOTOGRAPHONE" &&
        (geocoordinates?.Latitude1 && geocoordinates?.Longitude1) &&
            <CardLabel>
              <div style={{paddingLeft:"30px"}}>
               <p>Latitude: {geocoordinates.Latitude1}</p>
               <p>Longitude: {geocoordinates.Longitude1}</p>
               </div>
            </CardLabel>
        }

       {doc?.code === "OWNER.SITEPHOTOGRAPHTWO"  &&
        (geocoordinates?.Latitude2 && geocoordinates?.Longitude2 ) &&
           <CardLabel>
              <div style={{paddingLeft:"30px"}}>
               <p>Latitude: {geocoordinates.Latitude2}</p>
               <p>Longitude: {geocoordinates.Longitude2}</p>
               </div>
           </CardLabel>  
        }
     

      </LabelFieldPair>
    </div>
  );
}

export default NOCDocumentsRequired;

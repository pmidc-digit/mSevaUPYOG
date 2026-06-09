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
  ViewsIcon
} from "@mseva/digit-ui-react-components";
import EXIF from "../utils/exif-compat";
import { useDispatch, useSelector } from "react-redux";
import { pdfDownloadLink } from "../utils";
import { UPDATE_OBPS_FORM, UPDATE_OBPS_CoOrdinates } from "../redux/actions/OBPSActions";
import CustomUploadFile from "../components/CustomUploadFile";

const CLUDocumentsRequired = ({ t, config, onSelect, userType, formData, setError: setFormError, clearErrors: clearFormErrors, formState }) => {
  const tenantId = Digit.ULBService.getStateId();
  const [documents, setDocuments] = useState(formData?.documents?.documents);
  const [error, setError] = useState(null);
  const [enableSubmit, setEnableSubmit] = useState(true);
  const [checkRequiredFields, setCheckRequiredFields] = useState(false);
  const [geocoordinates, setGeoCoordinates] = useState(null);

  const stateId = Digit.ULBService.getStateId();
  const dispatch = useDispatch();

  const { isLoading, data } = Digit.Hooks.pt.usePropertyMDMS(stateId, "CLU", ["Documents"]);

  const coordinates = useSelector(function (state) {
    return state?.obps?.OBPSFormReducer?.coordinates || {};
  });

  useEffect(() => {
    if (Object.keys(coordinates).length > 0) {
      setGeoCoordinates(coordinates);
    }
  }, [coordinates]);



  const currentStepData = useSelector((state) => state?.obps?.OBPSFormReducer?.formData) || {};

  const handleSubmit = () => {
    let document = formData.documents;
    let documentStep;
    documentStep = { ...document, documents: documents };
    onSelect(config.key, documentStep);
  };
  const onSkip = () => onSelect();
  function onAdd() {}

  const isCluAppliedCategoryIndustry = currentStepData?.siteDetails?.appliedCluCategory?.code === "INDUSTRY_GODOWN_WAREHOUSING_COLD_STORE" || false;


  const owners = currentStepData?.applicationDetails?.owners || [];
  const isFirm = owners.some((owner) => {
    const typeCode = owner?.ownerType?.code || owner?.ownerType;
    return typeCode?.toString()?.toUpperCase() === "FIRM";
  });

  const mdmsDocuments = useMemo(() => {
    let docs = data?.CLU?.Documents;
    
    if (!Array.isArray(docs) || docs.length === 0) return [];

    return docs.map((item) => {
      if (item?.code === "OWNER.INDUSTRYCATEGORYSUPPORTINGDOCUMENT") {
        return { ...item, required: isCluAppliedCategoryIndustry ? true : false };
      }
      if (item?.code === "OWNER.FIRMDOCUMENT") {
        const updatedItem = { ...item, required: isFirm ? true : false };
        return updatedItem;
      }
      return item;
    }).sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [isCluAppliedCategoryIndustry, isFirm, data?.CLU?.Documents]);


  //logic for preview image feature
  const documentObj = {
    value: {
      workflowDocs: documents?.map((doc) => ({
        documentType: doc.documentType,
        filestoreId: doc.filestoreId,
        documentUid: doc.documentUid,
        documentAttachment: doc.documentAttachment,
      })),
    },
  };

  const { isLoading: isDocLoading, data: docPreviewData } = Digit.Hooks.noc.useNOCDocumentSearch(documentObj);

  const documentLinks = documents?.map((doc) => ({
    code: doc.documentType,
    link: pdfDownloadLink(docPreviewData?.pdfFiles, doc.filestoreId),
  }));

  return (
    <div>
      {/* <Timeline currentStep={4} /> */}
      {!isLoading ? (
        <FormStep t={t} config={config} onSelect={handleSubmit} onSkip={onSkip} isDisabled={enableSubmit} onAdd={onAdd}>
          {mdmsDocuments?.map((document, index) => {
            return (
              <div className="bpa-doc-required-card">
              <CLUSelectDocument
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
                dispatch={dispatch}
                previewLink={documentLinks?.find((link) => link.code === document.code)?.link}
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

function CLUSelectDocument({
  t,
  document: doc,
  setDocuments,
  setError,
  documents,
  action,
  formData,
  handleSubmit,
  id,
  geocoordinates,
  setGeoCoordinates,
  dispatch,
  previewLink,
}) {
  const filteredDocument = documents?.filter((item) => item?.documentType?.includes(doc?.code))[0];

  const tenantId = Digit.ULBService.getCurrentTenantId();
  const [selectedDocument, setSelectedDocument] = useState(
    filteredDocument
      ? { ...filteredDocument, active: doc?.active === true, code: filteredDocument?.documentType, order: doc?.order }
      : doc?.dropdownData?.length === 1
      ? doc?.dropdownData[0]
      : {}
  );

  const [file, setFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(() => filteredDocument?.documentAttachment || null);

  // const handlePTRSelectDocument = (value) => setSelectedDocument(value);

  function selectfile(e) {

    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    // setFile(e.target.files[0]);

    const fileType = selectedFile?.type?.toLowerCase();

    // Accept jpeg, jpg and png images for EXIF extraction
    if (selectedFile && (fileType?.includes("image/jpeg") || fileType?.includes("image/jpg") || fileType?.includes("image/png"))) {
      extractGeoLocation(selectedFile).then((location) => {

        if (doc?.code === "OWNER.SITEPHOTOGRAPHONE") {
          if (location.latitude !== null && location.longitude !== null) {
            dispatch(UPDATE_OBPS_CoOrdinates("Latitude1", location.latitude));
            dispatch(UPDATE_OBPS_CoOrdinates("Longitude1", location.longitude));
            setGeoCoordinates((prev) => {
              return {
                ...prev,
                Latitude1: location.latitude,
                Longitude1: location.longitude,
              };
            });
          } else {
            if (window.location.pathname.includes("edit")) {
              dispatch(UPDATE_OBPS_CoOrdinates("Latitude1", ""));
              dispatch(UPDATE_OBPS_CoOrdinates("Longitude1", ""));
            }

            alert("Please upload a photo with location details.");
          }
        }

        if (doc?.code === "OWNER.SITEPHOTOGRAPHTWO") {
          if (location.latitude !== null && location.longitude !== null) {
            dispatch(UPDATE_OBPS_CoOrdinates("Latitude2", location.latitude));
            dispatch(UPDATE_OBPS_CoOrdinates("Longitude2", location.longitude));
            setGeoCoordinates((prev) => {
              return {
                ...prev,
                Latitude2: location.latitude,
                Longitude2: location.longitude,
              };
            });
          } else {
            if (window.location.pathname.includes("edit")) {
              dispatch(UPDATE_OBPS_CoOrdinates("Latitude2", ""));
              dispatch(UPDATE_OBPS_CoOrdinates("Longitude2", ""));
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
    // if (selectedDocument?.code) {
      if(uploadedFile){
      setDocuments((prev) => {
        const filteredDocumentsByDocumentType = prev?.filter((item) => item?.documentType !== doc?.code);
        const selectedDoc = documents?.find((item) => item?.documentType === doc?.code);

        if (uploadedFile === null) {
          return filteredDocumentsByDocumentType;
        }

        const filteredDocumentsByFileStoreId = filteredDocumentsByDocumentType?.filter((item) => item?.fileStoreId !== uploadedFile) || [];
        return [
          ...filteredDocumentsByFileStoreId,
          {
            ...selectedDoc,
            documentType: doc?.code,
            filestoreId: uploadedFile,
            documentUid: uploadedFile,
            documentAttachment: uploadedFile,
            order: doc?.order,
          },
        ];
      });
      }else if(uploadedFile === ""){
        const selectedDoc = documents?.find((item) => item?.documentType === doc?.code);
        if(!selectedDoc?.cluId){
          setDocuments((prev) => prev.filter((item) => item?.documentType !== doc?.code));
        }else{
          setDocuments((prev) => {
        const filteredDocumentsByDocumentType = prev?.filter((item) => item?.documentType !== doc?.code);

        const filteredDocumentsByFileStoreId = filteredDocumentsByDocumentType?.filter((item) => item?.fileStoreId !== uploadedFile) || [];
        return [
          ...filteredDocumentsByFileStoreId,
          {
            ...selectedDoc,
            documentType: doc?.code,
            filestoreId: "",
            documentUid: filteredDocument?.documentUid || "",
            documentAttachment: "",
            order: doc?.order,
          },
        ];
      });
        }
      }
    // }
  }, [uploadedFile]);

  useEffect(() => {
    if (documents?.length > 0) {
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
        // setSelectedDocument(docType);
        setUploadedFile(originalDoc?.fileStoreId);
      }
    } else if (action === "create") {
    }
  }, []);

  useEffect(() => {
    if (!doc?.hasDropdown) {
      // setSelectedDocument({ code: doc?.code, i18nKey: doc?.code?.replaceAll(".", "_") });
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
            const response = await Digit.UploadServices.Filestorage("CLU", file, Digit.ULBService.getStateId());
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
    // Accept either a DMS array (with numerator/denominator objects) or a direct numeric coordinate
    // If `ref` is provided, caller should apply sign separately. This helper will only convert magnitude.
    if (!coordinate) return 0;

    const toNumber = (part) => {
      if (part == null) return 0;
      if (typeof part === "object" && part !== null && "numerator" in part && "denominator" in part) {
        return part.numerator / (part.denominator || 1);
      }
      if (typeof part === "number") return part;
      return Number(part) || 0;
    };

    if (!Array.isArray(coordinate)) {
      // already a decimal number
      return Number(coordinate) || 0;
    }

    const degrees = toNumber(coordinate[0]);
    const minutes = toNumber(coordinate[1]);
    const seconds = toNumber(coordinate[2]);

    const decimal = degrees + minutes / 60 + seconds / 3600;
    return decimal;
  }

  function extractGeoLocation(file) {
    return new Promise((resolve) => {
      try {
        EXIF.getData(file, function () {
          const lat = EXIF.getTag(this, "GPSLatitude");
          const lon = EXIF.getTag(this, "GPSLongitude");
          const latRef = EXIF.getTag(this, "GPSLatitudeRef");
          const lonRef = EXIF.getTag(this, "GPSLongitudeRef");

          console.log("Extracted EXIF GPS tags:", { lat, lon, latRef, lonRef });

          if (lat && lon && latRef && lonRef) {
            // Convert GPS coordinates to decimal format and apply sign from refs
            const latDecimal = convertToDecimal(lat);
            const lonDecimal = convertToDecimal(lon);
            const latitude = latRef === "S" ? -Math.abs(latDecimal) : Math.abs(latDecimal);
            const longitude = lonRef === "W" ? -Math.abs(lonDecimal) : Math.abs(lonDecimal);

            resolve({ latitude: latitude.toFixed(6), longitude: longitude.toFixed(6) });
          } else {
            console.warn("No GPS EXIF tags (lat/lon/refs) found on file");
            resolve({ latitude: null, longitude: null });
          }
        });
      } catch (error) {
        console.error("EXIF parsing failed:", error);
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
        {doc?.code === "OWNER.OWNERPHOTO" || doc?.code === "OWNER.SITEPHOTOGRAPHONE" || doc?.code === "OWNER.SITEPHOTOGRAPHTWO" ? (
          <CustomUploadFile
            id={"clu-doc"}
            onUpload={selectfile}
            onDelete={() => {
              setUploadedFile("");
            }}
            uploadedFile={uploadedFile}
            message={uploadedFile ? `1 ${t(`CS_ACTION_FILEUPLOADED`)}` : t(`CS_ACTION_NO_FILEUPLOADED`)}
            textStyles={{ width: "100%" }}
            accept=".jpg, .jpeg, .png"
          />
        ):(
          <CustomUploadFile
            id={"clu-doc"}
            onUpload={selectfile}
            onDelete={() => {
              setUploadedFile("");
            }}
            uploadedFile={uploadedFile}
            message={uploadedFile ? `1 ${t(`CS_ACTION_FILEUPLOADED`)}` : t(`CS_ACTION_NO_FILEUPLOADED`)}
            textStyles={{ width: "100%" }}
            accept=".pdf, .jpeg, .jpg, .png"
            required={doc?.required}
            isRemovable={!doc?.required}
          />
        )}
            {doc?.code === "OWNER.OWNERPHOTO" || doc?.code === "OWNER.SITEPHOTOGRAPHONE" || doc?.code === "OWNER.SITEPHOTOGRAPHTWO"  ? (<p style={{ padding: "10px", fontSize: "14px" }}>{t("Only .png, .jpeg, .jpg files are accepted with maximum size of 5 MB")}</p>) : (<p style={{ padding: "10px", fontSize: "14px" }}>{t("Only .pdf, .png, .jpeg, .jpg files are accepted with maximum size of 5 MB")}</p>)}
            {doc?.code === "OWNER.SITEPHOTOGRAPHONE" &&  (geocoordinates?.Latitude1 && geocoordinates?.Longitude1) &&  <p className="bpa-doc-required-coordinates">Latitude: {geocoordinates.Latitude1} & Longitude: {geocoordinates.Longitude1} </p>}
            {doc?.code === "OWNER.SITEPHOTOGRAPHTWO" &&  (geocoordinates?.Latitude2 && geocoordinates?.Longitude2) &&  <p className="bpa-doc-required-coordinates">Latitude: {geocoordinates.Latitude2} & Longitude: {geocoordinates.Longitude2}</p>}
          </div>

      </LabelFieldPair>
    </div>
  );
}

export default CLUDocumentsRequired;

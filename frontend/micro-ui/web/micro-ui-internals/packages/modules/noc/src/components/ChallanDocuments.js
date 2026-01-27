import React, { use, useEffect, useState } from "react";
import { CardLabel, Dropdown, UploadFile, Toast, FormStep, LabelFieldPair, SubmitBar } from "@mseva/digit-ui-react-components";
import { Loader } from "./Loader";
import EXIF from "exif-js";
import ImageCaptureModal from "../pageComponents/ImageCaptureModal";

const maxImageSize = process.env.IMAGE_MAX_UPLOAD_SIZE || 11534336;
const imageSize = process.env.IMAGE_UPLOAD_SIZE || 2097152;

const ChallanDocuments = ({
  t,
  config,
  onSelect,
  userType,
  formData,
  setError: setFormError,
  clearErrors: clearFormErrors,
  formState,
  data,
  isLoading,
  error,
  setError,
  customOpen
}) => {
  const [documents, setDocuments] = useState(formData?.documents?.documents || []);
  // const [error, setError] = useState(null);
  const [enableSubmit, setEnableSubmit] = useState(true);
  const [checkRequiredFields, setCheckRequiredFields] = useState(false);
  const tenantId = window.location.href.includes("employee") ? Digit.ULBService.getCurrentPermanentCity() : localStorage.getItem("CITIZEN.CITY");

  const handleSubmit = () => {
    let document = formData.documents;
    let documentStep;
    documentStep = { ...document, documents: documents };
    onSelect(config.key, documentStep);
  };
  const onSkip = () => onSelect();
  function onAdd() {}

  useEffect(() => {
    let count = 0;
    data?.FieldInspection?.Documents?.map((doc) => {
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

  useEffect(() => {
    console.log("documents check again", documents);
  }, [documents]);

  return (
    <div>
      {/* <Timeline currentStep={4} /> */}
      {!isLoading ? (
        <FormStep t={t} config={config} onSelect={handleSubmit} {...(data?.FieldInspection ? {} : { onSkip })} isDisabled={enableSubmit} onAdd={onAdd}>
          {data?.FieldInspection?.Documents?.map((document, index) => {
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
                customOpen={customOpen}
              />
            );
          })}
          {error && <Toast isDleteBtn={true} label={error} onClose={() => setError(null)} error />}
        </FormStep>
      ) : (
        <Loader />
      )}
    </div>
  );
};

function PTRSelectDocument({ t, document: doc, setDocuments, setError, documents, action, formData, handleSubmit, id, customOpen }) {
  const filteredDocument = documents?.filter((item) => item?.documentType?.includes(doc?.code))[0];

  const tenantId = Digit.ULBService.getCurrentTenantId();
  const mobile = window?.Digit?.Utils?.browser?.isMobile();
  const [showCameraModal, setShowCameraModal] = useState(false);
  const onClose = () => {
    setShowCameraModal(false);
  }
  function routeTo(filestoreId) {
    if (customOpen) {
      customOpen(filestoreId);
    } else {
      getUrlForDocumentView(filestoreId);
    }
  }

  const getUrlForDocumentView = async (filestoreId) => {
    if (filestoreId?.length === 0) return;
    setLoading(true);
    try {
      const result = await Digit.UploadServices.Filefetch([filestoreId], Digit.ULBService.getStateId());
      setLoading(false);
      if (result?.data) {
        const fileUrl = result.data[filestoreId];
        if (fileUrl) {
          window.open(fileUrl, "_blank");
        } else {
          if (setError) {
            setError(t("CS_FILE_FETCH_ERROR"));
          } else {
            console.error(t("CS_FILE_FETCH_ERROR"));
          }
        }
      } else {
        if (setError) {
          setError(t("CS_FILE_FETCH_ERROR"));
        } else {
          console.error(t("CS_FILE_FETCH_ERROR"));
        }
      }
    } catch (e) {
      setLoading(false);
      if (setError) {
        setError(t("CS_FILE_FETCH_ERROR"));
      } else {
        console.error(t("CS_FILE_FETCH_ERROR"));
      }
    }
  };
  // const [selectedDocument, setSelectedDocument] = useState(
  //   filteredDocument
  //     ? { ...filteredDocument, active: doc?.active === true, code: filteredDocument?.documentType }
  //     : doc?.dropdownData?.length === 1
  //     ? doc?.dropdownData[0]
  //     : {}
  // );
  const [selectedDocument, setSelectedDocument] = useState(() => {
    if (filteredDocument) {
      const match = doc?.dropdownData?.find((e) => e.code === filteredDocument.documentType);
      return match ? { ...match, i18nKey: match.code?.replaceAll(".", "_") } : {};
    }
    if (doc?.dropdownData?.length === 1) {
      const onlyOption = doc.dropdownData[0];
      return { ...onlyOption, i18nKey: onlyOption.code?.replaceAll(".", "_") };
    }
    return {};
  });

  const [file, setFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(() => filteredDocument?.filestoreId || null);

  const handlePTRSelectDocument = (value) => setSelectedDocument(value);

  function selectfile(e) {
    const file = e.target.files[0];
    if (!file) return;

    const fileType = file.type.toLowerCase();

    // ✅ Case 1: Handle image files with EXIF
    if (fileType.includes("image/jpeg") || fileType.includes("image/jpg") || fileType.includes("image/png")) {
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
              latitude = convertDMSToDD(lat, latRef);
              longitude = convertDMSToDD(lon, lonRef);
              console.log("📍 Latitude:", latitude, "Longitude:", longitude);
            } else {
              alert("⚠️ No GPS data found in image.");
              return;
            }

            // ✅ Save file + coordinates
            setFile(file);
            updateDocument(selectedDocument, { latitude, longitude });
          });
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
    // ✅ Case 2: Handle PDFs or other file types
    else {
      console.log("📄 Non-image file uploaded, skipping EXIF read");
      setFile(file);
      updateDocument(selectedDocument, {}); // no lat/long
    }
  }

  // helper function to avoid repeating code
  function updateDocument(selectedDocument, extraFields = {}) {
    setDocuments((prev = []) => {
      const updated = prev.map((item) => (item?.documentType === selectedDocument?.code ? { ...item, ...extraFields } : item));

      if (!updated.some((i) => i?.documentType === selectedDocument?.code)) {
        updated.push({
          documentType: selectedDocument?.code,
          filestoreId: null,
          documentUid: null,
          ...extraFields,
        });
      }

      return updated;
    });
  }

  function convertDMSToDD(dms, ref) {
    const [degrees, minutes, seconds] = dms;
    let dd = degrees + minutes / 60 + seconds / 3600;
    if (ref === "S" || ref === "W") dd *= -1;
    return dd;
  }

  const { dropdownData } = doc;

  var dropDownData = dropdownData;

  const [isHidden, setHidden] = useState(false);
  const [getLoading, setLoading] = useState(false);

  // useEffect(() => {
  //   if (selectedDocument?.code) {
  //     setDocuments((prev) => {
  //       const filteredDocumentsByDocumentType = prev?.filter((item) => item?.documentType !== selectedDocument?.code);

  //       if (uploadedFile?.length === 0 || uploadedFile === null) {
  //         return filteredDocumentsByDocumentType;
  //       }

  //       const filteredDocumentsByFileStoreId = filteredDocumentsByDocumentType?.filter((item) => item?.fileStoreId !== uploadedFile) || [];
  //       return [
  //         ...filteredDocumentsByFileStoreId,
  //         {
  //           documentType: selectedDocument?.code,
  //           filestoreId: uploadedFile,
  //           documentUid: uploadedFile,
  //         },
  //       ];
  //     });
  //   }
  // }, [uploadedFile, selectedDocument]);

  useEffect(() => {
    if (selectedDocument?.code) {
      setDocuments((prev) => {
        return prev.map((item) => {
          if (item?.documentType === selectedDocument?.code) {
            // ✅ Preserve existing fields (like latitude, longitude)
            return {
              ...item,
              filestoreId: uploadedFile,
              documentUid: uploadedFile,
            };
          }
          return item;
        });
      });
    }
  }, [uploadedFile, selectedDocument]);

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
        let newFile;
        setLoading(true);
        if (file.size > imageSize) {
          newFile = await Digit.Utils.compressImage(file);
        } else {
          newFile = file;
        }
        try {
          setUploadedFile(null);
          const response = await Digit.UploadServices.Filestorage("PTR", newFile, Digit.ULBService.getStateId());
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
    })();
  }, [file]);

  useEffect(() => {
    if (isHidden) setUploadedFile(null);
  }, [isHidden]);

  const onCapture = (file, meta) => {
    console.log("Captured file:", file, meta);
    setFile(file);
    updateDocument(selectedDocument, { latitude: Number(meta.latitude), longitude: Number(meta.longitude), timestamp: meta.timestamp });
    setShowCameraModal(false);
  };

  return (
    <div style={{ marginBottom: "24px" }}>
      {/* {doc?.hasDropdown ? (
        <LabelFieldPair style={{ display: "inline" }}>
          <CardLabel style={{ width: "auto" }}>
            {t(doc?.code)} {doc?.required && " *"}
          </CardLabel>
          <Dropdown
            className="form-field"
            selected={selectedDocument}
            style={{ width: "100%" }}
            option={doc?.dropdownData.map((e) => ({ ...e, i18nKey: e.code?.replaceAll(".", "_") }))}
            select={handlePTRSelectDocument}
            optionKey="i18nKey"
            t={t}
          />
        </LabelFieldPair>
      ) : null} */}
      {/* {!doc?.hasDropdown ? (
        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{t(doc?.code.replaceAll(".", "_")) + "  *"}</CardLabel>
        </LabelFieldPair>
      ) : null} */}
      <LabelFieldPair style={{ display: "inline" }}>
        <CardLabel style={{ marginBottom: "8px", width: "auto" }}>
          {t(doc?.code)} <span style={{ color: "red" }}> {doc?.required && " *"}</span>
        </CardLabel>
        <div className="field" style={{ width: "100%" }}>
          {/* <CustomUploadFile
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
            uploadedFile={uploadedFile}
            customOpen={customOpen}
          /> */}
          <div className={`upload-file upload-file-max-width`}>
            <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", flexWrap: "wrap", margin: "0px", padding: "0px" }}>
              <div style={{ height: "auto", minHeight: "40px", width: "43%", maxHeight: "40px", margin: "5px", padding: "0px", }}>
                <SubmitBar
                  label={t("CAPTURE_IMAGE")}
                  onSubmit={() => {
                    // if(mobile){
                    setShowCameraModal(true);
                    // }else{
                    //   setError(t("CS_MOBILE_CAMERA_ERROR"));
                    // }                    
                  }}
                />
              </div>
              {uploadedFile &&
                <div style={!mobile ? { margin: "0px", display: "flex", justifyContent: "center", padding: "0px", width: "46%" } : { width: "80%", display: "flex", marginBottom: "10px", justifyContent: "center" }}>
                  <SubmitBar
                    onSubmit={() => {
                      routeTo(uploadedFile);
                    }}
                    label={t("CS_VIEW_DOCUMENT")}
                  />
                </div>}
            </div>
          </div>

        </div>
      </LabelFieldPair>
      {getLoading && <Loader page={true} />}
      {showCameraModal && <ImageCaptureModal onCapture={onCapture} onClose={onClose} />}
    </div>
  );
}

export default ChallanDocuments;
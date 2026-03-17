import React, { use, useEffect, useState } from "react";
import { CardLabel, Dropdown, UploadFile, Toast, FormStep, LabelFieldPair, ActionBar } from "@mseva/digit-ui-react-components";
import { Loader } from "../components/Loader";
import EXIF from "exif-js";

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

  useEffect(() => {
    if (documents) onSelect(documents);
    console.log("documents", documents);
  }, [documents]);

  useEffect(() => {
    const incomingDocs = formData?.documents?.documents || [];
    if (Array.isArray(incomingDocs) && incomingDocs.length > 0 && documents.length === 0) {
      setDocuments(incomingDocs);
    }
  }, [formData]);

  const onSkip = () => onSelect();
  function onAdd() {}

  useEffect(() => {
    let count = 0;
    data?.Challan?.Documents?.map((doc) => {
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

  return (
    <div>
      {/* <Timeline currentStep={4} /> */}
      {!isLoading ? (
        <div>
          {data?.Challan?.Documents?.map((document, index) => {
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
              />
            );
          })}
          {error && <Toast isDleteBtn={true} label={error} onClose={() => setError(null)} error />}
        </div>
      ) : (
        <Loader />
      )}
    </div>
  );
};

function PTRSelectDocument({ t, document: doc, setDocuments, setError, documents, action, formData, handleSubmit, id }) {
  const filteredDocument = documents?.filter((item) => item?.documentType?.includes(doc?.code))[0];

  const tenantId = Digit.ULBService.getCurrentTenantId();
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
  const [uploadedFile, setUploadedFile] = useState(() => filteredDocument?.filestoreId || filteredDocument?.fileStoreId || null);

  useEffect(() => {
    const fsId = filteredDocument?.filestoreId || filteredDocument?.fileStoreId;
    if (fsId && fsId !== uploadedFile) {
      setUploadedFile(fsId);
    }
  }, [filteredDocument]);

  const handlePTRSelectDocument = (value) => setSelectedDocument(value);

  function selectfile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setFile(file);
    updateDocument(selectedDocument, {}); // no lat/long
  }

  // helper function to avoid repeating code
  function updateDocument(selectedDocument, extraFields = {}) {
    setDocuments(() => [
      {
        documentType: "arrearDoc", // fixed type as per backend
        filestoreId: extraFields.filestoreId || null,
        documentUid: extraFields.documentUid || null,
      },
    ]);
    // setDocuments((prev = []) => {
    //   const updated = prev.map((item) => (item?.documentType === selectedDocument?.code ? { ...item, ...extraFields } : item));

    //   if (!updated.some((i) => i?.documentType === selectedDocument?.code)) {
    //     updated.push({
    //       documentType: "arrearDoc",
    //       filestoreId: null,
    //       documentUid: null,
    //       ...extraFields,
    //     });
    //   }

    //   return updated;
    // });
  }

  const { dropdownData } = doc;

  var dropDownData = dropdownData;

  const [isHidden, setHidden] = useState(false);
  const [getLoading, setLoading] = useState(false);

  // useEffect(() => {
  //   if (documents?.length > 0) {
  //     handleSubmit();
  //   }
  // }, [documents]);

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
          setError(t("CS_MAXIMUM_UPLOAD_SIZE_EXCEEDED"));
          // if (!formState.errors[config.key]) setFormError(config.key, { type: doc?.code });
        } else {
          try {
            setUploadedFile(null);
            const response = await Digit.UploadServices.Filestorage("PTR", file, Digit.ULBService.getStateId());
            setLoading(false);
            if (response?.data?.files?.length > 0) {
              const fsId = response.data.files[0].fileStoreId;
              setUploadedFile(fsId);

              updateDocument(selectedDocument, {
                filestoreId: fsId,
                documentUid: fsId,
              });
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
  return (
    <div className="challan-documents">
      <LabelFieldPair className="challan-label-field">
        <CardLabel className="challan-card-label">
          {t(doc?.code)} <span className="requiredField"> {doc?.required && " *"}</span>
        </CardLabel>
        <div className="field" style={{ width: "100%" }}>
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
        </div>
      </LabelFieldPair>
      {getLoading && <Loader page={true} />}
    </div>
  );
}

export default ChallanDocuments;

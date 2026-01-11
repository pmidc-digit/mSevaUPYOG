import React, { useEffect, useState } from "react";
import { CardLabel, UploadFile, Loader, FormStep, LabelFieldPair } from "@mseva/digit-ui-react-components";
import _ from "lodash";

const RentAndLeaseSelectProofIdentity = ({ t, config, onSelect, userType, formData }) => {
  const stateId = Digit.ULBService.getStateId();
  const [formErrors, setFormErrors] = useState({});
  const { triggerToast } = config;

  const FILE_POLICY = {
    maxBytes: 5 * 1024 * 1024, // 5 MB
    allowedExtensions: [".pdf", ".jpeg", ".jpg", ".png"],
  };

  const validateFile = (file, docCode) => {
    if (!file) return null;

    const maxBytes = FILE_POLICY.maxBytes;
    let allowedExtensions = [...FILE_POLICY.allowedExtensions];

    const nameLower = file?.name?.toLowerCase?.() || "";
    const okType = allowedExtensions?.some((ext) => nameLower?.endsWith(ext));
    if (!okType) return "CS_FILE_INVALID_TYPE";
    if (file?.size > maxBytes) return "CS_MAXIMUM_UPLOAD_SIZE_EXCEEDED";
    return null;
  };

  const makeDocumentsValidator = (mdms) => {
    const requiredDocs = (mdms || [])?.filter((d) => d?.required);

    return (documents = []) => {
      const errors = {};
      const missingDocs = [];
      const docsArray = Array.isArray(documents) ? documents : [];
      if (!requiredDocs?.length) return errors;

      for (const doc of requiredDocs) {
        const satisfied = docsArray?.some((d) => d.documentType?.includes(doc?.code) && (d?.filestoreId || d.fileStoreId));
        if (!satisfied) {
          missingDocs.push(t(doc?.code?.replaceAll(".", "_")?.toUpperCase()));
        }
      }

      if (missingDocs?.length > 0) {
        errors.missingRequired = "PTR_MISSING_REQUIRED_DOCUMENTS";
        errors.missingDocs = missingDocs;
      }
      return errors;
    };
  };

  const tenantId = window.location.href.includes("citizen")
    ? window.localStorage.getItem("CITIZEN.CITY")
    : window.localStorage.getItem("Employee.tenant-id");
  const { isLoading, data: mdmsDocsData } = Digit.Hooks.rentandlease.useRALDocumentsMDMS(tenantId);

  const [documents, setDocuments] = useState(formData?.documents?.documents || []);
  // Centralized required-doc validation
  useEffect(() => {
    if (mdmsDocsData) {
      const validateDocs = makeDocumentsValidator(mdmsDocsData);
      const errors = validateDocs(documents);
      setFormErrors(errors);
    }
  }, [documents, mdmsDocsData]);

  useEffect(() => {
    const incomingDocs = formData?.documents?.documents || [];
    if (!_.isEqual(incomingDocs, documents)) {
      setDocuments(incomingDocs);
    }
  }, [formData]);

  const lastSentRef = React.useRef();

  useEffect(() => {
    if (!_.isEqual(lastSentRef.current, documents)) {
      lastSentRef.current = documents;
      onSelect(config.key, { documents });
    }
  }, [documents, config.key]);

  const handleSubmit = () => {
    if (Object.keys(formErrors)?.length > 0) {
      triggerToast(t(formErrors?.missingRequired || "PTR_VALIDATION_ERROR"), true);
      onSelect(config.key, { missingDocs: formErrors?.missingDocs || [] });
      return;
    }
    let documentStep = { ...mdmsDocsData, documents };
    onSelect(config.key, documentStep);
  };

  const onSkip = () => onSelect();

  return (
    <div>
      {!isLoading ? (
        <FormStep t={t} config={config} onSelect={handleSubmit} onSkip={onSkip} isDisabled={Object.keys(formErrors).length > 0}>
          {Array.isArray(mdmsDocsData) &&
            mdmsDocsData?.map((mdmsDoc, index) => {
              const existing = documents?.find((d) => d?.documentType === mdmsDoc?.code);
              return (
                <RentAndLeaseSelectDocument
                  key={index}
                  document={{ ...mdmsDoc, ...existing }}
                  t={t}
                  setDocuments={setDocuments}
                  documents={documents}
                  validateFile={validateFile}
                  makeDocumentsValidator={makeDocumentsValidator}
                  mdms={mdmsDocsData}
                  setFormErrors={setFormErrors}
                  formErrors={formErrors} // ✅ pass down
                />
              );
            })}
        </FormStep>
      ) : (
        <Loader />
      )}
    </div>
  );
};

function RentAndLeaseSelectDocument({
  t,
  document: doc,
  setDocuments,
  documents,
  validateFile,
  makeDocumentsValidator,
  mdms,
  setFormErrors,
  formErrors,
  submitted,
}) {
  const [file, setFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(doc?.fileStoreId || null);
  const [fieldError, setFieldError] = useState(null);
  const [loading, setLoading] = useState(false);
  const isCitizen = window.location.href.includes("citizen");

  function selectfile(e) {
    const selected = e.target.files && e.target.files[0];
    if (!selected) return;

    const errKey = validateFile(selected, doc?.code);
    if (errKey) {
      setFieldError(t(errKey));
      updateParentDocs(null);
      return;
    }
    setFieldError(null);
    setFile(selected);
  }

  useEffect(() => {
    if (file) {
      (async () => {
        setLoading(true);
        try {
          const response = await Digit.UploadServices.Filestorage("PTR", file, Digit.ULBService.getStateId());
          setLoading(false);
          if (response?.data?.files?.length > 0) {
            const fileId = response?.data?.files[0]?.fileStoreId;
            setUploadedFile(fileId);
            updateParentDocs(fileId);
          } else {
            setFieldError(t("CS_FILE_UPLOAD_ERROR"));
            updateParentDocs(null);
          }
        } catch {
          setLoading(false);
          setFieldError(t("CS_FILE_UPLOAD_ERROR"));
          updateParentDocs(null);
        }
      })();
    }
  }, [file]);

  const updateParentDocs = (fileId) => {
    const updatedDocs = [
      ...documents?.filter((d) => d?.documentType !== doc?.code),
      ...(fileId ? [{ documentType: doc?.code, fileStoreId: fileId, documentUid: fileId }] : []),
    ];

    if (!_.isEqual(updatedDocs, documents)) {
      setDocuments(updatedDocs);
      const errors = makeDocumentsValidator(mdms)(updatedDocs);
      setFormErrors(errors);
    }
  };

  return (
    <div className="ral-doc-container">
      {loading && <Loader />}

      <LabelFieldPair>
        {/* <CardLabel className="card-label-smaller" style={{width:"100%"}}>{t(doc?.code.replaceAll(".", "_")) + (doc?.required && <span style={mandatoryStyle}>  *</span>)}</CardLabel> */}
        <CardLabel className="card-label-smaller ral-doc-label">
          {t(doc?.code?.replaceAll(".", "_"))}
          {doc?.required && <span className="mandatory-asterisk"> *</span>}
        </CardLabel>
      </LabelFieldPair>

      <LabelFieldPair>
        <div className={`form-field ral-doc-field ${!isCitizen ? "ral-doc-field-employee" : ""}`}>
          <UploadFile
            onUpload={selectfile}
            onDelete={() => {
              setUploadedFile(null);
              setFieldError(null);
              updateParentDocs(null);
            }}
            message={uploadedFile ? `1 ${t(`CS_ACTION_FILEUPLOADED`)}` : t(`CS_ACTION_NO_FILEUPLOADED`)}
            textStyles={{ width: "100%" }}
            inputStyles={{ width: "280px" }}
            accept={doc?.code === "OWNER.OWNERPHOTO" || doc?.code === "PET.PETPHOTO" ? ".jpeg, .jpg, .png" : ".pdf, .jpeg, .jpg, .png"}
            buttonType="button"
            error={Boolean(fieldError)}
          />
          {/* Inline file validation error */}
          {fieldError && <div className="ral-doc-error">{fieldError}</div>}
        </div>
      </LabelFieldPair>
    </div>
  );
}

export default RentAndLeaseSelectProofIdentity;

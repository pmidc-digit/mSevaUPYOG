import React, { useEffect, useState } from "react";
import { CardLabel, Dropdown, UploadFile, Toast, Loader, FormStep, LabelFieldPair } from "@mseva/digit-ui-react-components";
import _ from "lodash";
import { useDispatch, useSelector } from "react-redux";

const PTSelectProofIdentity = ({ t, config, onSelect, userType, formData }) => {
  const stateId = Digit.ULBService.getStateId();
  const [formErrors, setFormErrors] = useState({});
  const [toastError, setToastError] = useState(null);

  const FILE_POLICY = {
    maxBytes: 5 * 1024 * 1024, // 5 MB
    allowedExtensions: [".pdf", ".jpeg", ".jpg", ".png"],
  };

  const apiDataCheck = useSelector((state) => state.ptr.PTRNewApplicationFormReducer.formData?.responseData);
  console.log("apiDataCheck for here docs:>> ", apiDataCheck);
  const validateFile = (file, docCode) => {
    if (!file) return null;

    const maxBytes = 5 * 1024 * 1024; // 5 MB
    // Default allowed extensions
    let allowedExtensions = [".pdf", ".jpeg", ".jpg", ".png"];

    // Restrict to images only for Owner's Photo and PET_PETPHOTO
    if (docCode === "OWNER.OWNERPHOTO" || docCode === "PET.PETPHOTO") {
      allowedExtensions = [".jpeg", ".jpg", ".png"];
    }

    const nameLower = file?.name?.toLowerCase?.() || "";
    const okType = allowedExtensions.some((ext) => nameLower.endsWith(ext));
    if (!okType) return "CS_FILE_INVALID_TYPE";
    if (file.size > maxBytes) return "CS_MAXIMUM_UPLOAD_SIZE_EXCEEDED";
    return null;
  };

  const makeDocumentsValidator = (mdms) => {
    const requiredDocs = (mdms || []).filter((d) => d?.required);

    return (documents = []) => {
      const errors = {};
      const missingDocs = [];
      const docsArray = Array.isArray(documents) ? documents : [];
      if (!requiredDocs.length) return errors;
      for (const doc of requiredDocs) {
        const satisfied = docsArray.some((d) => d.documentType?.includes(doc.code) && (d.filestoreId || d.fileStoreId));
        if (!satisfied) {
          missingDocs.push(doc.name || t(doc.code.replaceAll(".", "_")));
          // or doc.name if available
        }
      }
      if (missingDocs.length > 0) {
        errors.missingRequired = "PTR_MISSING_REQUIRED_DOCUMENTS";
        errors.missingDocs = missingDocs;
      }
      return errors;
    };
  };

  const tenantId = Digit.ULBService.getCurrentTenantId();
  const { data: mdmsDocsData, isLoading } = Digit.Hooks.ptr.useDocumentsMDMS(tenantId);

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
    if (!apiDataCheck) {
      const incomingDocs = formData?.documents?.documents || [];
      if (!_.isEqual(incomingDocs, documents)) {
        setDocuments(incomingDocs);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, apiDataCheck]); // remove `documents` from deps to avoid re-triggering unnecessarily

  useEffect(() => {
    // Defensive checks + normalise different shapes from backend
    if (Array.isArray(apiDataCheck) && apiDataCheck.length > 0 && Array.isArray(apiDataCheck[0].documents)) {
      const docs = apiDataCheck[0].documents.map((d) => {
        const fileId = d?.fileStoreId ?? d?.filestoreId ?? d?.filestoreId ?? d?.documentUid ?? null;
        // documentType may sometimes be 'documentType' or 'type' or 'code' depending on backend
        const documentType = d?.documentType ?? d?.type ?? d?.code ?? null;
        return {
          documentType,
          filestoreId: fileId,
          documentUid: fileId,
        };
      });
      console.log("setting documents to", docs);
      setDocuments(docs);
    }
  }, [apiDataCheck]);

  const lastSentRef = React.useRef();

  useEffect(() => {
    if (!_.isEqual(lastSentRef.current, documents)) {
      lastSentRef.current = documents;
      onSelect(config.key, { documents });
    }
  }, [documents, config.key]);

  const handleSubmit = () => {
    if (Object.keys(formErrors).length > 0) {
      setToastError(t(formErrors.missingRequired || "PTR_VALIDATION_ERROR"));
      // Pass missingDocs up to parent
      onSelect(config.key, { missingDocs: formErrors.missingDocs || [] });
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
            mdmsDocsData.map((mdmsDoc, index) => {
              const existing = documents.find((d) => d.documentType === mdmsDoc.code);
              console.log("existing for", mdmsDoc.code, existing);
              console.log("document prop", { ...mdmsDoc, ...existing });

              return (
                <PTSelectDocument
                  key={index}
                  document={{ ...mdmsDoc, ...existing }} // ✅ merge uploaded file info
                  t={t}
                  setDocuments={setDocuments}
                  documents={documents}
                  validateFile={validateFile}
                  makeDocumentsValidator={makeDocumentsValidator}
                  mdms={mdmsDocsData}
                  setFormErrors={setFormErrors}
                />
              );
            })}

          {toastError && <Toast label={toastError} onClose={() => setToastError(null)} error />}
        </FormStep>
      ) : (
        <Loader />
      )}
    </div>
  );
};

function PTSelectDocument({ t, document: doc, setDocuments, documents, validateFile, makeDocumentsValidator, mdms, setFormErrors }) {
  const [selectedDocument, setSelectedDocument] = useState({});
  const [file, setFile] = useState(null);
  // const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(doc?.filestoreId || null);

  useEffect(() => {
    const fileId = doc?.filestoreId;
    setUploadedFile(fileId);
  }, [doc?.filestoreId]);

  console.log("uploadedFile for", doc?.documentType, uploadedFile, "doc prop:", doc);

  const [fieldError, setFieldError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePTRSelectDocument = (value) => setSelectedDocument(value);

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
      ...documents.filter((d) => d.documentType !== doc?.code),
      ...(fileId ? [{ documentType: doc?.code, filestoreId: fileId, documentUid: fileId }] : []),
    ];

    if (!_.isEqual(updatedDocs, documents)) {
      setDocuments(updatedDocs);
      const errors = makeDocumentsValidator(mdms)(updatedDocs);
      setFormErrors(errors);
    }
  };

  const errorStyle = { color: "#d4351c", fontSize: "12px", marginTop: "-16px", marginBottom: "10px" };

  return (
    <div style={{ marginBottom: "24px" }}>
      {loading && <Loader />}

      {/* {doc?.hasDropdown ? (
        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{t(doc?.code.replaceAll(".", "_"))}</CardLabel>
          <Dropdown
            className="form-field"
            selected={selectedDocument}
            style={{ width: "100%" }}
            option={doc?.dropdownData?.map((e) => ({
              ...e,
              i18nKey: e.code?.replaceAll(".", "_"),
            }))}
            select={handlePTRSelectDocument}
            optionKey="i18nKey"
            t={t}
          />
        </LabelFieldPair>
      ) : (
        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{t(doc?.code.replaceAll(".", "_")) + (doc?.required ? "  *" : "")}</CardLabel>
        </LabelFieldPair>
      )} */}

      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{t(doc?.code.replaceAll(".", "_")) + (doc?.required ? "  *" : "")}</CardLabel>
      </LabelFieldPair>

      <LabelFieldPair>
        <CardLabel className="card-label-smaller"></CardLabel>
        <div className="field">
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

          {fieldError && <errorStyle style={errorStyle}>{fieldError}</errorStyle>}
        </div>
      </LabelFieldPair>
    </div>
  );
}

export default PTSelectProofIdentity;

import React, { useEffect, useState, useMemo } from "react";
import {
  CardLabel,
  Dropdown,
  Toast,
  Loader,
  FormStep,
  LabelFieldPair,
  CardSectionHeader,
} from "@mseva/digit-ui-react-components";
import { useSelector, useDispatch } from "react-redux";
import { UPDATE_NOCNewApplication_FORM } from "../redux/action/NOCNewApplicationActions";
import NOCCustomUploadFile from "./NOCCustomUploadFile";

/* ─── Inner component: one document row ─── */
function FireNOCSelectDocument({ doc, t, setDocuments, documents, setError }) {
  const stateId = Digit.ULBService.getStateId();

  /* find any previously uploaded record for this doc */
  const filteredDocument = documents?.find((item) => item?.documentType?.startsWith(doc.code));

  const [selectedDocument, setSelectedDocument] = useState(() => {
    if (filteredDocument) {
      return { code: filteredDocument.documentType, active: true };
    }
    if (!doc.hasDropdown) {
      return { code: doc.code, active: true };
    }
    const activeDropdown = doc.dropdownData?.filter((d) => d.active) || [];
    return activeDropdown.length === 1 ? activeDropdown[0] : null;
  });

  const [file, setFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(filteredDocument?.filestoreId || null);
  const [isUploading, setIsUploading] = useState(false);

  /* dropdown options */
  const dropdownOptions = useMemo(() => {
    if (!doc.hasDropdown || !doc.dropdownData) return [];
    return doc.dropdownData
      .filter((d) => d.active)
      .map((d) => ({ ...d, name: t(d.code.replaceAll(".", "_")) }));
  }, [doc, t]);

  /* ── Upload file when selected ── */
  useEffect(() => {
    (async () => {
      setError(null);
      if (!file) return;
      if (file.size >= 5242880) {
        setError(t("CS_MAXIMUM_UPLOAD_SIZE_EXCEEDED"));
        return;
      }
      try {
        setIsUploading(true);
        setUploadedFile(null);
        const response = await Digit.UploadServices.Filestorage("NOC", file, stateId);
        if (response?.data?.files?.length > 0) {
          setUploadedFile(response.data.files[0].fileStoreId);
        } else {
          setError(t("CS_FILE_UPLOAD_ERROR"));
        }
      } catch (err) {
        setError(t("CS_FILE_UPLOAD_ERROR"));
      } finally {
        setIsUploading(false);
      }
    })();
  }, [file]);

  /* ── Sync document records whenever uploadedFile or selectedDocument changes ── */
  useEffect(() => {
    if (!selectedDocument?.code) return;

    setDocuments((prev) => {
      const others = (prev || []).filter(
        (item) => !item.documentType?.startsWith(doc.code)
      );

      if (!uploadedFile) return others;

      return [
        ...others,
        {
          documentType: selectedDocument.code,
          filestoreId: uploadedFile,
          documentUid: uploadedFile,
          documentAttachment: uploadedFile,
        },
      ];
    });
  }, [uploadedFile, selectedDocument]);

  const handleFileSelect = (e) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  return (
    <div className="bpa-doc-required-wrapper">
      {isUploading && <Loader />}

      <LabelFieldPair>
        <CardLabel className="bpa-doc-required-label">
          {t(doc.code.replaceAll(".", "_"))}
          {doc.required && <span className="requiredField">*</span>}
        </CardLabel>

        <div className="bpa-doc-required-field">
          {/* Dropdown for documents with multiple options (e.g., Identity Proof) */}
          {doc.hasDropdown && dropdownOptions.length > 0 && (
            <div style={{ marginBottom: "8px" }}>
              <Dropdown
                className="form-field"
                option={dropdownOptions}
                optionKey="name"
                select={(val) => setSelectedDocument(val)}
                selected={selectedDocument}
                t={t}
                placeholder={t("Select Document Type")}
              />
            </div>
          )}

          <NOCCustomUploadFile
            id={`firenoc-doc-${doc.code}`}
            onUpload={handleFileSelect}
            onDelete={() => {
              setUploadedFile(null);
              setFile(null);
            }}
            uploadedFile={uploadedFile}
            message={
              uploadedFile
                ? `1 ${t("CS_ACTION_FILEUPLOADED")}`
                : t("CS_ACTION_NO_FILEUPLOADED")
            }
            textStyles={{ width: "100%" }}
            accept=".pdf, .jpeg, .jpg, .png"
          />
        </div>
      </LabelFieldPair>

      <p style={{ padding: "10px", fontSize: "14px" }}>
        {t("Only .pdf, .png, .jpeg, .jpg files are accepted with maximum size of 5 MB")}
      </p>

      {doc.description && (
        <p style={{ padding: "0 10px 10px", fontSize: "13px", color: "#717171" }}>
          {t(doc.description.replaceAll(".", "_"))}
        </p>
      )}
    </div>
  );
}

/* ─── Main component ─── */
const FireNOCDocuments = ({ t, config, onSelect, formData }) => {
  const stateId = Digit.ULBService.getStateId();
  const dispatch = useDispatch();

  /* Seed from Redux so uploads survive back-navigation */
  const persistedDocs = useSelector(
    (state) => state?.noc?.NOCNewApplicationFormReducer?.formData?.uploadedDocuments?.documents || []
  );
  const [documents, setDocuments] = useState(persistedDocs);
  const [error, setError] = useState(null);
  const [enableSubmit, setEnableSubmit] = useState(true);

  /* Get applicationType from Step 1 */
  const applicationType = useSelector(
    (state) => state?.noc?.NOCNewApplicationFormReducer?.formData?.nocDetails?.fireNOCType?.code || "NEW"
  );

  /* Fetch FireNoc Documents MDMS */
  const { isLoading, data: docConfig } = Digit.Hooks.useCustomMDMS(stateId, "FireNoc", [{ name: "Documents" }], {
    select: (d) => {
      const allDocs = d?.FireNoc?.Documents || [];
      const match = allDocs.find((entry) => entry.applicationType === applicationType);
      return match?.allowedDocs?.filter((doc) => doc.active) || [];
    },
  });

  /* Enable submit only when all required docs are uploaded */
  useEffect(() => {
    console.log("➡️[FireNOCDocuments] applicationType:", applicationType);
    console.log("➡️[FireNOCDocuments] docConfig:", docConfig);
    console.log("➡️[FireNOCDocuments] documents state:", documents);
    if (!docConfig?.length) {
      console.log("➡️[FireNOCDocuments] ⚠️ docConfig empty/not loaded — skipping dispatch");
      return;
    }
    const requiredCodes = docConfig.filter((d) => d.required).map((d) => d.code);
    const uploadedTypes = documents.filter((d) => d.filestoreId).map((d) => d.documentType);
    const allUploaded = requiredCodes.every((code) =>
      uploadedTypes.some((uploaded) => uploaded.startsWith(code))
    );
    console.log("➡️[FireNOCDocuments] requiredCodes:", requiredCodes);
    console.log("➡️[FireNOCDocuments] uploadedTypes:", uploadedTypes);
    console.log("➡️[FireNOCDocuments] allUploaded:", allUploaded);
    setEnableSubmit(!allUploaded);
    console.log("➡️[FireNOCDocuments] dispatching to Redux → documents:", documents);
    dispatch(UPDATE_NOCNewApplication_FORM("uploadedDocuments", { documents }));
  }, [documents, docConfig]);

  const handleSubmit = () => {
    const documentStep = { ...(formData?.documents || {}), documents };
    onSelect(config.key, documentStep);
  };

  if (isLoading) return <Loader />;

  return (
    <div>
      <FormStep t={t} config={config} onSelect={handleSubmit} isDisabled={enableSubmit}>
        <CardSectionHeader>{t("ES_TITILE_DOCUMENT_DETAILS")}</CardSectionHeader>
        {docConfig?.map((doc) => (
          <div key={doc.code} className="bpa-doc-required-card">
            <FireNOCSelectDocument
              doc={doc}
              t={t}
              setDocuments={setDocuments}
              documents={documents}
              setError={setError}
            />
          </div>
        ))}
        {error && (
          <Toast label={error} isDleteBtn={true} onClose={() => setError(null)} error />
        )}
      </FormStep>
    </div>
  );
};

export default FireNOCDocuments;

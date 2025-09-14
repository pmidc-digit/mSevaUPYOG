import React, { use, useEffect, useState } from "react";
import { CardLabel, Dropdown, UploadFile, Toast, Loader, FormStep, LabelFieldPair } from "@mseva/digit-ui-react-components";

const ADSSiteInspection = ({ t, config, onSelect, userType, formData, setError: setFormError, clearErrors: clearFormErrors, formState }) => {
  const tenantId = Digit.ULBService.getStateId();
  const [documents, setDocuments] = useState(formData?.documents?.documents || []);
  const [error, setError] = useState(null);
  const [enableSubmit, setEnableSubmit] = useState(true);
  const [checkRequiredFields, setCheckRequiredFields] = useState(false);

  // const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();

  // const { isLoading, data } = Digit.Hooks.ptr.usePetMDMS(stateId, "PetService", "Documents");
  const { isLoading, data } = Digit.Hooks.pt.usePropertyMDMS(stateId, "NDC", ["Documents"]);

  const handleSubmit = () => {
    let document = formData.documents;
    let documentStep;
    documentStep = { ...document, documents: documents };
    onSelect(config.key, documentStep);
  };
  const onSkip = () => onSelect();
  function onAdd() {}

  useEffect(() => {
    const requiredDocs = data?.NDC?.Documents?.filter((d) => d?.required) || [];
    const provided = documents || [];
    const allRequiredPresent = requiredDocs.every((doc) => provided.some((d) => d?.documentType?.includes(doc.code) && d?.fileStoreId));
    setEnableSubmit(!(allRequiredPresent && !error));
  }, [documents, data, error]);

  return (
    <div>
      {!isLoading ? (
        <FormStep t={t} config={config} onSelect={handleSubmit} onSkip={onSkip} isDisabled={enableSubmit} onAdd={onAdd}>
          {data?.NDC?.Documents?.map((document, index) => {
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
          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Toast label={error} onClose={() => setError(null)} error />
              <button
                type="button"
                aria-label="Dismiss"
                onClick={() => setError(null)}
                style={{ background: "transparent", border: "none", fontSize: "18px", cursor: "pointer", lineHeight: 1 }}
                title={t("CS_ACTION_CLOSE") || "Close"}
              >
                ×
              </button>
            </div>
          )}
        </FormStep>
      ) : (
        <Loader />
      )}
    </div>
  );
};

function PTRSelectDocument({ t, document: doc, setDocuments, setError, documents, action, formData, handleSubmit, id }) {
  const filteredDocument = documents?.filter((item) => item?.documentType?.includes(doc?.code))[0];

  const tenantId = Digit.ULBService.getCurrentTenantId();
  const [selectedDocument, setSelectedDocument] = useState(
    filteredDocument
      ? { ...filteredDocument, active: doc?.active === true, code: filteredDocument?.documentType }
      : doc?.dropdownData?.length === 1
      ? doc?.dropdownData[0]
      : {}
  );

  const isRequired = true;

  const [file, setFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(() => filteredDocument?.fileStoreId || null);
  const [uploadedName, setUploadedName] = useState(() => filteredDocument?.fileName || null);
  const handlePTRSelectDocument = (value) => setSelectedDocument(value);

  function selectfile(e) {
    const f = e.target.files?.[0];
    setFile(f);
    setUploadedName(f?.name || null);
  }
  const { dropdownData } = doc;

  var dropDownData = dropdownData;

  const [isHidden, setHidden] = useState(false);
  if (isHidden) setUploadedName(null);
  const [getLoading, setLoading] = useState(false);

  const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"];
  const ALLOWED_EXTENSIONS = [".jpeg", ".jpg", ".png", ".pdf"];

  useEffect(() => {
    if (selectedDocument?.code) {
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
            fileStoreId: uploadedFile,
            documentDetailId: uploadedFile,
            fileName: uploadedName || filteredDocument?.fileName || null,
            mimeType: file?.type || null,
            size: file?.size || null,
          },
        ];
      });
    }
  }, [uploadedFile, uploadedName, selectedDocument]);

  useEffect(() => {
    if (documents?.length > 0) {
      handleSubmit();
    }
  }, [documents]);

  useEffect(() => {
    if (action === "update") {
      const originalDoc = formData?.originalData?.documents?.filter((e) => e.documentType.includes(doc?.code))[0];
      const docType = dropDownData
        ?.filter((e) => e.code === originalDoc?.documentType)
        .map((e) => ({ ...e, i18nKey: e?.code?.replaceAll(".", "_") }))[0];
      if (!docType) setHidden(true);
      else {
        setSelectedDocument(docType);
        setUploadedFile(originalDoc?.fileStoreId);
        setUploadedName(originalDoc?.fileName || null);
      }
    } else if (action === "create") {
    }
  }, []);

  useEffect(() => {
    if (!doc?.hasDropdown) {
      setSelectedDocument({ code: doc?.code, i18nKey: doc?.code?.replaceAll(".", "_") });
    }
  }, []);

  useEffect(() => {
    (async () => {
      setError(null);
      if (file) {
        setLoading(true);

        const typeOk = (file.type && ALLOWED_TYPES.includes(file.type)) || ALLOWED_EXTENSIONS.some((ext) => file.name?.toLowerCase().endsWith(ext));

        if (!typeOk) {
          setLoading(false);
          setUploadedFile(null);
          setError(t("CS_FILE_TYPE_NOT_ALLOWED") || "Only PDF, JPG, JPEG, and PNG files are allowed.");
          return;
        }

        if (file.size >= 5 * 1024 * 1024) {
          setLoading(false);
          setUploadedFile(null);
          setError(t("CS_MAXIMUM_UPLOAD_SIZE_EXCEEDED"));
          return;
        }

        try {
          setUploadedFile(null);
          const response = await Digit.UploadServices.Filestorage("PTR", file, Digit.ULBService.getStateId());
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

  return (
    <div style={{ marginBottom: "24px" }}>
      {getLoading && <Loader />}

      {/* Dropdown case */}
      {doc?.hasDropdown && (
        <LabelFieldPair>
          <CardLabel className="card-label-smaller">
            {t(doc?.code.replaceAll(".", "_"))}
            {isRequired && <span style={{ color: "red" }}> *</span>}
          </CardLabel>
          <Dropdown
            className="form-field"
            selected={selectedDocument}
            style={{ width: "100%" }}
            option={dropDownData.map((e) => ({
              ...e,
              i18nKey: e.code?.replaceAll(".", "_"),
            }))}
            select={handlePTRSelectDocument}
            optionKey="i18nKey"
            t={t}
          />
        </LabelFieldPair>
      )}

      {/* Non-dropdown case */}
      {!doc?.hasDropdown && (
        <LabelFieldPair>
          <CardLabel className="card-label-smaller">
            {t(doc?.code.replaceAll(".", "_"))}
            {isRequired && <span style={{ color: "red" }}> *</span>}
          </CardLabel>
        </LabelFieldPair>
      )}

      {/* Upload section — no extra asterisk here */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller"></CardLabel>
        <div className="field">
          <UploadFile
            onUpload={selectfile}
            onDelete={() => {
              setUploadedFile(null);
              setUploadedName(null);
              setError && setError(null);
            }}
            id={id}
            message={
              uploadedFile
                ? `${uploadedName || filteredDocument?.fileName || "1 " + t("CS_ACTION_FILEUPLOADED")}`
                : `${t("CS_ACTION_NO_FILEUPLOADED")} (${t("CS_ALLOWED_TYPES") || "PDF, JPG, JPEG, PNG"}; ≤ 5MB)`
            }
            textStyles={{ width: "100%" }}
            inputStyles={{ width: "280px" }}
            accept=".pdf, .jpeg, .jpg, .png"
            buttonType="button"
            error={!uploadedFile}
          />
        </div>
      </LabelFieldPair>
    </div>
  );
}

export default ADSSiteInspection;

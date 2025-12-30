import React, { use, useEffect, useState } from "react";
import { CardLabel, Dropdown, UploadFile, Toast, FormStep, LabelFieldPair } from "@mseva/digit-ui-react-components";
import { Loader } from "../components/Loader";

const CHBSelectProofIdentity = ({ t, config, onSelect, userType, formData, setError: setFormError, clearErrors: clearFormErrors, formState }) => {
  const [documents, setDocuments] = useState(formData?.documents?.documents);
  const [error, setError] = useState(null);
  const [enableSubmit, setEnableSubmit] = useState(true);
  const [checkRequiredFields, setCheckRequiredFields] = useState(false);
  const tenantId = window.location.href.includes("employee") ? Digit.ULBService.getCurrentPermanentCity() : localStorage.getItem("CITIZEN.CITY");

  console.log("tenantId", tenantId);

  const { data, isLoading } = Digit.Hooks.useCustomMDMS(tenantId, "CHB", [{ name: "Documents" }]);

  console.log("data=====", data);

  const handleSubmit = () => {
    let document = formData.documents;
    let documentStep;
    documentStep = { ...document, documents: documents };
    console.log("documentStep config.key", documentStep);
    onSelect(config.key, documentStep);
  };

  const onSkip = () => onSelect();
  function onAdd() {}

  useEffect(() => {
    let count = 0;
    data?.CHB?.Documents?.map((doc) => {
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
    <React.Fragment>
     
     
      {!isLoading ? (
        <FormStep t={t} config={config} onSelect={handleSubmit} onSkip={onSkip} isDisabled={enableSubmit} onAdd={onAdd}>
          {data?.CHB?.Documents?.map((document, index) => {
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
          {error && <Toast label={error} onClose={() => setError(null)} error />}
        </FormStep>
      ) : (
        <Loader />
      )}
    </React.Fragment>
  );
};

function PTRSelectDocument({ t, document: doc, setDocuments, setError, documents, action, formData, handleSubmit, id }) {
  const filteredDocument = documents?.filter((item) => item?.documentType?.includes(doc?.code))[0];
  // console.log("filetetetetet",filteredDocument, documents, doc);

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
  const [uploadedFile, setUploadedFile] = useState(() => filteredDocument?.filestoreId || null);

  const handlePTRSelectDocument = (value) => setSelectedDocument(value);

  function selectfile(e) {
    setFile(e.target.files[0]);
  }
  const { dropdownData } = doc;

  var dropDownData = dropdownData;

  const [isHidden, setHidden] = useState(false);
  const [getLoading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedDocument?.code) {
      console.log("selectedDocument", documents);
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
          },
        ];
      });
    }
  }, [uploadedFile, selectedDocument]);

  useEffect(() => {
    if (documents?.length > 0) {
      console.log("documents", documents);
      handleSubmit();
    }
  }, [documents]);

  useEffect(() => {
    if (action === "update") {
      const originalDoc = formData?.originalData?.documents?.filter((e) => e.documentType.includes(doc?.code))[0];
      const docType = dropDownData
        ?.filter((e) => e.code === originalDoc?.documentType)
        ?.map((e) => ({ ...e, i18nKey: e?.code?.replaceAll(".", "_") }))[0];
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

  return (
    <React.Fragment>
     
      {doc?.hasDropdown ? (
        <LabelFieldPair style={{ display: "inline" }}>
          <CardLabel style={{ width: "auto" }}>
            {t(doc?.code)} {doc?.required && " *"}
          </CardLabel>
          <Dropdown
            className="form-field"
            selected={selectedDocument}
            style={{ width: "100%" }}
            option={doc?.dropdownData?.map((e) => ({ ...e, i18nKey: e.code?.replaceAll(".", "_") }))}
            select={handlePTRSelectDocument}
            optionKey="i18nKey"
            t={t}
          />
        </LabelFieldPair>
      ) : null}
      {!doc?.hasDropdown ? (
        <LabelFieldPair>
          <CardLabel className="card-label-smaller">
            {t(doc?.code.replaceAll(".", "_"))} {doc?.required && " *"}
          </CardLabel>
        </LabelFieldPair>
      ) : null}
      <LabelFieldPair style={{ display: "inline" }}>
        <CardLabel className="card-label-smaller"></CardLabel>

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
        
      </LabelFieldPair>
      {getLoading && <Loader page={true} />}
    </React.Fragment>
  );
}

export default CHBSelectProofIdentity;

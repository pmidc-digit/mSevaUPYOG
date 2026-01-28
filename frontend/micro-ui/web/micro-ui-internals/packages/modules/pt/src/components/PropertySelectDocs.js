import React, { useEffect, useState } from "react";
import { CardLabel, LabelFieldPair, Dropdown, UploadFile, Toast } from "@mseva/digit-ui-react-components";
import { useSelector } from "react-redux";
import { Loader } from "../components/Loader";

const SelectNDCDocuments = ({ t, config, onSelect, userType, formData, setError: setFormError, clearErrors: clearFormErrors, formState }) => {
  const tenantId = window.location.href.includes("employee") ? Digit.ULBService.getCurrentPermanentCity() : localStorage.getItem("CITIZEN.CITY");
  const checkFormData = useSelector((state) => state.gc.GarbageApplicationFormReducer.formData || {});
  const stateId = Digit.ULBService.getStateId();
  const [documents, setDocuments] = useState(formData?.documents?.documents || []);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("checkFormData", checkFormData);
    if (checkFormData?.venueDetails?.documents?.length && documents.length === 0) {
      // Map API response into the structure your UploadFile expects
      const apiDocs = checkFormData?.venueDetails?.documents?.map((doc) => ({
        documentType: doc?.documentType,
        fileStoreId: doc?.fileStoreId, // 👈 key mapping
        documentUid: doc?.fileStoreId, // 👈 key mapping
      }));

      setDocuments(apiDocs);
    }
  }, [checkFormData]);

  const { action = "create" } = Digit.Hooks.useQueryParams();
  const { data = [], isLoading } = Digit.Hooks.useCustomMDMS(tenantId, "PropertyTax", [{ name: "Documents" }]);
  const ndcDocuments = data?.["PropertyTax"]?.Documents;

  const goNext = () => {
    console.log("here stop");
    console.log("formData", formData);
    // return
    onSelect(config.key, { documents, ndcDocumentsLength: ndcDocuments?.length });
  };

  useEffect(() => {
    goNext();
  }, [documents]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div>
      {ndcDocuments?.map((document, index) => {
        return (
          <SelectDocument
            key={index}
            document={document}
            action={action}
            t={t}
            error={error}
            setError={setError}
            setDocuments={setDocuments}
            documents={documents}
            formData={formData}
            setFormError={setFormError}
            clearFormErrors={clearFormErrors}
            config={config}
            formState={formState}
          />
        );
      })}
      {error && <Toast isDleteBtn={true} label={error} onClose={() => setError(null)} error />}
    </div>
  );
};

function SelectDocument({ t, document: doc, setDocuments, setError, documents, setFormError, config, formState, formData }) {
  const filteredDocument = documents?.filter((item) => item?.documentType?.includes(doc?.code))[0];
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const [getLoader, setLoader] = useState(false);

  const [file, setFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(() => filteredDocument?.fileStoreId || null);

  function selectfile(e) {
    setFile(e.target.files[0]);
  }

  useEffect(() => {
    if (filteredDocument?.fileStoreId && !file) {
      setUploadedFile(filteredDocument.fileStoreId);
    }
  }, [filteredDocument]);

  useEffect(() => {
    console.log("here come", documents);
    if (uploadedFile) {
      setDocuments((prev) => {
        const filteredDocumentsByDocumentType = prev?.filter((item) => item?.documentType !== doc?.code);

        if (uploadedFile?.length === 0 || uploadedFile === null) {
          return filteredDocumentsByDocumentType;
        }

        const filteredDocumentsByFileStoreId = filteredDocumentsByDocumentType?.filter((item) => item?.fileStoreId !== uploadedFile);
        return [
          ...filteredDocumentsByFileStoreId,
          {
            documentType: doc?.code,
            fileStoreId: uploadedFile,
            documentUid: uploadedFile,
          },
        ];
      });
    } else if (uploadedFile === null) {
      setDocuments((prev) => prev.filter((item) => item?.documentType !== doc?.code));
    }
  }, [uploadedFile]);

  useEffect(() => {
    (async () => {
      setError(null);
      if (file) {
        setLoader(true);
        if (file.size >= 5242880) {
          setError(t("CS_MAXIMUM_UPLOAD_SIZE_EXCEEDED"));
          setLoader(false);
          if (!formState.errors[config.key]) setFormError(config.key, { type: doc?.code });
        } else {
          try {
            setUploadedFile(null);
            const response = await Digit.UploadServices.Filestorage("PT", file, Digit.ULBService.getStateId());
            setLoader(false);
            if (response?.data?.files?.length > 0) {
              setUploadedFile(response?.data?.files[0]?.fileStoreId);
            } else {
              setError(t("CS_FILE_UPLOAD_ERROR"));
            }
          } catch (err) {
            setLoader(false);
            setError(t("CS_FILE_UPLOAD_ERROR"));
          }
        }
      }
    })();
  }, [file]);

  return (
    <div style={{ marginBottom: "24px" }}>
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">
          {t(doc?.code)} {doc?.required && " *"}
        </CardLabel>
        <div className="field">
          <UploadFile
            id={"tl-doc"}
            onUpload={selectfile}
            onDelete={() => {
              setUploadedFile(null);
            }}
            message={uploadedFile ? `1 ${t(`CS_ACTION_FILEUPLOADED`)}` : t(`CS_ACTION_NO_FILEUPLOADED`)}
            textStyles={{ width: "100%" }}
            accept="image/*,.pdf"
            // disabled={enabledActions?.[action].disableUpload || !selectedDocument?.code}
          />
        </div>
      </LabelFieldPair>
      {getLoader && <Loader page={true} />}
    </div>
  );
}

export default SelectNDCDocuments;

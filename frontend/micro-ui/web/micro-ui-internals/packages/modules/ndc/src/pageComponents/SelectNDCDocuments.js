import React, { use, useEffect, useState, useRef } from "react";
import { CardLabel, LabelFieldPair, Dropdown, UploadFile, Toast } from "@mseva/digit-ui-react-components";
import { useSelector } from "react-redux";
import { Loader } from "../components/Loader";

const SelectNDCDocuments = ({ t, config, onSelect, userType, formData, setError: setFormError, clearErrors: clearFormErrors, formState }) => {
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const checkFormData = useSelector((state) => state.ndc.NDCForm.formData || {});
  const stateId = Digit.ULBService.getStateId();
  const [documents, setDocuments] = useState(formData?.documents?.documents || []);
  const [error, setError] = useState(null);

  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;

    const docs = checkFormData?.responseData?.[0]?.Documents || checkFormData?.DocummentDetails?.documents?.documents;

    if (docs?.length) {
      initialized.current = true;

      setDocuments(
        docs.map((doc) => ({
          documentType: doc.documentType,
          uuid: doc.uuid,
          documentAttachment: doc.documentAttachment,
          applicationId: doc.applicationId,
        }))
      );
    }
  }, [checkFormData]);

  const { action = "create" } = Digit.Hooks.useQueryParams();

  const { isLoading, data } = Digit.Hooks.pt.usePropertyMDMS(stateId, "NDC", ["Documents"]);

  const ndcDocuments = data?.NDC?.Documents;

  const goNext = () => {
    let document = formData.documents;
    let documentStep;
    documentStep = { ...document, documents: documents };
    onSelect(config.key, documentStep);
    // onSelect(config.key, { documents, ndcDocumentsLength: ndcDocuments?.length });
  };

  useEffect(() => {
    if (JSON.stringify(formData?.documents?.documents) !== JSON.stringify(documents)) {
      goNext();
    }
  }, [documents]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div>
      {ndcDocuments?.map((document, index) => {
        // if (document.code === "OWNER.SPECIALCATEGORYPROOF") {
        //   if (formData?.owners?.every((user) => user.ownerType.code === "NONE" || !user.ownerType?.code)) {
        //     return null;
        //   }
        // }
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

function SelectDocument({ t, document: doc, setDocuments, setError, documents, setFormError, config, formState }) {
  const filteredDocument = documents?.find((item) => item?.documentType === doc?.code);
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const [getLoader, setLoader] = useState(false);

  const [file, setFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(() => filteredDocument?.documentAttachment || null);

  function selectfile(e) {
    setFile(e.target.files[0]);
  }

  useEffect(() => {
    setUploadedFile(filteredDocument?.documentAttachment || null);
  }, [filteredDocument?.documentAttachment]);

  useEffect(() => {
    setDocuments((prev) => {
      const remaining = prev.filter((item) => item.documentType !== doc.code);

      if (!uploadedFile) return remaining;

      return [
        ...remaining,
        {
          documentType: doc.code,
          uuid: uploadedFile,
          documentAttachment: uploadedFile,
        },
      ];
    });
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
    <div className="ndc-label-field-pair">
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">
          {t(doc?.code)} {doc?.required && " *"}
        </CardLabel>
        <div className="form-field">
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

// import React, { use, useEffect, useState } from "react";
// import { CardLabel, Dropdown, UploadFile, Toast, Loader, FormStep, LabelFieldPair } from "@mseva/digit-ui-react-components";
// import Timeline from "../components/PTRTimeline";

// const PTRSelectProofIdentity = ({ t, config, onSelect, userType, formData, setError: setFormError, clearErrors: clearFormErrors, formState }) => {
//   const tenantId = Digit.ULBService.getStateId();
//   const [documents, setDocuments] = useState(formData?.documents?.documents);
//   const [error, setError] = useState(null);
//   const [enableSubmit, setEnableSubmit] = useState(true);
//   const [checkRequiredFields, setCheckRequiredFields] = useState(false);

//   // const tenantId = Digit.ULBService.getCurrentTenantId();
//     const stateId = Digit.ULBService.getStateId();

//   // const { isLoading, data } = Digit.Hooks.ptr.usePetMDMS(stateId, "PetService", "Documents");
//   const { isLoading, data } = Digit.Hooks.pt.usePropertyMDMS(stateId, "NDC", [
//     "Documents",
//   ]);
//   console.log("formDataINPTRDOCUMENT", documents, formData);

//   const handleSubmit = () => {
//     let document = formData.documents;
//     let documentStep;
//     documentStep = { ...document, documents: documents };
//     onSelect(config.key, documentStep);
//   };
//   const onSkip = () => onSelect();
//   function onAdd() {}

//   useEffect(() => {
//     let count = 0;
//     data?.NDC?.Documents?.forEach((doc) => {
//       let isRequiredSatisfied = false;
//       documents?.forEach((selectedDoc) => {
//         if (doc.required && selectedDoc?.documentType?.includes(doc.code) && selectedDoc?.filestoreId) {
//           isRequiredSatisfied = true;
//         }
//       });
//       if (!isRequiredSatisfied && doc.required) count = count + 1;
//     });
//     if ((count === 0) && (documents?.length > 0)) setEnableSubmit(false);
//     else setEnableSubmit(true);
//   }, [documents, checkRequiredFields, data]);

//   return (
//     <div>
//       {/* <Timeline currentStep={4} /> */}
//       {!isLoading ? (
//         <FormStep t={t} config={config} onSelect={handleSubmit} onSkip={onSkip} isDisabled={enableSubmit} onAdd={onAdd}>
//            {data?.NDC?.Documents?.map((document, index) => {
//             return (
//               <PTRSelectDocument
//                 key={index}
//                 document={document}
//                 t={t}
//                 error={error}
//                 setError={setError}
//                 setDocuments={setDocuments}
//                 documents={documents}
//                 setCheckRequiredFields={setCheckRequiredFields}
//                 handleSubmit={handleSubmit}
//               />
//             );
//           })}
//           {error && <Toast label={error} onClose={() => setError(null)} error />}
//         </FormStep>
//       ) : (
//         <Loader />
//       )}
//     </div>
//   );
// };

// function PTRSelectDocument({
//   t,
//   document: doc,
//   setDocuments,
//   setError,
//   documents,
//   action,
//   formData,
//   handleSubmit,
//   id,

// }) {
//   const filteredDocument = documents?.filter((item) => item?.documentType?.includes(doc?.code))[0];
//   // console.log("filetetetetet",filteredDocument, documents, doc);

//   const tenantId = Digit.ULBService.getCurrentTenantId();
//   const [selectedDocument, setSelectedDocument] = useState(
//     filteredDocument
//       ? { ...filteredDocument, active: doc?.active === true, code: filteredDocument?.documentType }
//       : doc?.dropdownData?.length === 1
//       ? doc?.dropdownData[0]
//       : {}
//   );

//   const [file, setFile] = useState(null);
//   const [uploadedFile, setUploadedFile] = useState(() => filteredDocument?.filestoreId || null);
//   const [fieldError, setFieldError] = useState(null);
//   const [touched, setTouched] = useState(false);

//   const handlePTRSelectDocument = (value) => setSelectedDocument(value);

//   function selectfile(e) {
//     const selected = e.target.files && e.target.files[0];
//     if (!selected) return;

//     setTouched(true);
//     setFieldError(null);

//     const maxSize = 2 * 1024 * 1024; // 2 MB
//     const allowedExtensions = [".pdf", ".jpeg", ".jpg", ".png"];
//     const nameLower = selected.name?.toLowerCase?.() || "";
//     const hasAllowedExt = allowedExtensions.some((ext) => nameLower.endsWith(ext));

//     if (!hasAllowedExt) {
//       setFieldError(t("CS_FILE_INVALID_TYPE"));
//       return;
//     }
//     if (selected.size >= maxSize) {
//       setFieldError(t("CS_MAXIMUM_UPLOAD_SIZE_EXCEEDED"));
//       return;
//     }

//     setFile(selected);
//   }
//   const { dropdownData } = doc;

//   var dropDownData = dropdownData;

//   const [isHidden, setHidden] = useState(false);
//   const [getLoading, setLoading] = useState(false);

//   useEffect(() => {
//     if (selectedDocument?.code) {
//       console.log("selectedDocument", documents);
//       setDocuments((prev) => {
//         const filteredDocumentsByDocumentType = prev?.filter((item) => item?.documentType !== selectedDocument?.code);

//         if (uploadedFile?.length === 0 || uploadedFile === null) {
//           return filteredDocumentsByDocumentType;
//         }

//         const filteredDocumentsByFileStoreId = filteredDocumentsByDocumentType?.filter((item) => item?.fileStoreId !== uploadedFile) || [];
//         return [
//           ...filteredDocumentsByFileStoreId,
//           {
//             documentType: selectedDocument?.code,
//             filestoreId: uploadedFile,
//             documentUid: uploadedFile,
//           },
//         ];
//       });
//     }

//   }, [uploadedFile, selectedDocument]);

//   useEffect(() => {
//     if(documents?.length>0) {
//       console.log("documents", documents);
//       handleSubmit();
//     }
//   },[documents]);

//   useEffect(() => {
//     if (action === "update") {
//       const originalDoc = formData?.originalData?.documents?.filter((e) => e.documentType.includes(doc?.code))[0];
//       const docType = dropDownData
//         .filter((e) => e.code === originalDoc?.documentType)
//         .map((e) => ({ ...e, i18nKey: e?.code?.replaceAll(".", "_") }))[0];
//       if (!docType) setHidden(true);
//       else {
//         setSelectedDocument(docType);
//         setUploadedFile(originalDoc?.fileStoreId);
//       }
//     } else if (action === "create") {
//     }
//   }, []);

//   useEffect(() => {
//     if(!doc?.hasDropdown){
//       setSelectedDocument({ code: doc?.code, i18nKey: doc?.code?.replaceAll(".", "_") });
//       // setHidden(true);
//     }
//   },[])

//   useEffect(() => {
//     (async () => {
//       setError(null);
//       if (file) {
//         if (fieldError) return; // Do not proceed with upload if validation failed
//         setLoading(true);
//         try {
//           setUploadedFile(null);
//           const response = await Digit.UploadServices.Filestorage("PTR", file, Digit.ULBService.getStateId());
//           setLoading(false);
//           if (response?.data?.files?.length > 0) {
//             setUploadedFile(response?.data?.files[0]?.fileStoreId);
//           } else {
//             setError(t("CS_FILE_UPLOAD_ERROR"));
//           }
//         } catch (err) {
//           setLoading(false);
//           setError(t("CS_FILE_UPLOAD_ERROR"));
//         }
//       }
//     })();
//   }, [file, fieldError]);

//   useEffect(() => {
//     if (isHidden) setUploadedFile(null);
//   }, [isHidden]);

//   return (
//     <div style={{ marginBottom: "24px" }}>
//       {getLoading && <Loader />}
//       {doc?.hasDropdown ? (
//         <LabelFieldPair>
//           <CardLabel className="card-label-smaller">{t(doc?.code.replaceAll(".", "_"))}</CardLabel>
//           <Dropdown
//             className="form-field"
//             selected={selectedDocument}
//             style={{ width: "100%" }}
//             option={dropDownData.map((e) => ({ ...e, i18nKey: e.code?.replaceAll(".", "_") }))}
//             select={handlePTRSelectDocument}
//             optionKey="i18nKey"
//             t={t}
//           />
//         </LabelFieldPair>
//       ) : null}
//       {!doc?.hasDropdown ? (
//         <LabelFieldPair>
//           <CardLabel className="card-label-smaller">{t(doc?.code.replaceAll(".", "_")) + "  *"}</CardLabel>
//         </LabelFieldPair>
//       ) : null}
//       <LabelFieldPair>
//         <CardLabel className="card-label-smaller"></CardLabel>
//         <div className="field">
//           <UploadFile
//             onUpload={selectfile}
//             onDelete={() => {
//               setUploadedFile(null);
//               setFieldError(null);
//               setTouched(true);
//             }}
//             id={id}
//             message={uploadedFile ? `1 ${t(`CS_ACTION_FILEUPLOADED`)}` : t(`CS_ACTION_NO_FILEUPLOADED`)}
//             textStyles={{ width: "100%" }}
//             inputStyles={{ width: "280px" }}
//             accept=".pdf, .jpeg, .jpg, .png"   //  to accept document of all kind
//             buttonType="button"
//             error={Boolean(fieldError || (touched && doc?.required && !uploadedFile))}
//           />
//           {fieldError ? (
//             <div style={{ color: "#d4351c", fontSize: "14px", marginTop: "4px" }}>{fieldError}</div>
//           ) : null}
//           {!fieldError && touched && doc?.required && !uploadedFile ? (
//             <div style={{ color: "#d4351c", fontSize: "14px", marginTop: "4px" }}>{t("CORE_COMMON_REQUIRED")}</div>
//           ) : null}
//         </div>
//       </LabelFieldPair>
//     </div>
//   );
// }

// export default PTRSelectProofIdentity;

// import React, { use, useEffect, useState } from "react";
// import { CardLabel, Dropdown, UploadFile, Toast, Loader, FormStep, LabelFieldPair } from "@mseva/digit-ui-react-components";
// import { validateFile, FILE_POLICY } from "../utils/validation";
// import Timeline from "../components/PTRTimeline";

// const PTRSelectProofIdentity = ({ t, config, onSelect, userType, formData, setError: setFormError, clearErrors: clearFormErrors, formState }) => {
//   const tenantId = Digit.ULBService.getStateId();
//   const [documents, setDocuments] = useState(formData?.documents?.documents);
//   const [error, setError] = useState(null);
//   const [enableSubmit, setEnableSubmit] = useState(true);
//   const [checkRequiredFields, setCheckRequiredFields] = useState(false);

//   // const tenantId = Digit.ULBService.getCurrentTenantId();
//     const stateId = Digit.ULBService.getStateId();

//   // const { isLoading, data } = Digit.Hooks.ptr.usePetMDMS(stateId, "PetService", "Documents");
//   const { isLoading, data } = Digit.Hooks.pt.usePropertyMDMS(stateId, "NDC", [
//     "Documents",
//   ]);
//   console.log("formDataINPTRDOCUMENT", documents, formData);

//   const handleSubmit = () => {
//     let document = formData.documents;
//     let documentStep;
//     documentStep = { ...document, documents: documents };
//     onSelect(config.key, documentStep);
//   };
//   const onSkip = () => onSelect();
//   function onAdd() {}

//   useEffect(() => {
//     let count = 0;
//     data?.NDC?.Documents?.forEach((doc) => {
//       let isRequiredSatisfied = false;
//       documents?.forEach((selectedDoc) => {
//         if (doc.required && selectedDoc?.documentType?.includes(doc.code) && selectedDoc?.filestoreId) {
//           isRequiredSatisfied = true;
//         }
//       });
//       if (!isRequiredSatisfied && doc.required) count = count + 1;
//     });
//     if ((count === 0) && (documents?.length > 0)) setEnableSubmit(false);
//     else setEnableSubmit(true);
//   }, [documents, checkRequiredFields, data]);

//   return (
//     <div>
//       {/* <Timeline currentStep={4} /> */}
//       {!isLoading ? (
//         <FormStep t={t} config={config} onSelect={handleSubmit} onSkip={onSkip} isDisabled={enableSubmit} onAdd={onAdd}>
//            {data?.NDC?.Documents?.map((document, index) => {
//             return (
//               <PTRSelectDocument
//                 key={index}
//                 document={document}
//                 t={t}
//                 error={error}
//                 setError={setError}
//                 setDocuments={setDocuments}
//                 documents={documents}
//                 setCheckRequiredFields={setCheckRequiredFields}
//                 handleSubmit={handleSubmit}
//               />
//             );
//           })}
//           {error && <Toast label={error} onClose={() => setError(null)} error />}
//         </FormStep>
//       ) : (
//         <Loader />
//       )}
//     </div>
//   );
// };

// function PTRSelectDocument({
//   t,
//   document: doc,
//   setDocuments,
//   setError,
//   documents,
//   action,
//   formData,
//   handleSubmit,
//   id,

// }) {
//   const filteredDocument = documents?.filter((item) => item?.documentType?.includes(doc?.code))[0];
//   // console.log("filetetetetet",filteredDocument, documents, doc);

//   const tenantId = Digit.ULBService.getCurrentTenantId();
//   const [selectedDocument, setSelectedDocument] = useState(
//     filteredDocument
//       ? { ...filteredDocument, active: doc?.active === true, code: filteredDocument?.documentType }
//       : doc?.dropdownData?.length === 1
//       ? doc?.dropdownData[0]
//       : {}
//   );

//   const [file, setFile] = useState(null);
//   const [uploadedFile, setUploadedFile] = useState(() => filteredDocument?.filestoreId || null);
//   const [fieldError, setFieldError] = useState(null);
//   const [touched, setTouched] = useState(false);

//   const handlePTRSelectDocument = (value) => setSelectedDocument(value);

//   function selectfile(e) {
//     const selected = e.target.files && e.target.files[0];
//     if (!selected) return;

//     setTouched(true);
//     setFieldError(null);
//     const errKey = validateFile(selected, FILE_POLICY);
//     if (errKey) {
//       setFieldError(t(errKey));
//       return;
//     }

//     setFile(selected);
//   }
//   const { dropdownData } = doc;

//   var dropDownData = dropdownData;

//   const [isHidden, setHidden] = useState(false);
//   const [getLoading, setLoading] = useState(false);

//   useEffect(() => {
//     if (selectedDocument?.code) {
//       console.log("selectedDocument", documents);
//       setDocuments((prev) => {
//         const filteredDocumentsByDocumentType = prev?.filter((item) => item?.documentType !== selectedDocument?.code);

//         if (uploadedFile?.length === 0 || uploadedFile === null) {
//           return filteredDocumentsByDocumentType;
//         }

//         const filteredDocumentsByFileStoreId = filteredDocumentsByDocumentType?.filter((item) => item?.fileStoreId !== uploadedFile) || [];
//         return [
//           ...filteredDocumentsByFileStoreId,
//           {
//             documentType: selectedDocument?.code,
//             filestoreId: uploadedFile,
//             documentUid: uploadedFile,
//           },
//         ];
//       });
//     }

//   }, [uploadedFile, selectedDocument]);

//   useEffect(() => {
//     if(documents?.length>0) {
//       console.log("documents", documents);
//       handleSubmit();
//     }
//   },[documents]);

//   useEffect(() => {
//     if (action === "update") {
//       const originalDoc = formData?.originalData?.documents?.filter((e) => e.documentType.includes(doc?.code))[0];
//       const docType = dropDownData
//         .filter((e) => e.code === originalDoc?.documentType)
//         .map((e) => ({ ...e, i18nKey: e?.code?.replaceAll(".", "_") }))[0];
//       if (!docType) setHidden(true);
//       else {
//         setSelectedDocument(docType);
//         setUploadedFile(originalDoc?.fileStoreId);
//       }
//     } else if (action === "create") {
//     }
//   }, []);

//   useEffect(() => {
//     if(!doc?.hasDropdown){
//       setSelectedDocument({ code: doc?.code, i18nKey: doc?.code?.replaceAll(".", "_") });
//       // setHidden(true);
//     }
//   },[])

//   useEffect(() => {
//     (async () => {
//       setError(null);
//       if (file) {
//         if (fieldError) return; // Do not proceed with upload if validation failed
//         setLoading(true);
//         try {
//           setUploadedFile(null);
//           const response = await Digit.UploadServices.Filestorage("PTR", file, Digit.ULBService.getStateId());
//           setLoading(false);
//           if (response?.data?.files?.length > 0) {
//             setUploadedFile(response?.data?.files[0]?.fileStoreId);
//           } else {
//             setError(t("CS_FILE_UPLOAD_ERROR"));
//           }
//         } catch (err) {
//           setLoading(false);
//           setError(t("CS_FILE_UPLOAD_ERROR"));
//         }
//       }
//     })();
//   }, [file, fieldError]);

//   useEffect(() => {
//     if (isHidden) setUploadedFile(null);
//   }, [isHidden]);

//   return (
//     <div style={{ marginBottom: "24px" }}>
//       {getLoading && <Loader />}
//       {doc?.hasDropdown ? (
//         <LabelFieldPair>
//           <CardLabel className="card-label-smaller">{t(doc?.code.replaceAll(".", "_"))}</CardLabel>
//           <Dropdown
//             className="form-field"
//             selected={selectedDocument}
//             style={{ width: "100%" }}
//             option={dropDownData.map((e) => ({ ...e, i18nKey: e.code?.replaceAll(".", "_") }))}
//             select={handlePTRSelectDocument}
//             optionKey="i18nKey"
//             t={t}
//           />
//         </LabelFieldPair>
//       ) : null}
//       {!doc?.hasDropdown ? (
//         <LabelFieldPair>
//           <CardLabel className="card-label-smaller">{t(doc?.code.replaceAll(".", "_")) + "  *"}</CardLabel>
//         </LabelFieldPair>
//       ) : null}
//       <LabelFieldPair>
//         <CardLabel className="card-label-smaller"></CardLabel>
//         <div className="field">
//           <UploadFile
//             onUpload={selectfile}
//             onDelete={() => {
//               setUploadedFile(null);
//               setFieldError(null);
//               setTouched(true);
//             }}
//             id={id}
//             message={uploadedFile ? `1 ${t(`CS_ACTION_FILEUPLOADED`)}` : t(`CS_ACTION_NO_FILEUPLOADED`)}
//             textStyles={{ width: "100%" }}
//             inputStyles={{ width: "280px" }}
//             accept=".pdf, .jpeg, .jpg, .png"   //  to accept document of all kind
//             buttonType="button"
//             error={Boolean(fieldError || (touched && doc?.required && !uploadedFile))}
//           />
//           {fieldError ? (
//             <div style={{ color: "#d4351c", fontSize: "14px", marginTop: "4px" }}>{fieldError}</div>
//           ) : null}
//           {!fieldError && touched && doc?.required && !uploadedFile ? (
//             <div style={{ color: "#d4351c", fontSize: "14px", marginTop: "4px" }}>{t("CORE_COMMON_REQUIRED")}</div>
//           ) : null}
//         </div>
//       </LabelFieldPair>
//     </div>
//   );
// }

// export default PTRSelectProofIdentity;

// import React, { useEffect, useState } from "react";
// import {
//   CardLabel,
//   Dropdown,
//   UploadFile,
//   Toast,
//   Loader,
//   FormStep,
//   LabelFieldPair,
// } from "@mseva/digit-ui-react-components";
// import Timeline from "../components/PTRTimeline";

// const PTRSelectProofIdentity = ({
//   t,
//   config,
//   onSelect,
//   userType,
//   formData,
// }) => {
//   const stateId = Digit.ULBService.getStateId();
//   const [documents, setDocuments] = useState(formData?.documents?.documents || []);
//   const [formErrors, setFormErrors] = useState({});
//   const [toastError, setToastError] = useState(null);

//   const FILE_POLICY = {
//     maxBytes: 2 * 1024 * 1024, // 5 MB
//     allowedExtensions: [".pdf", ".jpeg", ".jpg", ".png"],
//   };

//   const validateFile = (file) => {
//     if (!file) return null;
//     const { maxBytes, allowedExtensions } = FILE_POLICY;
//     const nameLower = file?.name?.toLowerCase?.() || "";
//     const okType = allowedExtensions.some((ext) => nameLower.endsWith(ext));
//     if (!okType) return "CS_FILE_INVALID_TYPE";
//     if (file.size > maxBytes) return "CS_MAXIMUM_UPLOAD_SIZE_EXCEEDED";
//     return null;
//   };

//   const makeDocumentsValidator = (mdms) => {
//     const requiredCodes = (mdms?.NDC?.Documents || [])
//       .filter((d) => d?.required)
//       .map((d) => d.code);

//     return (documents = []) => {
//       const errors = {};
//       if (!requiredCodes?.length) return errors;
//       for (const code of requiredCodes) {
//         const satisfied = documents?.some(
//           (doc) =>
//             doc?.documentType?.includes?.(code) &&
//             (doc?.filestoreId || doc?.fileStoreId)
//         );
//         if (!satisfied) {
//           errors.missingRequired = "PTR_MISSING_REQUIRED_DOCUMENTS";
//           break;
//         }
//       }
//       return errors;
//     };
//   };

//   const { isLoading, data } = Digit.Hooks.pt.usePropertyMDMS(stateId, "NDC", [
//     "Documents",
//   ]);

//   // Centralized required-doc validation
//   useEffect(() => {
//     if (data) {
//       const validateDocs = makeDocumentsValidator(data);
//       const errors = validateDocs(documents);
//       setFormErrors(errors);
//     }
//   }, [documents, data]);

//   const handleSubmit = () => {
//     if (Object.keys(formErrors).length > 0) {
//       setToastError(t(formErrors.missingRequired || "PTR_VALIDATION_ERROR"));
//       return;
//     }
//     let documentStep = { ...formData.documents, documents };
//     onSelect(config.key, documentStep);
//   };

//   const onSkip = () => onSelect();

//   return (
//     <div>
//       {!isLoading ? (
//         <FormStep
//           t={t}
//           config={config}
//           onSelect={handleSubmit}
//           onSkip={onSkip}
//           isDisabled={Object.keys(formErrors).length > 0}
//         >
//           {data?.NDC?.Documents?.map((document, index) => (
//             <PTRSelectDocument
//               key={index}
//               document={document}
//               t={t}
//               setDocuments={setDocuments}
//               documents={documents}
//               validateFile={validateFile}
//               makeDocumentsValidator={makeDocumentsValidator}
//               mdms={data}
//               setFormErrors={setFormErrors}
//             />
//           ))}
//           {toastError && (
//             <Toast label={toastError} onClose={() => setToastError(null)} error />
//           )}
//         </FormStep>
//       ) : (
//         <Loader />
//       )}
//     </div>
//   );
// };

// function PTRSelectDocument({
//   t,
//   document: doc,
//   setDocuments,
//   documents,
//   validateFile,
//   makeDocumentsValidator,
//   mdms,
//   setFormErrors,
// }) {
//   const [selectedDocument, setSelectedDocument] = useState({});
//   const [file, setFile] = useState(null);
//   const [uploadedFile, setUploadedFile] = useState(null);
//   const [fieldError, setFieldError] = useState(null);
//   const [touched, setTouched] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const handlePTRSelectDocument = (value) => setSelectedDocument(value);

//   function selectfile(e) {
//     const selected = e.target.files && e.target.files[0];
//     if (!selected) return;

//     setTouched(true);
//     const errKey = validateFile(selected);
//     if (errKey) {
//       setFieldError(t(errKey));
//       updateParentDocs(null);
//       return;
//     }
//     setFieldError(null);
//     setFile(selected);
//   }

//   useEffect(() => {
//     if (file) {
//       (async () => {
//         setLoading(true);
//         try {
//           const response = await Digit.UploadServices.Filestorage(
//             "PTR",
//             file,
//             Digit.ULBService.getStateId()
//           );
//           setLoading(false);
//           if (response?.data?.files?.length > 0) {
//             const fileId = response?.data?.files[0]?.fileStoreId;
//             setUploadedFile(fileId);
//             updateParentDocs(fileId);
//           } else {
//             setFieldError(t("CS_FILE_UPLOAD_ERROR"));
//             updateParentDocs(null);
//           }
//         } catch {
//           setLoading(false);
//           setFieldError(t("CS_FILE_UPLOAD_ERROR"));
//           updateParentDocs(null);
//         }
//       })();
//     }
//   }, [file]);

//   const updateParentDocs = (fileId) => {
//     setDocuments((prev) => {
//       const withoutCurrent = prev?.filter(
//         (item) => item?.documentType !== doc?.code
//       );
//       if (!fileId) return withoutCurrent;
//       return [
//         ...withoutCurrent,
//         {
//           documentType: doc?.code,
//           filestoreId: fileId,
//           documentUid: fileId,
//         },
//       ];
//     });

//     const errors = makeDocumentsValidator(mdms)([
//       ...documents.filter((d) => d.documentType !== doc?.code),
//       ...(fileId
//         ? [{ documentType: doc?.code, filestoreId: fileId }]
//         : []),
//     ]);
//     setFormErrors(errors);
//   };

//   return (
//     <div style={{ marginBottom: "24px" }}>
//       {loading && <Loader />}
//       {doc?.hasDropdown ? (
//         <LabelFieldPair>
//           <CardLabel className="card-label-smaller">
//             {t(doc?.code.replaceAll(".", "_"))}
//           </CardLabel>
//           <Dropdown
//             className="form-field"
//             selected={selectedDocument}
//             style={{ width: "100%" }}
//             option={doc?.dropdownData?.map((e) => ({
//               ...e,
//               i18nKey: e.code?.replaceAll(".", "_"),
//             }))}
//             select={handlePTRSelectDocument}
//             optionKey="i18nKey"
//             t={t}
//           />
//         </LabelFieldPair>
//       ) : (
//         <LabelFieldPair>
//           <CardLabel className="card-label-smaller">
//             {t(doc?.code.replaceAll(".", "_")) + (doc?.required ? "  *" : "")}
//           </CardLabel>
//         </LabelFieldPair>
//       )}

//       <LabelFieldPair>
//         <CardLabel className="card-label-smaller"></CardLabel>
//         <div className="field">
//           <UploadFile
//             onUpload={selectfile}
//             onDelete={() => {
//               setUploadedFile(null);
//               setFieldError(null);
//               setTouched(true);
//               updateParentDocs(null);
//             }}
//             message={
//               uploadedFile
//                 ? `1 ${t(`CS_ACTION_FILEUPLOADED`)}`
//                 : t(`CS_ACTION_NO_FILEUPLOADED`)
//             }
//             textStyles={{ width: "100%" }}
//             inputStyles={{ width: "280px" }}
//             accept=".pdf, .jpeg, .jpg, .png"
//             buttonType="button"
//             error={Boolean(
//               fieldError || (touched && doc?.required && !uploadedFile)
//             )}
//           />
//           {fieldError && (
//             <div style={{ color: "#d4351c", fontSize: "14px", marginTop: "4px" }}>
//               {fieldError}
//             </div>
//           )}
//           {!fieldError && touched && doc?.required && !uploadedFile && (
//             <div style={{ color: "#d4351c", fontSize: "14px", marginTop: "4px" }}>
//               {t("CORE_COMMON_REQUIRED")}
//             </div>
//           )}
//         </div>
//       </LabelFieldPair>
//     </div>
//   );
// }

// export default PTRSelectProofIdentity;

// import React, { useEffect, useState } from "react";
// import {
//   CardLabel,
//   Dropdown,
//   UploadFile,
//   Toast,
//   Loader,
//   FormStep,
//   LabelFieldPair,
// } from "@mseva/digit-ui-react-components";
// import Timeline from "../components/PTRTimeline";

// const PTRSelectProofIdentity = ({
//   t,
//   config,
//   onSelect,
//   userType,
//   formData,
// }) => {
//   const stateId = Digit.ULBService.getStateId();
//   const [documents, setDocuments] = useState(formData?.documents?.documents || []);
//   const [formErrors, setFormErrors] = useState({});
//   const [toastError, setToastError] = useState(null);

//   const FILE_POLICY = {
//     maxBytes: 5 * 1024 * 1024, // 5 MB
//     allowedExtensions: [".pdf", ".jpeg", ".jpg", ".png"],
//   };

//   const validateFile = (file) => {
//     if (!file) return null;
//     const { maxBytes, allowedExtensions } = FILE_POLICY;
//     const nameLower = file?.name?.toLowerCase?.() || "";
//     const okType = allowedExtensions.some((ext) => nameLower.endsWith(ext));
//     if (!okType) return "CS_FILE_INVALID_TYPE";
//     if (file.size > maxBytes) return "CS_MAXIMUM_UPLOAD_SIZE_EXCEEDED";
//     return null;
//   };

//   const makeDocumentsValidator = (mdms) => {
//     const requiredCodes = (mdms?.NDC?.Documents || [])
//       .filter((d) => d?.required)
//       .map((d) => d.code);

//     return (documents = []) => {
//       const errors = {};
//       if (!requiredCodes?.length) return errors;
//       for (const code of requiredCodes) {
//         const satisfied = documents?.some(
//           (doc) =>
//             doc?.documentType?.includes?.(code) &&
//             (doc?.filestoreId || doc?.fileStoreId)
//         );
//         if (!satisfied) {
//           errors.missingRequired = "PTR_MISSING_REQUIRED_DOCUMENTS";
//           break;
//         }
//       }
//       return errors;
//     };
//   };

//   const { isLoading, data } = Digit.Hooks.pt.usePropertyMDMS(stateId, "NDC", [
//     "Documents",
//   ]);

//   // Centralized required-doc validation
//   useEffect(() => {
//     if (data) {
//       const validateDocs = makeDocumentsValidator(data);
//       const errors = validateDocs(documents);
//       setFormErrors(errors);
//     }
//   }, [documents, data]);

//   const handleSubmit = () => {
//     if (Object.keys(formErrors).length > 0) {
//       setToastError(t(formErrors.missingRequired || "PTR_VALIDATION_ERROR"));
//       return;
//     }
//     let documentStep = { ...formData.documents, documents };
//     onSelect(config.key, documentStep);
//   };

//   const onSkip = () => onSelect();

//   return (
//     <div>
//       {!isLoading ? (
//         <FormStep
//           t={t}
//           config={config}
//           onSelect={handleSubmit}
//           onSkip={onSkip}
//           isDisabled={Object.keys(formErrors).length > 0}
//         >
//           {data?.NDC?.Documents?.map((document, index) => (
//             <PTRSelectDocument
//               key={index}
//               document={document}
//               t={t}
//               setDocuments={setDocuments}
//               documents={documents}
//               validateFile={validateFile}
//               makeDocumentsValidator={makeDocumentsValidator}
//               mdms={data}
//               setFormErrors={setFormErrors}
//             />
//           ))}
//           {toastError && (
//             <Toast label={toastError} onClose={() => setToastError(null)} error />
//           )}
//         </FormStep>
//       ) : (
//         <Loader />
//       )}
//     </div>
//   );
// };

// function PTRSelectDocument({
//   t,
//   document: doc,
//   setDocuments,
//   documents,
//   validateFile,
//   makeDocumentsValidator,
//   mdms,
//   setFormErrors,
// }) {
//   const [selectedDocument, setSelectedDocument] = useState({});
//   const [file, setFile] = useState(null);
//   const [uploadedFile, setUploadedFile] = useState(null);
//   const [fieldError, setFieldError] = useState(null);
//   console.log('fieldError', fieldError)
//   const [touched, setTouched] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const handlePTRSelectDocument = (value) => setSelectedDocument(value);

//   function selectfile(e) {
//     const selected = e.target.files && e.target.files[0];
//     if (!selected) return;

//     setTouched(true);
//     const errKey = validateFile(selected);
//     if (errKey) {
//       setFieldError(t(errKey));
//       updateParentDocs(null);
//       return;
//     }
//     setFieldError(null);
//     setFile(selected);
//   }

//   useEffect(() => {
//     if (file) {
//       (async () => {
//         setLoading(true);
//         try {
//           const response = await Digit.UploadServices.Filestorage(
//             "PTR",
//             file,
//             Digit.ULBService.getStateId()
//           );
//           setLoading(false);
//           if (response?.data?.files?.length > 0) {
//             const fileId = response?.data?.files[0]?.fileStoreId;
//             setUploadedFile(fileId);
//             updateParentDocs(fileId);
//           } else {
//             setFieldError(t("CS_FILE_UPLOAD_ERROR"));
//             updateParentDocs(null);
//           }
//         } catch {
//           setLoading(false);
//           setFieldError(t("CS_FILE_UPLOAD_ERROR"));
//           updateParentDocs(null);
//         }
//       })();
//     }
//   }, [file]);

//   const updateParentDocs = (fileId) => {
//     setDocuments((prev) => {
//       const withoutCurrent = prev?.filter(
//         (item) => item?.documentType !== doc?.code
//       );
//       if (!fileId) return withoutCurrent;
//       return [
//         ...withoutCurrent,
//         {
//           documentType: doc?.code,
//           filestoreId: fileId,
//           documentUid: fileId,
//         },
//       ];
//     });

//     const errors = makeDocumentsValidator(mdms)([
//       ...documents.filter((d) => d.documentType !== doc?.code),
//       ...(fileId
//         ? [{ documentType: doc?.code, filestoreId: fileId }]
//         : []),
//     ]);
//     setFormErrors(errors);
//   };

//   return (
//     <div style={{ marginBottom: "24px" }}>
//       {loading && <Loader />}
//       {doc?.hasDropdown ? (
//         <LabelFieldPair>
//           <CardLabel className="card-label-smaller">
//             {t(doc?.code.replaceAll(".", "_"))}
//           </CardLabel>
//           <Dropdown
//             className="form-field"
//             selected={selectedDocument}
//             style={{ width: "100%" }}
//             option={doc?.dropdownData?.map((e) => ({
//               ...e,
//               i18nKey: e.code?.replaceAll(".", "_"),
//             }))}
//             select={handlePTRSelectDocument}
//             optionKey="i18nKey"
//             t={t}
//           />
//         </LabelFieldPair>
//       ) : (
//         <LabelFieldPair>
//           <CardLabel className="card-label-smaller">
//             {t(doc?.code.replaceAll(".", "_")) + (doc?.required ? "  *" : "")}
//           </CardLabel>
//         </LabelFieldPair>
//       )}

//       <LabelFieldPair>
//         <CardLabel className="card-label-smaller"></CardLabel>
//         <div className="field">
//           <UploadFile
//             onUpload={selectfile}
//             onDelete={() => {
//               setUploadedFile(null);
//               setFieldError(null);
//               setTouched(true);
//               updateParentDocs(null);
//             }}
//             message={
//               uploadedFile
//                 ? `1 ${t(`CS_ACTION_FILEUPLOADED`)}`
//                 : t(`CS_ACTION_NO_FILEUPLOADED`)
//             }
//             textStyles={{ width: "100%" }}
//             inputStyles={{ width: "280px" }}
//             accept=".pdf, .jpeg, .jpg, .png"
//             buttonType="button"
//             error={Boolean(
//               fieldError || (touched && doc?.required && !uploadedFile)
//             )}
//           />
//           {fieldError && (
//             <div style={{ color: "#d4351c", fontSize: "14px", marginTop: "4px" }}>
//               {fieldError}
//             </div>
//           )}
//           {!fieldError && touched && doc?.required && !uploadedFile && (
//             <div style={{ color: "#d4351c", fontSize: "14px", marginTop: "4px" }}>
//               {t("CORE_COMMON_REQUIRED")}
//             </div>
//           )}
//         </div>
//       </LabelFieldPair>
//     </div>
//   );
// }

// export default PTRSelectProofIdentity;

import React, { useEffect, useState } from "react";
import { CardLabel, Dropdown, UploadFile, Toast, Loader, FormStep, LabelFieldPair } from "@mseva/digit-ui-react-components";
import Timeline from "../components/PTRTimeline";

const PTRSelectProofIdentity = ({ t, config, onSelect, userType, formData }) => {
  const stateId = Digit.ULBService.getStateId();
  const [documents, setDocuments] = useState(formData?.documents?.documents || []);
  const [formErrors, setFormErrors] = useState({});
  const [toastError, setToastError] = useState(null);
  console.log("documents", documents);
  console.log("formData?.documents?.documents", formData?.documents?.documents);
  console.log("formData", formData);
  const FILE_POLICY = {
    maxBytes: 5 * 1024 * 1024, // 5 MB
    allowedExtensions: [".pdf", ".jpeg", ".jpg", ".png"],
  };

  const validateFile = (file) => {
    if (!file) return null;
    const { maxBytes, allowedExtensions } = FILE_POLICY;
    const nameLower = file?.name?.toLowerCase?.() || "";
    const okType = allowedExtensions.some((ext) => nameLower.endsWith(ext));
    if (!okType) return "CS_FILE_INVALID_TYPE";
    if (file.size > maxBytes) return "CS_MAXIMUM_UPLOAD_SIZE_EXCEEDED";
    return null;
  };

  const makeDocumentsValidator = (mdms) => {
    const requiredCodes = (mdms?.NDC?.Documents || []).filter((d) => d?.required).map((d) => d.code);

    return (documents = []) => {
      const errors = {};
      if (!requiredCodes?.length) return errors;
      for (const code of requiredCodes) {
        const satisfied = documents?.some((doc) => doc?.documentType?.includes?.(code) && (doc?.filestoreId || doc?.fileStoreId));
        if (!satisfied) {
          errors.missingRequired = "PTR_MISSING_REQUIRED_DOCUMENTS";
          break;
        }
      }
      return errors;
    };
  };

  const { isLoading, data } = Digit.Hooks.pt.usePropertyMDMS(stateId, "NDC", ["Documents"]);

  // Centralized required-doc validation
  useEffect(() => {
    if (data) {
      const validateDocs = makeDocumentsValidator(data);
      const errors = validateDocs(documents);
      setFormErrors(errors);
    }
  }, [documents, data]);

  useEffect(() => {
    if (formData?.documents?.documents) {
      setDocuments(formData.documents.documents);
    }
  }, [formData]);

  // 🆕 Immediately sync documents to Redux so parent always has latest
  useEffect(() => {
    if (documents?.length >= 0) {
      onSelect(config.key, { ...formData.documents, documents });
    }
  }, [documents]);

  const handleSubmit = () => {
    if (Object.keys(formErrors).length > 0) {
      setToastError(t(formErrors.missingRequired || "PTR_VALIDATION_ERROR"));
      return;
    }
    let documentStep = { ...formData.documents, documents };
    onSelect(config.key, documentStep);
  };

  const onSkip = () => onSelect();

  return (
    <div>
      {!isLoading ? (
        <FormStep t={t} config={config} onSelect={handleSubmit} onSkip={onSkip} isDisabled={Object.keys(formErrors).length > 0}>
          {data?.NDC?.Documents?.map((document, index) => (
            <PTRSelectDocument
              key={index}
              document={document}
              t={t}
              setDocuments={setDocuments}
              documents={documents}
              validateFile={validateFile}
              makeDocumentsValidator={makeDocumentsValidator}
              mdms={data}
              setFormErrors={setFormErrors}
            />
          ))}
          {toastError && <Toast label={toastError} onClose={() => setToastError(null)} error />}
        </FormStep>
      ) : (
        <Loader />
      )}
    </div>
  );
};

function PTRSelectDocument({ t, document: doc, setDocuments, documents, validateFile, makeDocumentsValidator, mdms, setFormErrors }) {
  const [selectedDocument, setSelectedDocument] = useState({});
  const [file, setFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fieldError, setFieldError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePTRSelectDocument = (value) => setSelectedDocument(value);

  function selectfile(e) {
    const selected = e.target.files && e.target.files[0];
    if (!selected) return;

    const errKey = validateFile(selected);
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
    setDocuments(updatedDocs);

    const errors = makeDocumentsValidator(mdms)(updatedDocs);
    setFormErrors(errors);
  };

  // useEffect(() => {
  //   const existingDoc = documents.find((d) => d.documentType === doc?.code);

  //   console.log('existingDocss', existingDoc)
  //   if (existingDoc?.filestoreId) {
  //     setUploadedFile(existingDoc.filestoreId);
  //   }
  // }, [documents, doc?.code]);
  const errorStyle = { color: "#d4351c", fontSize: "12px", marginTop: "-16px", marginBottom: "10px" };

  return (
    <div style={{ marginBottom: "24px" }}>
      {loading && <Loader />}

      {doc?.hasDropdown ? (
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
      )}

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
            accept=".pdf, .jpeg, .jpg, .png"
            buttonType="button"
            // Only show error when there's an actual file-related error.
            // Required validation is enforced by disabling Next at the form level.
            error={Boolean(fieldError)}
          />
          {fieldError && <errorStyle style={errorStyle}>{fieldError}</errorStyle>}
        </div>
      </LabelFieldPair>
    </div>
  );
}

export default PTRSelectProofIdentity;

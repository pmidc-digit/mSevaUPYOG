import React, { useEffect, useRef, useState, Fragment, forwardRef } from "react";
import { useTranslation } from "react-i18next";
import { ButtonSelector, Close, RemoveableTag, SubmitBar } from "@mseva/digit-ui-react-components";
import { LoaderNew } from "./LoaderNew";

const getRandomId = () => {
  return Math.floor((Math.random() || 1) * 139);
};

const CloseBtn = (props) => {
  return (
    <div className="close-btn" onClick={props.onClick}>      
      <Close style={{ fill: "red" }}  />
    </div>
  );
};

const getCitizenStyles = (value) => {
  let citizenStyles = {};
  if (value == "propertyCreate") {
    citizenStyles = {
      textStyles: {
        whiteSpace: "nowrap",
        width: "100%",
        overflow: "hidden",
        textOverflow: "ellipsis",
        width: "80%",
      },
      tagStyles: {
        width: "90%",
        flexWrap: "nowrap",
      },
      inputStyles: {
        width: "44%",
        minHeight: "2rem",
        maxHeight: "3rem",
        top: "20%",
      },
      buttonStyles: {
        height: "auto",
        minHeight: "2rem",
        width: "40%",
        maxHeight: "3rem",
      },
      tagContainerStyles: {
        width: "60%",
        display: "flex",
        marginTop: "0px",
      },
      closeIconStyles: {
        width: "20px",
      },
      containerStyles: {
        padding: "10px",
        marginTop: "0px",
      },
    };
  } else if (value == "IP") {
    citizenStyles = {
      textStyles: {
        whiteSpace: "nowrap",
        maxWidth: "250px",
        overflow: "hidden",
        textOverflow: "ellipsis",
      },
      tagStyles: {
        marginLeft: "-30px",
      },
      inputStyles: {},
      closeIconStyles: {
        position: "absolute",
        marginTop: "-12px",
      },
      buttonStyles: {},
      tagContainerStyles: {},
    };
  } else if (value == "OBPS") {
    citizenStyles = {
      containerStyles: {
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        flexWrap: "wrap",
        margin: "0px",
        padding: "0px",
      },
      tagContainerStyles: {
        margin: "0px",
        display: "flex",
        justifyContent: "center",
        padding: "0px",
        width: "46%",
      },
      tagStyles: {
        height: "auto",
        padding: "5px",
        margin: 0,
        width: "100%",
        margin: "5px",
      },
      textStyles: {
        wordBreak: "break-word",
        height: "auto",
        lineHeight: "16px",
        overflow: "hidden",
        // minHeight: "35px",
        maxHeight: "34px",
      },
      inputStyles: {
        width: "43%",
        minHeight: "42px",
        maxHeight: "42px",
        top: "5px",
        left: "5px",
      },
      buttonStyles: {
        height: "auto",
        minHeight: "40px",
        width: "43%",
        maxHeight: "40px",
        margin: "5px",
        padding: "0px",
      },
      closeIconStyles: {
        width: "20px",
      },
      uploadFile: {
        minHeight: "50px",
      },
    };
  } else {
    citizenStyles = {
      textStyles: {},
      tagStyles: {},
      inputStyles: {},
      buttonStyles: {},
      tagContainerStyles: {},
    };
  }
  return citizenStyles;
};

const CustomUploadFile = (props) => {
  const { t } = useTranslation();
  const inpRef = useRef();
  const [hasFile, setHasFile] = useState(false);
  const [loader, setLoader] = useState(false);
  const [prevSate, setprevSate] = useState(null);
  const [localError, setLocalError] = useState(null);
  const user_type = Digit.SessionStorage.get("userType");
  let extraStyles = {};
  const handleChange = () => {
    if (inpRef?.current?.files?.[0]) {
      setHasFile(true);
      setprevSate(inpRef?.current?.files?.[0]);
    } else setHasFile(false);
  };
  const stateCode = Digit.ULBService.getStateId();
  const isMobile = window?.Digit?.Utils?.browser?.isMobile();

  // for common aligmnent issues added common styles
  extraStyles = getCitizenStyles("OBPS");

  // if (window.location.href.includes("/obps") || window.location.href.includes("/noc")) {
  //   extraStyles = getCitizenStyles("OBPS");
  // } else {
  //   switch (props.extraStyleName) {
  //     case "propertyCreate":
  //       extraStyles = getCitizenStyles("propertyCreate");
  //       break;
  //     case "IP":
  //       extraStyles = getCitizenStyles("IP");
  //       break;
  //     case "OBPS":
  //       extraStyles = getCitizenStyles("OBPS");
  //     default:
  //       extraStyles = getCitizenStyles("");
  //   }
  // }

  const handleDelete = () => {
    inpRef.current.value = "";
    props.onDelete();
  };

  const clearError = () => {
    setLocalError(null);
    if (props?.setError) props.setError(null);
  };

  const handleEmpty = () => {
    if (inpRef?.current?.files?.length <= 0 && prevSate !== null) {
      inpRef.current.value = "";
      props.onDelete();
    }
  };

  const isFileTypeAllowed = (file, accept) => {
    if (!accept || !file) return true; // no restriction
    const acceptList = accept.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
    if (acceptList.length === 0) return true;

    const fileName = (file.name || "").toLowerCase();
    const fileType = (file.type || "").toLowerCase();

    // Check each accept token
    for (const token of acceptList) {
      if (token.startsWith('.')) {
        // extension match
        if (fileName.endsWith(token)) return true;
      } else if (token.includes('/')) {
        // MIME type match (supports image/*)
        if (token.endsWith('/*')) {
          const prefix = token.split('/')[0];
          if (fileType.startsWith(prefix + '/')) return true;
        } else {
          if (fileType === token) return true;
        }
      } else {
        // fallback: treat as extension without dot
        if (fileName.endsWith('.' + token)) return true;
      }
    }

    return false;
  };

  const handleInputChange = (e) => {
    clearError();
    const file = e?.target?.files?.[0];
    if (!file) {
      // no file selected
      props.onUpload && props.onUpload(e);
      return;
    }

    const accept = props.accept || '';
    if (!isFileTypeAllowed(file, accept)) {
      const readableAccept = accept.replace(/,/g, ', ');
      const msg =  props.uploadMessage ? t(props.uploadMessage) :t('Invalid file type. Allowed: ') + readableAccept;
      setLocalError(msg);
      if (props?.setError) props.setError(msg);
      // clear input so user can reselect
      inpRef.current.value = '';
      return;
    }

    // valid file — forward the event to parent
    props.onUpload && props.onUpload(e);
    // update local state
    if (inpRef?.current?.files?.[0]) {
      setHasFile(true);
      setprevSate(inpRef?.current?.files?.[0]);
    } else setHasFile(false);
  };

  if (props?.uploadMessage === "NEED TO DELETE" && inpRef?.current?.value) {
    handleDelete();
    setHasFile(false);
  }

  useEffect(() => handleEmpty(), [inpRef?.current?.files]);

  useEffect(() => handleChange(), [props?.message]);

  function routeTo(filestoreId) {
    if (props?.customOpen) {
      props?.customOpen(filestoreId);
    } else {
      getUrlForDocumentView(filestoreId);
    }
  }

  const getUrlForDocumentView = async (filestoreId) => {
    if (filestoreId?.length === 0) return;
    setLoader(true);
    try {
      const result = await Digit.UploadServices.Filefetch([filestoreId], stateCode);
      setLoader(false);
      if (result?.data) {
        const fileUrl = result.data[filestoreId];
        if (fileUrl) {
          window.open(fileUrl, "_blank");
        } else {
          if (props?.setError) {
            props?.setError(t("CS_FILE_FETCH_ERROR"));
          } else {
            console.error(t("CS_FILE_FETCH_ERROR"));
          }
        }
      } else {
        if (props?.setError) {
          props?.setError(t("CS_FILE_FETCH_ERROR"));
        } else {
          console.error(t("CS_FILE_FETCH_ERROR"));
        }
      }
    } catch (e) {
      setLoader(false);
      if (props?.setError) {
        props?.setError(t("CS_FILE_FETCH_ERROR"));
      } else {
        console.error(t("CS_FILE_FETCH_ERROR"));
      }
    }
  };

  const showHint = props?.showHint || false;

  return (<Fragment>
    {showHint && <p className="cell-text">{t(props?.hintText)}</p>}

    {!props?.disabled && (
      <div
        className={`upload-file-new upload-file-min-height ${user_type === "employee" ? "" : "upload-file-max-width"
          } ${props.disabled ? "disabled" : ""}`}
      >
        <div className="upload-container-flex">
          {/* <ButtonSelector
            theme="border"
            label={t("CS_COMMON_CHOOSE_FILE")}
            className={`upload-file-button ${props.disabled ? "upload-hidden" : ""}`}
            textStyles={props?.textStyles}
            type={props.buttonType}
          /> */}
          <SubmitBar
                className={`upload-file-button ${props.disabled ? "upload-hidden" : ""}`}
                // onSubmit={() => routeTo(props.uploadedFile)}
                label={t("CS_COMMON_CHOOSE_FILE")}
            />

          {props?.uploadedFiles?.map((file, index) => {
            const fileDetailsData = file[1];
            return (
              <div className="upload-tag-container" key={index}>
                <RemoveableTag
                  text={file[0]}
                  onClick={(e) => props?.removeTargetedFile(fileDetailsData, e)}
                />
              </div>
            );
          })}

          {!props.uploadedFile || props.error ? (
            <h2 className="file-upload-status">
              {t("ES_NO_FILE_SELECTED_LABEL")}
            </h2>
          ) : (
            <div className="upload-tag-container">
              <SubmitBar
                onSubmit={() => routeTo(props.uploadedFile)}
                label={t("CS_VIEW_DOCUMENT")}
              />              
            </div>
          )}
          {(props.uploadedFile && props?.isRemovable) ? (
            // <div className="upload-tag-container">
              <CloseBtn onClick={() => props.onDelete(props.uploadedFile)} />
            // </div>
          ) : null}
        </div>

        <input
          // className={`input-mirror-selector-button upload-file-input ${props.disabled ? "disabled" : ""
          //   }`}
          className={`upload-file-input ${props.disabled ? "upload-hidden" : ""}`}
          ref={inpRef}
          type="file"
          id={props.id || `document-${getRandomId()}`}
          name="file"
          multiple={props.multiple}
          accept={props.accept}
          disabled={props.disabled}
          onChange={handleInputChange}
          onClick={(e) => (e.target.value = "")}
        />
      </div>
    )}

    {props?.disabled && (
      <div
        className={`upload-file upload-file-min-height ${user_type === "employee" ? "" : "upload-file-max-width"} disabled-CustomUpload`}
      >
        {props.uploadedFile ? (
          <SubmitBar
            onSubmit={() => routeTo(props.uploadedFile)}
            label={t("CS_VIEW_DOCUMENT")}
          />
        ) : (
          <h2 className="file-upload-status">
            {t("ES_NO_FILE_SELECTED_LABEL")}
          </h2>
        )}
      </div>
    )}

    {props.iserror && <p className="error-text">{props.iserror}</p>}
  {localError && <p className="error-text">{localError}</p>}
    {props?.showHintBelow && <p className="cell-text">{t(props?.hintText)}</p>}
    {loader && <LoaderNew page />}
  </Fragment>
  )

  // return (
  //   <Fragment>
  //     {showHint && <p className="cell-text">{t(props?.hintText)}</p>}
  //     {!props?.disabled && <div
  //       className={`upload-file ${user_type === "employee" ? "" : "upload-file-max-width"} ${props.disabled ? " disabled" : ""}`}
  //       style={extraStyles?.uploadFile ? extraStyles?.uploadFile : {}}
  //     >
  //       <div style={extraStyles ? extraStyles?.containerStyles : null}>
  //         <ButtonSelector
  //           theme="border"
  //           label={t("CS_COMMON_CHOOSE_FILE")}
  //           style={{ ...(extraStyles ? extraStyles?.buttonStyles : {}), ...(props.disabled ? { display: "none" } : {}) }}
  //           textStyles={props?.textStyles}
  //           type={props.buttonType}
  //         />
  //         {props?.uploadedFiles?.map((file, index) => {
  //           const fileDetailsData = file[1];
  //           return (
  //             <div className="tag-container" style={extraStyles ? extraStyles?.tagContainerStyles : null}>
  //               <RemoveableTag extraStyles={extraStyles} key={index} text={file[0]} onClick={(e) => props?.removeTargetedFile(fileDetailsData, e)} />
  //             </div>
  //           );
  //         })}
          
  //         {!props.uploadedFile || props.error ? (
  //           <h2 className="file-upload-status">{t("ES_NO_FILE_SELECTED_LABEL")}</h2>
  //         ) : (
  //           <div
  //             style={
  //               !isMobile
  //                 ? extraStyles?.tagContainerStyles
  //                 : {
  //                     width: "80%",
  //                     display: "flex",
  //                     marginBottom: "10px",
  //                     justifyContent: "center",
  //                   }
  //             }
  //           >
  //             <SubmitBar
  //               onSubmit={() => {
  //                 routeTo(props.uploadedFile);
  //               }}
  //               label={t("CS_VIEW_DOCUMENT")}
  //             />
  //           </div>
  //         )}
  //       </div>
  //       <input
  //         className={props.disabled ? "disabled" : "" + "input-mirror-selector-button"}
  //         style={extraStyles ? { ...extraStyles?.inputStyles, ...props?.inputStyles } : { ...props?.inputStyles }}
  //         ref={inpRef}
  //         type="file"
  //         id={props.id || `document-${getRandomId()}`}
  //         name="file"
  //         multiple={props.multiple}
  //         accept={props.accept}
  //         disabled={props.disabled}
  //         onChange={(e) => props.onUpload(e)}
  //         onClick={(event) => {
  //           const { target = {} } = event || {};
  //           target.value = "";
  //         }}
  //       />
  //     </div>}
  //     {props?.disabled && (props.uploadedFile ? 
  //     <div className={`upload-file ${user_type === "employee" ? "" : "upload-file-max-width"}`} style={extraStyles?.uploadFile ? extraStyles?.uploadFile : {}}>
  //       <SubmitBar
  //       onSubmit={() => {
  //         routeTo(props.uploadedFile);
  //       }}
  //       label={t("CS_VIEW_DOCUMENT")}
  //     /> 
  //     </div>
  //     : <div className={`upload-file ${user_type === "employee" ? "" : "upload-file-max-width"} ${props.disabled ? " disabled" : ""}`} style={extraStyles?.uploadFile ? extraStyles?.uploadFile : {}}>
  //       <h2 className="file-upload-status">{t("ES_NO_FILE_SELECTED_LABEL")}</h2>
  //     </div>)
  //     }
  //     {props.iserror && <p style={{ color: "red" }}>{props.iserror}</p>}
  //     {props?.showHintBelow && <p className="cell-text">{t(props?.hintText)}</p>}
  //     {loader && <LoaderNew page={true} />}
  //   </Fragment>
  // );
};

export default CustomUploadFile;

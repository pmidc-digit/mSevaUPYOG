import React, { useEffect, useRef, useState, Fragment } from "react";
import ButtonSelector from "./ButtonSelector";
import { Close } from "./svgindex";
import { useTranslation } from "react-i18next";
import RemoveableTag from "./RemoveableTag";

const getRandomId = () => {
  return Math.floor((Math.random() || 1) * 139);
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
        // width: "80%"
      },
      tagStyles: {
        width: "90%",
        flexWrap: "nowrap",
      },
      inputStyles: {
        width: "44%",
        minHeight: "2rem",
        maxHeight: "3rem",
        top: "20%"
      },
      buttonStyles: {
        height: "auto",
        minHeight: "2rem",
        width: "40%",
        maxHeight: "3rem"
      },
      tagContainerStyles: {
        width: "60%",
        display: "flex", 
        marginTop: "0px"
      },
      closeIconStyles: {
        width : "20px"
      },
      containerStyles: {
        padding: "10px", 
        marginTop: "0px"
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
        marginLeft:"-30px"
      },
      inputStyles: {},
      closeIconStyles: {
        position:"absolute",
        marginTop:"-12px"
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
        padding: "0px"
      },
      tagContainerStyles: {
       margin: "0px",
       padding: "0px",
       width: "46%"
      },
      tagStyles: {
        height: "auto", 
        padding: "5px", 
        margin: 0,
        width: "100%",
        // margin: "5px"
      },
      textStyles: {
        wordBreak: "break-word",
        height: "auto",
        lineHeight: "16px",
        overflow: "hidden",
        // minHeight: "35px",
        maxHeight: "34px"
      },   
      inputStyles: {
        width: "43%",
        minHeight: "42px",
        maxHeight: "42px",
        top: "5px",
        left: "5px"
      },
      buttonStyles: {
        height: "auto",
        minHeight: "40px",
        width: "43%",
        maxHeight: "40px",
        margin: "5px",
        padding: "0px"
      },
      closeIconStyles: {
        width : "20px"
      },
      uploadFile: {
        minHeight: "50px"
      }
    };
  }
  else {
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

const DEFAULT_ALLOWED_EXTENSIONS = ".pdf,.png,.jpeg,.jpg,.webp,.doc,.docx,.xls,.xlsx,.csv,.dxf,.dwg";
const BLOCKED_EXTENSIONS = [
  "js", "mjs", "cjs", "jsx", "ts", "tsx", "html", "htm", "exe", "bat", "cmd",
  "sh", "vbs", "ps1", "jar", "php", "py", "jsp", "asp", "aspx", "cgi", "msi", "dll", "com", "scr"
];

const validateFile = (file, accept, t) => {
  if (!file) return { valid: false, error: t("CS_FILE_NOT_FOUND") || "No file selected" };

  // Check corrupt / empty file (0 bytes)
  if (file.size === 0) {
    return {
      valid: false,
      error: t("CS_FILE_EMPTY_OR_CORRUPT") || "File is empty or corrupted (0 bytes)."
    };
  }

  const fileName = (file.name || "").toLowerCase();

  // Check for double extension like .pdf.pdf, .doc.pdf, etc.
  const dotCount = (fileName.match(/\./g) || []).length;
  if (dotCount > 1) {
    return {
      valid: false,
      error: t("CS_DOUBLE_EXTENSION_NOT_ALLOWED") || "Files with double extension (e.g. .pdf.pdf) are not allowed."
    };
  }

  const lastDotIndex = fileName.lastIndexOf(".");
  if (lastDotIndex === -1) {
    return {
      valid: false,
      error: t("CS_FILE_WITHOUT_EXTENSION") || "File must have a valid extension."
    };
  }

  const extension = fileName.substring(lastDotIndex + 1);

  // Block scripts and executables like .js
  if (BLOCKED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: t("CS_FILE_TYPE_NOT_ALLOWED") || `Files of type .${extension} are not allowed.`
    };
  }

  // Check allowed generic formats or caller accept
  const effectiveAccept = (accept && accept.trim().length > 0)
    ? accept
    : `${DEFAULT_ALLOWED_EXTENSIONS},image/*`;

  const acceptTokens = effectiveAccept
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const fileType = (file.type || "").toLowerCase();

  let isAllowed = false;
  for (const token of acceptTokens) {
    if (token.startsWith(".")) {
      if (fileName.endsWith(token)) {
        isAllowed = true;
        break;
      }
    } else if (token.includes("/")) {
      if (token.endsWith("/*")) {
        const prefix = token.split("/")[0];
        if (fileType.startsWith(prefix + "/")) {
          isAllowed = true;
          break;
        }
      } else if (fileType === token) {
        isAllowed = true;
        break;
      }
    } else {
      if (extension === token) {
        isAllowed = true;
        break;
      }
    }
  }

  if (!isAllowed) {
    const readableAllowed = effectiveAccept.replace(/,/g, ", ");
    return {
      valid: false,
      error: t("NOT_SUPPORTED_FILE_TYPE") || `Invalid file type. Allowed: ${readableAllowed}`
    };
  }

  return { valid: true };
};

const UploadFile = (props) => {
  const { t } = useTranslation();
  const inpRef = useRef();
  const [hasFile, setHasFile] = useState(false);
  const [prevSate, setprevSate] = useState(null);
  const [fileError, setFileError] = useState(null);
  const user_type = Digit.SessionStorage.get("userType");
  let extraStyles = {};
  const handleChange = () => {
    if (inpRef.current.files[0])
    { setHasFile(true);
      setprevSate(inpRef.current.files[0])
    }
    else setHasFile(false);
  };

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
    setFileError(null);
    props.onDelete();
  };

  const handleEmpty = () => {
    if(inpRef.current.files.length <= 0 && prevSate !== null)
    { inpRef.current.value = "";
      props.onDelete();
    }
  };

  if (props.uploadMessage && inpRef.current.value) {
    handleDelete();
    setHasFile(false);
  }

  useEffect(() => handleEmpty(), [inpRef?.current?.files])

  useEffect(() => handleChange(), [props.message]);

  const handleFileChange = (e) => {
    setFileError(null);
    const files = e?.target?.files;
    if (!files || files.length === 0) {
      props.onUpload && props.onUpload(e);
      return;
    }

    for (let file of files) {
      const validation = validateFile(file, props.accept, t);
      if (!validation.valid) {
        setFileError(validation.error);
        if (inpRef.current) inpRef.current.value = "";
        setHasFile(false);
        return;
      }
    }

    handleChange();
    props.onUpload && props.onUpload(e);
  };

  const showHint = props?.showHint || false;

  return (
    <Fragment>
      {showHint && <p className="cell-text">{t(props?.hintText)}</p>}
      <div className={`upload-file ${user_type === "employee" ? "":"upload-file-max-width"} ${props.disabled ? " disabled" : ""}`} style={extraStyles?.uploadFile ? extraStyles?.uploadFile : {}}>
        <div style= {extraStyles ? extraStyles?.containerStyles : null}>
          <ButtonSelector
            theme="border"
            label={t("CS_COMMON_CHOOSE_FILE")}
            style={{ ...(extraStyles ? extraStyles?.buttonStyles : {}), ...(props.disabled ? { display: "none" } : {}) }}
            textStyles={props?.textStyles}
            type={props.buttonType}
          />
            {props?.uploadedFiles?.map((file, index) => {
              const fileDetailsData = file[1]
              return <div className="tag-container" style={extraStyles ? extraStyles?.tagContainerStyles : null}>
                <RemoveableTag extraStyles={extraStyles} key={index} text={file[0]} onClick={(e) => props?.removeTargetedFile(fileDetailsData, e)} />
              </div>
            })}
          {!hasFile || props.error ? (
            <h2 className="file-upload-status">{props.message}</h2>
          ) : (
            <div className="tag-container" style={extraStyles ? extraStyles?.tagContainerStyles : null}>
              <div className="tag" style={extraStyles ? extraStyles?.tagStyles : null}>
                <span className="text" style={extraStyles ? extraStyles?.textStyles : null}>
                   {(typeof inpRef.current.files[0]?.name !== "undefined") && !(props?.file)  ? inpRef.current.files[0]?.name : props.file?.name} 
                </span>
                <span onClick={() => handleDelete()} style={extraStyles ? extraStyles?.closeIconStyles : null}>
                  <Close style={props.Multistyle} className="close" />
                </span>
              </div>
            </div>
          )}
        </div>
        <input
          className={props.disabled ? "disabled" : "" + "input-mirror-selector-button"}
          style={extraStyles ? { ...extraStyles?.inputStyles, ...props?.inputStyles } : { ...props?.inputStyles }}
          ref={inpRef}
          type="file"
          id={props.id || `document-${getRandomId()}`}
          name="file"
          multiple={props.multiple}
          accept={props.accept || `${DEFAULT_ALLOWED_EXTENSIONS},image/*`}
          disabled={props.disabled}
          onChange={handleFileChange}
          onClick ={ event => {
            const { target = {} } = event || {};
            target.value = "";
          }}
        />
      </div>
      {(fileError || props.iserror) && <p style={{color: "red"}}>{fileError || props.iserror}</p>}
      {props?.showHintBelow && <p className="cell-text">{t(props?.hintText)}</p>}
    </Fragment>
  );
};

export default UploadFile;

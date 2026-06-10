import {
  FormComposer, Row, StatusTable, Toast,
  UploadFile
} from "@mseva/digit-ui-react-components";
import React, { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { useForm } from "react-hook-form";

const defaultState = {
  invalid: false,
  showToast: null,
  error: false,
  warning: false,
  name: "",
  message: "",
  mobileNumber: "",
  previousAction: null,
  disable: false,
};
const getConfig = (t, selectFile, setUploadedFile, uploadedFile, UpdateNumberConfig) => {
  const doc =
    UpdateNumberConfig?.documents?.map((document) => {
      return {
        label: t(document.code),
        populators: (
          <div style={{ marginBottom: "2rem" }}>
            <UploadFile
              id={document.documentType}
              {...document.inputProps}
              onUpload={selectFile}
              onDelete={() => {
                setUploadedFile((pre) => ({ ...pre, [document?.documentType]: null }));
              }}
              message={uploadedFile?.[document?.documentType] ? `1 ${t(`HR_ACTION_FILEUPLOADED`)}` : t(`HR_ACTION_NO_FILEUPLOADED`)}
            />
            <span>{t("PT_ATTACH_RESTRICTIONS_SIZE")}</span>
          </div>
        ),
      };
    }) || [];
  return [
    {
      body: [
        {
          label: t("PT_MOBILE_NO"),
          type: "mobileNumber",
          isMandatory: true,
          populators: {
            name: "mobileNumber",
            required: true,
            validation: {
              required: "MANDATORY_MOBILE",
              minLength: {
                value: 10,
                message: "CORE_COMMON_MOBILE_ERROR",
              },
              maxLength: {
                value: 10,
                message: "CORE_COMMON_MOBILE_ERROR",
              },
              pattern: {
                value: /^[4-9][0-9]{9}$/,
                message: "CORE_COMMON_MOBILE_ERROR",
              },
            },
          },
        },
        ...doc,
      ],
    },
  ];
};
const compStateReducer = (state, action) => {
  switch (action.type) {
    case "verifiedotp":
      return { ...state, previousAction: action.type, message: "", disable: false, showToast: false, error: true, warning: false, invalid: true };
    case "verifyotp":
      return { ...state, previousAction: action.type, message: "", disable: true, showToast: false, error: true, warning: false, invalid: false };
    case "otpsent":
      return {
        ...state,
        previousAction: action.type,
        message: "PT_SEC_OTP_SENT_SUCEESS",
        showToast: true,
        error: false,
        warning: false,
      };
    case "resettoast":
      return { ...state, previousAction: action.type, message: "", showToast: false, error: false, warning: false };
    case "success":
      return { ...state, previousAction: action.type, message: action.value, showToast: true, warning: false, error: false };
    case "warning":
      return { ...state, previousAction: action.type, message: action.value, showToast: true, warning: true, error: false };
    case "error":
      return { ...state, previousAction: action.type, message: action.value, showToast: true, error: true };
    case "reset":
      return { ...defaultState };
    default:
      return { ...defaultState };
  }
};

// TODO make this component to reuse for multiple module
const UpdateNumber = ({ t, onValidation, mobileNumber, name, UpdateNumberConfig }) => {
  const [compState, compStateDispatch] = useReducer(compStateReducer, { ...defaultState, name: name, mobileNumber: mobileNumber });
  const [file, setFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [error, setError] = useState(null);

  function selectFile(e) {
    e?.target?.files?.[0] ? setFile({ [e.target.id]: e.target.files[0] }) : setFile(null);
  }

  useEffect(() => {
    (async () => {
      setError(null);
      if (file) {
        let key = Object.keys(file)?.[0];
        if (file[key].size >= 5242880) {
          setError(t("CS_MAXIMUM_UPLOAD_SIZE_EXCEEDED"));
        } else {
          try {
            const response = await Digit.UploadServices.Filestorage("PT", file[key], Digit.ULBService.getStateId());
            if (response?.data?.files?.length > 0) {
              setUploadedFile((prev) => ({ ...prev, [key]: response?.data?.files[0]?.fileStoreId }));
            } else {
              setError(t("CS_FILE_UPLOAD_ERROR"));
            }
          } catch (err) {
            setError(t("CS_FILE_UPLOAD_ERROR"));
          }
        }
      }
    })();
  }, [file]);

  const onSubmit = useCallback(
    async (_data) => {
      compStateDispatch({ type: "resettoast" });

      // Check if mobileNumber is empty
      if (!_data?.mobileNumber || _data.mobileNumber.trim() === "") {
        compStateDispatch({ type: "warning", value: "PT_MOBILE_NO_MANDATORY" });
        return;
      }

      // Validate mobile number format (4-9 start, 10 digits total)
      const mobileRegex = /^[4-9][0-9]{9}$/;
      if (!mobileRegex.test(_data?.mobileNumber)) {
        compStateDispatch({ type: "warning", value: "PT_INVALID_MOBILE_NO" });
        return;
      }

      // Check if same as current number
      if (_data?.mobileNumber === compState.mobileNumber) {
        compStateDispatch({ type: "warning", value: "PT_SEC_SAME_NUMBER" });
        return;
      }

      // Check if invalid configured number
      let invalidNo = (UpdateNumberConfig?.invalidNumber === _data?.mobileNumber && "PTUPNO_INVALIDNO_HEADER") || false;
      if (invalidNo) {
        compStateDispatch({ type: "warning", value: invalidNo });
        return;
      }

      // All validations passed, call API
      onValidation &&
        onValidation(_data, (d) => {
          compStateDispatch({ type: "success", value: "PT_MOBILE_NUM_UPDATED_SUCCESS" });
        });
    },
    [compState, UpdateNumberConfig]
  );

  const { register, control, handleSubmit, getValues, reset, formState } = useForm({
    defaultValues: {
      mobileNumber: "",
    },
  });

  const config = useMemo(() => getConfig(t, selectFile, setUploadedFile, uploadedFile, UpdateNumberConfig), [
    t,
    setUploadedFile,
    uploadedFile,
    UpdateNumberConfig,
  ]);
  return (
    <div className="popup-module updateNumberEmployee" style={{ zIndex: 100001, position: "relative", overflow: "visible" }}>
      <FormComposer
        config={config}
        noBoxShadow
        inline
        submitInForm={true}
        onSubmit={(_data) => {
          // Call onSubmit which handles all validation and API call
          onSubmit({ ..._data, ...uploadedFile });
        }}
        label={"ES_COMMON_UPDATE"}
        defaultValues={{
          mobileNumber: "",
        }}
        formId="modal-action"
        formState={formState}
        control={control}
        register={register}
      >
        <div style={{ paddingBottom: "20px" }}>
          <StatusTable>
            <Row label={t("PTUPNO_OWNER_NAME")} text={`${compState?.name || t("CS_NA")}`} />
            <Row label={t("PTUPNO_CURR_NO")} text={`${compState?.mobileNumber || t("CS_NA")}`} />
          </StatusTable>
        </div>
      </FormComposer>
      {compState.showToast && (
        <Toast
          error={compState.error}
          warning={compState.warning}
          label={t(compState.message)}
          onClose={() => {
            compStateDispatch({ type: "resettoast" });
          }}
        />
      )}
    </div>
  );
};
export default UpdateNumber;

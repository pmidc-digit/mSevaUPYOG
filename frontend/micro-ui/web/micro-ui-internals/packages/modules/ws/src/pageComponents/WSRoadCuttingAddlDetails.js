import { CardLabel, Dropdown, LabelFieldPair, LinkButton, TextInput, CardLabelError, DeleteIcon } from "@mseva/digit-ui-react-components";
import _, { filter } from "lodash";
import React, { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { stringReplaceAll } from "../utils";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

const createRoadCuttingAddlDetails = () => ({ compositionFee: "", userCharges: "", regularizationFee: "" });

const WSRoadCuttingAddlDetails = ({ config, onSelect, userType, formData, setError, formState, clearErrors }) => {
  const { t } = useTranslation();
  const [focusIndex1, setFocusIndex1] = useState({ index: -1, type: "" });
  const [roadCuttingAddlDetails, setRoadCuttingAddlDetails] = useState(
    formData?.roadCuttingAddlDetails || createRoadCuttingAddlDetails()
  );
  console.log("roadCuttingAddlDetails: ", roadCuttingAddlDetails);
  const { control, getValues } = useForm();
  useEffect(() => {
    onSelect(config?.key, roadCuttingAddlDetails);
  }, [roadCuttingAddlDetails]);
  return (
    <React.Fragment>
      <br></br>
      <LabelFieldPair>
        <CardLabel
        // style={isMobile && isEmployee ? { fontWeight: "700", width: "100%" } : { marginTop: "-5px", fontWeight: "700" }}
        // className="card-label-smaller"
        >{`${t("WS_COMPOSITION_FEE")}`}</CardLabel>
        <div className="field">
          <Controller
            control={control}
            name="compositionFee"
            defaultValue={roadCuttingAddlDetails?.compositionFee}
            // rules={{ required: t("REQUIRED_FIELD") }}
            // rules={{
            //   validate: (e) => ((e && getPattern("Name").test(e)) || !e ? true : t("ERR_DEFAULT_INPUT_FIELD_MSG")),
            //   required: t("REQUIRED_FIELD"),
            // }}
            isMandatory={false}
            render={(props) => (
              <TextInput
                value={roadCuttingAddlDetails?.compositionFee} //{getValues("compositionFee")}
                // onBlur={props.onBlur}
                // onBlur={(e) => {
                //   setFocusIndex({ index: -1 });
                //   props.onBlur(e);
                // }}
                labelStyle={{ marginTop: "unset" }}
                //autoFocus={focusIndex1.index === roadCuttingAddlDetails?.key && focusIndex1.type === "compositionFee"}
                // errorStyle={localFormState.touched.plumberName && errors?.plumberName?.message ? true : false}
                onChange={(e) => {
                  setRoadCuttingAddlDetails({ ...roadCuttingAddlDetails, compositionFee: e.target.value });
                  //props.onChange(e.target.value);
                  //setFocusIndex1({ index: roadCuttingAddlDetails?.key, type: "compositionFee" });
                }}
              />
            )}
          />
        </div>
      </LabelFieldPair>
      <LabelFieldPair>
        <CardLabel
        // style={isMobile && isEmployee ? { fontWeight: "700", width: "100%" } : { marginTop: "-5px", fontWeight: "700" }}
        // className="card-label-smaller"
        >{`${t("WS_ADDN_USER_CHARGES_LABEL")}`}</CardLabel>
        <div className="field">
          <Controller
            control={control}
            name="userCharges"
            defaultValue={roadCuttingAddlDetails?.userCharges}
            // rules={{ required: t("REQUIRED_FIELD") }}
            // rules={{
            //   validate: (e) => ((e && getPattern("Name").test(e)) || !e ? true : t("ERR_DEFAULT_INPUT_FIELD_MSG")),
            //   required: t("REQUIRED_FIELD"),
            // }}
            isMandatory={false}
            render={(props) => (
              <TextInput
                value={roadCuttingAddlDetails?.userCharges}
                //onBlur={props.onBlur}
                labelStyle={{ marginTop: "unset" }}
                // autoFocus={focusIndex.index === plumberDetail?.key && focusIndex.type === "plumberName"}
                // errorStyle={localFormState.touched.plumberName && errors?.plumberName?.message ? true : false}
                onChange={(e) => {
                  setRoadCuttingAddlDetails({ ...roadCuttingAddlDetails, userCharges: e.target.value });
                  //props.onChange(e.target.value);
                  //setFocusIndex({ index: plumberDetail?.key, type: "plumberName" });
                }}
              />
            )}
          />
        </div>
      </LabelFieldPair>
      <LabelFieldPair>
        <CardLabel
        // style={isMobile && isEmployee ? { fontWeight: "700", width: "100%" } : { marginTop: "-5px", fontWeight: "700" }}
        // className="card-label-smaller"
        >{`${t("WS_OTHER_FEE")}`}</CardLabel>
        <div className="field">
          <Controller
            control={control}
            name="regularizationFee"
            defaultValue={roadCuttingAddlDetails?.regularizationFee}
            // rules={{ required: t("REQUIRED_FIELD") }}
            // rules={{
            //   validate: (e) => ((e && getPattern("Name").test(e)) || !e ? true : t("ERR_DEFAULT_INPUT_FIELD_MSG")),
            //   required: t("REQUIRED_FIELD"),
            // }}
            isMandatory={false}
            render={(props) => (
              <TextInput
                value={roadCuttingAddlDetails?.regularizationFee}
                //onBlur={props.onBlur}
                labelStyle={{ marginTop: "unset" }}
                //autoFocus={focusIndex.index === plumberDetail?.key && focusIndex.type === "plumberName"}
                //errorStyle={localFormState.touched.plumberName && errors?.plumberName?.message ? true : false}
                onChange={(e) => {
                  setRoadCuttingAddlDetails({ ...roadCuttingAddlDetails, regularizationFee: e.target.value });
                  //props.onChange(e.target.value);
                  //setFocusIndex({ index: plumberDetail?.key, type: "plumberName" });
                }}
              />
            )}
          />
        </div>
      </LabelFieldPair>
    </React.Fragment>
  );
};

export default WSRoadCuttingAddlDetails;

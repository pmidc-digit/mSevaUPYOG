import { CardLabel, FormStep, RadioOrSelect } from "@mseva/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import { stringReplaceAll } from "../utils";
import { useDispatch, useSelector } from "react-redux";

const ProvideFloorNo = ({ t, config, onSelect, userType, formData }) => {
  //let index = window.location.href.charAt(window.location.href.length - 1);
  const GISValues = useSelector((state) => state.pt?.PTNewApplicationForm?.formData?.GISValues);
  let index = window.location.href.split("/").pop();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();
  //const [SubUsageTypeOfRentedArea, setSelfOccupied] = useState(formData?.ProvideSubUsageTypeOfRentedArea);
  const [Floorno, setFloorno] = useState(formData?.noOfFloors ? {
    i18nKey: formData?.noOfFloors.toString(), code: formData?.noOfFloors
  }: {});

  // const { data: floordata } = Digit.Hooks.pt.usePropertyMDMS(stateId, "PropertyTax", "Floor") || {};
  // let floorlist = [];
  // floorlist = floordata?.PropertyTax?.Floor;
  // let i;

  useEffect(()=>{
    if(GISValues?.floor){
      const floorNumberInString = GISValues?.floor?.split("+")[1];
      let floorStringToNum = 1;
      if(floorNumberInString && parseInt(floorNumberInString)){
        floorStringToNum = floorStringToNum + parseInt(floorNumberInString);
      }

      const finalFloorNum = getfloorlistdata().find((val) => (val.code === floorStringToNum))
      // onSelect("noOfFloors", finalFloorNum.code, config);
      selectFloorno(finalFloorNum)
    }
  },[GISValues?.floor])

  useEffect(() => {
    onSelect("noOfFloors", Floorno.code )
  },[Floorno])
  
  let data = [];

  function getfloorlistdata() {
    // for (i = 0; Array.isArray(floorlist) && i < floorlist.length; i++) {
    //   data.push({ i18nKey: "PROPERTYTAX_FLOOR_" + stringReplaceAll(floorlist[i].code, "-", "_") });
    // }
    // return data;

    for (let i = 1; i <= 25; i++) {
      data.push({ i18nKey: i.toString(), code: i });
    }
    return data;
  }
  const onSkip = () => onSelect();

  function selectFloorno(value) {
    setFloorno(value);
  }

  function goNext() {
    onSelect(config.key, Floorno);
  }
  return (
    <div>
      {formData?.usageCategoryMajor && formData?.PropertyType?.code === "BUILTUP.INDEPENDENTPROPERTY" && <div>
        <CardLabel>{t("PT_FLOOR_NUMBER_LABEL")} {config.isMandatory && <span style={{ color: "red" }}>*</span>}</CardLabel>
          <RadioOrSelect
            t={t}
            optionKey="i18nKey"
            isMandatory={config.isMandatory}
            // options={getfloorlistdata(floorlist) || {}}
            options={getfloorlistdata() || {}}
            selectedOption={Floorno}
            onSelect={(val)=>{
              onSelect("noOfFloors", val.code, config);
              selectFloorno(val)
            }}
            disabled={GISValues?.floor ? true : false}
          />
      </div>}
    </div>
  );
};

export default ProvideFloorNo;

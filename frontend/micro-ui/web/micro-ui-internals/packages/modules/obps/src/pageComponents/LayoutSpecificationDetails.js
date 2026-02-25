
import React, { useEffect, useState } from "react";
import { LabelFieldPair, TextInput, CardLabel, BreakLine, CardSectionHeader, CardLabelError, Toast } from "@mseva/digit-ui-react-components";

const LayoutSpecificationDetails = (_props) => {
  const { t, currentStepData, Controller, control, setValue, errors, errorStyle, watch } = _props
  const [showToast, setShowToast] = useState(null)

  useEffect(() => {
    const formattedData = currentStepData?.siteDetails
    if (formattedData) {
      Object.entries(formattedData).forEach(([key, value]) => {
        setValue(key, value)
      })

      if (formattedData.areaLeftForRoadWidening) {
        setValue("specificationPlotArea", formattedData.areaLeftForRoadWidening, { shouldValidate: true })
      }
    }
  }, [currentStepData, setValue])

  const specificationPlotAreaValue = watch ? watch("specificationPlotArea") : ""
  const areaLeftForRoadWidening = currentStepData?.siteDetails?.areaLeftForRoadWidening

  useEffect(() => {
    if (specificationPlotAreaValue && areaLeftForRoadWidening) {
      const plotArea = Number.parseFloat(specificationPlotAreaValue)
      const fieldA = Number.parseFloat(areaLeftForRoadWidening)

      if (!isNaN(plotArea) && !isNaN(fieldA) && plotArea !== fieldA) {
        setShowToast({
          error: true,
          label: "Net Plot Area As Per Jamabandi Must Be Equal To Total Plot Area (Field A)",
        })
      } else {
        setShowToast(null)
      }
    }
  }, [specificationPlotAreaValue, areaLeftForRoadWidening])

  return (
    <React.Fragment>
      <CardSectionHeader>{t("BPA_SPECIFICATION_DETAILS")}</CardSectionHeader>

      <div>
        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("Net Plot Area As Per Jamabandi")}`}*</CardLabel>
          <div className="field">
            <Controller
              control={control}
              name="specificationPlotArea"
              rules={{
                required: t("REQUIRED_FIELD"),
                pattern: {
                  value: /^[0-9]*\.?[0-9]+$/,
                  message: t("ONLY_NUMERIC_VALUES_ALLOWED_MSG"),
                },
                validate: (value) => {
                  if (!areaLeftForRoadWidening) return true
                  const plotArea = Number.parseFloat(value)
                  const fieldA = Number.parseFloat(areaLeftForRoadWidening)
                  if (isNaN(plotArea) || isNaN(fieldA)) return true
                  return plotArea === fieldA || t("Net Plot Area As Per Jamabandi Must Be Equal To Total Plot Area (Field A)")
                },
              }}
              render={(props) => (
                <TextInput
                  className="form-field"
                  value={props.value || specificationPlotAreaValue || ""}
                  onChange={(e) => {
                    props.onChange(e.target.value)
                  }}
                  onBlur={(e) => {
                    props.onBlur(e)
                  }}
                  t={t}
                />
              )}
            />
          </div>
        </LabelFieldPair>
        <CardLabelError style={errorStyle}>
          {errors?.specificationPlotArea ? errors.specificationPlotArea.message : ""}
        </CardLabelError>
      </div>
      <BreakLine />

      {showToast && (
        <Toast
          error={showToast.error}
          warning={showToast.warning}
          label={t(showToast.label)}
          onClose={() => {
            setShowToast(null)
          }}
        />
      )}
    </React.Fragment>
  )
}

export default LayoutSpecificationDetails


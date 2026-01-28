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
  const areaLeftForRoadWidening = watch("areaLeftForRoadWidening")

  useEffect(() => {
    if (specificationPlotAreaValue && areaLeftForRoadWidening) {
      const plotArea = Number.parseFloat(specificationPlotAreaValue)
      const totalArea = Number.parseFloat(areaLeftForRoadWidening)

      if (!isNaN(plotArea) && !isNaN(totalArea) && plotArea !== totalArea) {
        setShowToast({
          error: true,
          label: "Plot area as per jamabandi must be equal to Total Area in Square Meter",
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
          <CardLabel className="card-label-smaller">{`${t("Plot area as per jamabandi must be equal to total area in Square Meter")}*`}</CardLabel>
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
                  const totalArea = Number.parseFloat(areaLeftForRoadWidening)
                  if (isNaN(plotArea) || isNaN(totalArea)) return true
                  // Normalize values by removing unnecessary trailing zeros
                  const normalizedPlotArea = parseFloat(plotArea.toString())
                  const normalizedTotalArea = parseFloat(totalArea.toString())
                  return normalizedPlotArea === normalizedTotalArea || t("Plot area as per jamabandi must be equal to Total Area in Square Meter")
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

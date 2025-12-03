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

      if (formattedData.netTotalArea) {
        setValue("specificationPlotArea", formattedData.netTotalArea, { shouldValidate: true })
      }
    }
  }, [currentStepData, setValue])

  const specificationPlotAreaValue = watch ? watch("specificationPlotArea") : ""
  const netTotalArea = currentStepData?.siteDetails?.netTotalArea

  useEffect(() => {
    if (specificationPlotAreaValue && netTotalArea) {
      const plotArea = Number.parseFloat(specificationPlotAreaValue)
      const totalArea = Number.parseFloat(netTotalArea)

      if (!isNaN(plotArea) && !isNaN(totalArea) && plotArea !== totalArea) {
        setShowToast({
          error: true,
          label: "BPA_PLOT_AREA_MUST_MATCH_NET_TOTAL_AREA",
        })
      } else {
        setShowToast(null)
      }
    }
  }, [specificationPlotAreaValue, netTotalArea])

  return (
    <React.Fragment>
      <CardSectionHeader>{t("BPA_SPECIFICATION_DETAILS")}</CardSectionHeader>

      <div>
        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("BPA_PLOT_AREA_JAMA_BANDI_LABEL")}`}*</CardLabel>
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
                  if (!netTotalArea) return true
                  const plotArea = Number.parseFloat(value)
                  const totalArea = Number.parseFloat(netTotalArea)
                  if (isNaN(plotArea) || isNaN(totalArea)) return true
                  return plotArea === totalArea || t("BPA_PLOT_AREA_MUST_MATCH_NET_TOTAL_AREA")
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

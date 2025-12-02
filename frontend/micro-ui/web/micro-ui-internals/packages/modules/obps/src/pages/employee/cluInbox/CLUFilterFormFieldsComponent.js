

import React from "react"
import { FilterFormField, RadioButtons, CheckBox } from "@mseva/digit-ui-react-components"
import { Controller } from "react-hook-form"
import { useTranslation } from "react-i18next"

const CLUFilterFormFieldsComponent = ({
  statuses,
  isInboxLoading,
  registerRef,
  controlFilterForm,
  setFilterFormValue,
  filterFormState,
  getFilterFormValue,
}) => {
  const { t } = useTranslation()

  const availableOptions = [
    { code: "ASSIGNED_TO_ME", name: `${t("ES_INBOX_ASSIGNED_TO_ME")}` },
    { code: "ASSIGNED_TO_ALL", name: `${t("ES_INBOX_ASSIGNED_TO_ALL")}` },
  ]

  return (
    <React.Fragment>
      <FilterFormField>
        <Controller
          name="assignee"
          control={controlFilterForm}
          render={(props) => (
            <RadioButtons
              onSelect={(e) => {
                props.onChange(e.code)
              }}
              selectedOption={availableOptions.filter((option) => option.code === props.value)[0]}
              optionsKey="name"
              options={availableOptions}
            />
          )}
        />
      </FilterFormField>

      <FilterFormField>
        <Controller
          name="applicationStatus"
          control={controlFilterForm}
          defaultValue={[]}
          render={(props) => {
            const toggleStatus = (statusCode) => {
              if (props.value.includes(statusCode)) {
                props.onChange(props.value.filter((code) => code !== statusCode))
              } else {
                props.onChange([...props.value, statusCode])
              }
            }

            return (
              <React.Fragment>
                {statuses?.map((status, index) => (
                  <CheckBox
                    key={status.applicationstatus}              
                    label={`${t(`BPA_STATUS_${status.applicationstatus}`)} - ${status.totalCount}`}
                    value={status.applicationstatus}
                    checked={props.value.includes(status.applicationstatus)}
                    onChange={() => toggleStatus(status.applicationstatus)}
                    index={index}
                  />
                ))}
              </React.Fragment>
            )
          }}
        />
      </FilterFormField>
    </React.Fragment>
  )
}

export default CLUFilterFormFieldsComponent

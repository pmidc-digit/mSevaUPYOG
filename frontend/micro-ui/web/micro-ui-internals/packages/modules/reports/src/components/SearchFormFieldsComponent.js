import React, { Fragment } from "react";
import {
  TextInput,
  DatePicker,
  SearchField,
  Dropdown,
  CardLabelError,
  MultiSelectDropdown,
  CheckBox,
} from "@mseva/digit-ui-react-components";
import { useWatch } from "react-hook-form";
import BoundaryField from "./BoundaryField";
import { getDropdownOptions, parseLocalDate, toInputDate } from "../util";

// Field types supported by the old rainmaker report search form (showField.js):
// string, number, date, epoch, singlevaluelist, url, multivaluelist, checkbox, boundarylist.
// "tenantId" is never shown (old handleFormFields skipped it).

const identity = (s) => s;

const hasValue = (v) => {
  if (Array.isArray(v)) return v.length > 0;
  if (v && typeof v === "object") return !!v.code || Object.keys(v).length > 0;
  return v !== undefined && v !== null && v !== "";
};

const toDateLimit = (v) => {
  if (!v) return undefined;
  const d = typeof v === "number" ? new Date(v) : parseLocalDate(v);
  return d ? toInputDate(d) : undefined;
};

const Label = ({ field, t }) => (
  <label className="rpt-field-label">
    {t(field.label)}
    {field.isMandatory ? <span className="rpt-required">*</span> : null}
  </label>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </svg>
);

const RequiredError = ({ formErrors, field, t }) =>
  formErrors?.[field.name] ? <CardLabelError>{t("This field is required")}</CardLabelError> : null;

const SearchFieldItem = ({ field, formState, Controller, register, control, t, tenantId, dates }) => {
  const formErrors = formState?.errors;
  const required = field.isMandatory && field.type !== "boundarylist";
  const rules = required ? { validate: (v) => hasValue(v) } : {};

  switch (field.type) {
    case "string":
    case "number":
      return (
        <SearchField>
          <Label field={field} t={t} />
          <TextInput
            name={field.name}
            type="text"
            inputRef={register({
              required,
              ...(field.type === "number" ? { pattern: /^[+-]?\d+(\.\d+)?$/ } : { maxLength: { value: 60, message: t("EXCEEDS_60_CHAR_LIMIT") } }),
            })}
          />
          <RequiredError formErrors={formErrors} field={field} t={t} />
        </SearchField>
      );

    case "singlevaluelist":
    case "url": {
      const options = getDropdownOptions(field.defaultValue, t, field);
      return (
        <SearchField>
          <Label field={field} t={t} />
          <Controller
            control={control}
            name={field.name}
            rules={rules}
            defaultValue={null}
            render={(props) => (
              <Dropdown
                selected={props.value || null}
                select={props.onChange}
                onBlur={props.onBlur}
                option={options}
                optionKey="name"
                disable={field.disabled || options.length < 2}
                t={identity}
              />
            )}
          />
          <RequiredError formErrors={formErrors} field={field} t={t} />
        </SearchField>
      );
    }

    case "multivaluelist": {
      const options = getDropdownOptions(field.defaultValue, t, field);
      const selectMulti = (listOfSelections, props) => props.onChange(listOfSelections.map((sel) => sel[1]));
      return (
        <SearchField>
          <Label field={field} t={t} />
          <Controller
            control={control}
            name={field.name}
            rules={rules}
            defaultValue={[]}
            render={(props) => (
              <MultiSelectDropdown
                options={options}
                props={props}
                isPropsNeeded={true}
                onSelect={selectMulti}
                selected={props?.value || []}
                optionsKey="name"
                defaultUnit={t("BPA_SELECTED_TEXT")}
              />
            )}
          />
          <RequiredError formErrors={formErrors} field={field} t={t} />
        </SearchField>
      );
    }

    case "epoch":
    case "date": {
      // Old rules: fromDate can't be after today or after toDate; toDate can't be before fromDate.
      const today = toInputDate(new Date());
      let min = toDateLimit(field.minValue);
      let max = toDateLimit(field.maxValue);
      if (field.name === "fromDate") {
        max = max || today;
        if (dates?.toDate && (!max || dates.toDate < max)) max = dates.toDate;
      }
      if (field.name === "toDate" && dates?.fromDate && (!min || dates.fromDate > min)) min = dates.fromDate;
      if (field.type === "date") max = max || today;
      return (
        <SearchField>
          <Label field={field} t={t} />
          <Controller
            rules={rules}
            name={field.name}
            control={control}
            defaultValue=""
            render={(props) => <DatePicker date={props.value} onChange={props.onChange} min={min} max={max} />}
          />
          <RequiredError formErrors={formErrors} field={field} t={t} />
        </SearchField>
      );
    }

    case "checkbox":
      return (
        <SearchField>
          <Controller
            name={field.name}
            control={control}
            rules={rules}
            defaultValue={false}
            render={(props) => (
              <CheckBox
                label={`${t(field.label)}${field.isMandatory ? " *" : ""}`}
                checked={!!props.value}
                onChange={(e) => props.onChange(e.target.checked)}
              />
            )}
          />
          <RequiredError formErrors={formErrors} field={field} t={t} />
        </SearchField>
      );

    case "boundarylist":
      return (
        <Controller
          name={field.name}
          control={control}
          defaultValue=""
          render={(props) => <BoundaryField value={props.value} onChange={props.onChange} t={t} tenantId={tenantId} />}
        />
      );

    default:
      return null;
  }
};

const SearchFormFieldsComponent = ({ formState, Controller, register, control, t, reset, data, tenantId, onReset }) => {
  const searchFields = (data?.reportDetails?.searchParams || []).filter((f) => f.name !== "tenantId");
  const dates = useWatch({ control, name: ["fromDate", "toDate"] }) || {};

  const resetObj = {};
  searchFields.forEach((f) => {
    resetObj[f.name] =
      f.type === "multivaluelist" ? [] : f.type === "singlevaluelist" || f.type === "url" ? null : f.type === "checkbox" ? false : "";
  });

  return (
    <Fragment>
      {searchFields.map((field) => (
        <SearchFieldItem
          key={field.name}
          {...{ field, formState, Controller, register, control, t, tenantId, dates }}
        />
      ))}
      <div className="rpt-filter-actions">
        <button
          type="button"
          className="rpt-btn rpt-btn--secondary"
          onClick={() => {
            reset(resetObj);
            onReset?.();
          }}
        >
          {t(`ES_COMMON_CLEAR_ALL`)}
        </button>
        <button type="submit" className="rpt-btn rpt-btn--primary">
          <SearchIcon />
          {t("REPORTS_SEARCH_APPLY_LABEL") !== "REPORTS_SEARCH_APPLY_LABEL" ? t("REPORTS_SEARCH_APPLY_LABEL") : t("ES_COMMON_SEARCH")}
        </button>
      </div>
    </Fragment>
  );
};

export default SearchFormFieldsComponent;

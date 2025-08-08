import React, { useState, Fragment, useEffect } from "react";
import { FilterFormField, Loader, RadioButtons, Localities, RemoveableTag, Dropdown, CheckBox } from "@mseva/digit-ui-react-components";
import { Controller, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { businessServiceList } from "../../../utils";

const FilterFormFieldsComponent = ({ statuses, controlFilterForm, applicationTypesOfBPA, handleFilter }) => {
  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getStateId();

  const [tlfilters, setTLFilters] = useState({
    applicationStatus: [],
  });

  useEffect(() => {
    if (tlfilters) {
      handleFilter(tlfilters);
    }
  }, [tlfilters]);

  const availableOptions = [
    { code: "ASSIGNED_TO_ME", name: `${t("ES_INBOX_ASSIGNED_TO_ME")}` },
    { code: "ASSIGNED_TO_ALL", name: `${t("ES_INBOX_ASSIGNED_TO_ALL")}` },
  ];

  applicationTypesOfBPA?.forEach((type) => {
    type.name = t(`WF_BPA_${type.code}`);
    type.i18nKey = t(`WF_BPA_${type.code}`);
  });

  const handleAssignmentChange = (e, type) => {
    if (e.target.checked) {
      setTLFilters({ ...tlfilters, applicationStatus: [...tlfilters.applicationStatus, { code: type.applicationstatus }] });
    } else {
      const filteredStatus = tlfilters.applicationStatus.filter((value) => {
        return value.code !== type.applicationstatus;
      });
      setTLFilters({ ...tlfilters, applicationStatus: filteredStatus });
    }
  };

  console.log("status===", statuses);
  return (
    <>
      <FilterFormField>
        <Controller
          name="assignee"
          control={controlFilterForm}
          render={(props) => (
            <RadioButtons
              onSelect={(e) => {
                props.onChange(e.code);
              }}
              selectedOption={availableOptions.filter((option) => option.code === props.value)[0]}
              optionsKey="name"
              options={availableOptions}
            />
          )}
        />
      </FilterFormField>
      {/* <FilterFormField>
        <Controller
          name="businessService"
          control={controlFilterForm}
          render={(props) => {
            return (
              <>
                <div className="filter-label sub-filter-label" style={{ fontSize: "18px", fontWeight: "600" }}>
                  {t("BUSINESS_SERVICE")}
                </div>
                <RadioButtons
                  onSelect={(e) => {
                    setFilterFormValue("applicationStatus", []);
                    props.onChange(e);
                  }}
                  selectedOption={props.value}
                  optionsKey="i18nKey"
                  options={businessServiceList() || []}
                />
              </>
            );
          }}
        />
      </FilterFormField> */}

      <FilterFormField>
        {statuses?.map((option, index) => {
          // const checked = searchParams?.applicationStatus?.includes(e.statusid);
          let hasFilters = tlfilters?.applicationStatus?.length;
          return (
            <CheckBox
              key={index + "service"}
              label={`${option?.applicationstatus} - ${option.count}`}
              //value={option.statusid}
              // checked={
              //   hasFilters ? (tlfilters.applicationStatus.filter((e) => e.code === option.applicationstatus).length !== 0 ? true : false) : false
              // }
              onChange={(e) => handleAssignmentChange(e, option)}
            />
          );
        })}
        {/* <Controller
          name="applicationStatus"
          control={controlFilterForm}
          render={(props) => {
            function changeItemCheckStatus(value) {
              props.onChange(value);
            }
            const renderStatusCheckBoxes = useMemo(
              () =>
                statuses?.map((status) => {
                  return (
                    <CheckBox
                      onChange={(e) =>
                        e.target.checked
                          ? changeItemCheckStatus([...props.value, status?.statusid])
                          : changeItemCheckStatus(props.value?.filter((id) => id !== status?.statusid))
                      }
                      checked={props.value?.includes(status?.statusid)}
                      label={`${status.applicationstatus} (${status.count})`}
                    />
                  );
                }),
              [props.value, statuses]
            );
            return (
              <>
                <div className="filter-label sub-filter-label" style={{ fontSize: "18px", fontWeight: "600" }}>
                  {t("ACTION_TEST_APPLICATION_STATUS")}
                </div>
                {isInboxLoading ? <Loader /> : <>{renderStatusCheckBoxes}</>}
              </>
            );
          }}
        /> */}
      </FilterFormField>
    </>
  );
};

export default FilterFormFieldsComponent;

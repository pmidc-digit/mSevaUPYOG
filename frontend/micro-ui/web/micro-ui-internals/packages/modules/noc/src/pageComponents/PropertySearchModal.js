import React, { useState, useEffect, useRef } from "react";
import {
  CardLabel,
  LabelFieldPair,
  TextInput,
  Toast,
  Loader,
  Row,
  StatusTable,
  Modal,
  Card,
  Table,
  SubmitBar,
  Dropdown,
  RadioOrSelect,
} from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";
import { useLocation } from "react-router-dom";

const getAddress = (address, t) => {
  return `${address?.doorNo ? `${address?.doorNo}, ` : ""} ${address?.street ? `${address?.street}, ` : ""}${
    address?.landmark ? `${address?.landmark}, ` : ""
  }${t(Digit.Utils.pt.getMohallaLocale(address?.locality.code, address?.tenantId))}, ${t(Digit.Utils.pt.getCityLocale(address?.tenantId))}${
    address?.pincode && t(address?.pincode) ? `, ${address.pincode}` : " "
  }`;
};

const Close = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFFFFF">
    <path d="M0 0h24v24H0V0z" fill="none" />
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
  </svg>
);

const CloseBtn = (props) => {
  return (
    <div className="icon-bg-secondary" onClick={props.onClick}>
      <Close />
    </div>
  );
};

export const PropertySearchModal = ({
  key = "cpt",
  onSelect,
  formData,
  setApiLoading,
  menuList,
  closeModal,
  onPropertySelect,
  tenantId: propsTenantId,
}) => {
  const { t } = useTranslation();
  const myElementRef = useRef(null);
  const dispatch = useDispatch();
  let { pathname, state } = useLocation();
  state = state && (typeof state === "string" || state instanceof String) ? JSON.parse(state) : state;

  const tenantId =
    propsTenantId || (window.location.href.includes("employee") ? Digit.ULBService.getCurrentPermanentCity() : localStorage.getItem("CITIZEN.CITY"));

  const [getLoader, setLoader] = useState(false);

  const [propertyId, setPropertyId] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [name, setName] = useState("");
  const [showToast, setShowToast] = useState(null);
  const [propertyData, setPropertyData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocality, setSelectedLocality] = useState({});
  const isMobile = window.Digit.Utils.browser.isMobile();

  const [isSearchClicked, setIsSearchClicked] = useState(false);

  const documentsColumns = [
    {
      Header: t("Property ID"),
      accessor: "propertyId",
      Cell: ({ value }) => value || t("CS_NA"),
    },
    {
      Header: t("Mobile Number"),
      accessor: "owners",
      id: "mobileNumber",
      Cell: ({ value }) => {
        let ownerObject;
        if (value?.length === 1) {
          ownerObject = value?.[0];
        } else {
          ownerObject = value?.find((owner) => owner?.isPrimaryOwner) || value?.[0];
        }
        return ownerObject?.mobileNumber || "";
      },
    },
    {
      Header: t("Owner"),
      accessor: "owners",
      id: "ownerName",
      Cell: ({ value }) => {
        let ownerObject;
        if (value?.length === 1) {
          ownerObject = value?.[0];
        } else {
          ownerObject = value?.find((val) => val?.isPrimaryOwner) || value?.[0];
        }
        return ownerObject?.name || "";
      },
    },
    {
      Header: t("Address"),
      accessor: "address",
      Cell: ({ value }) => {
        const { doorNo, buildingName, city, state } = value || {};

        const parts = [doorNo, buildingName, city, state].filter(Boolean);
        const finalAddress = parts.join(", ");

        return finalAddress || "-";
      },
    },
    {
      Header: t("Plot Area"),
      accessor: "landArea",
      Cell: ({ value }) => value || t("CS_NA"),
    },
    {
      Header: t(""),
      accessor: "id",
      Cell: ({ value }) => (
        <SubmitBar
          label={t("Select")}
          onSubmit={() => {
            const selectedProperty = propertyData?.find((val) => val?.id === value);
            onPropertySelect(selectedProperty);
            closeModal();
          }}
          style={{ width: "100px" }}
        />
      ),
    },
  ];

  const { data: fetchedLocalities, isLoading: isBoundaryLoading } = Digit.Hooks.useBoundaryLocalities(tenantId, "revenue", {}, t);

  const searchProperty = async () => {
    if (mobileNumber && !Digit.Utils.getPattern("MobileNo").test(mobileNumber)) {
      setShowToast({ error: true, label: "CORE_COMMON_APPLICANT_MOBILE_NUMBER_INVALID" });
      return;
    }
    if (name && !selectedLocality?.code) {
      setShowToast({ error: true, label: "PLEASE_SELECT_LOCALITY_WITH_NAME" });
      return;
    }
    if (!(name || propertyId || mobileNumber) && selectedLocality?.code) {
      setShowToast({ error: true, label: "CAN_NOT_SEARCH_ONLY_BASED_ON_LOCALITY" });
      return;
    }
    setIsLoading(true);

    try {
      const fetchedData = await Digit.PTService.search({
        tenantId,
        filters: {
          ...(propertyId?.length > 0 ? { propertyIds: propertyId } : {}),
          ...(mobileNumber?.length > 0 ? { mobileNumber: mobileNumber } : {}),
          ...(selectedLocality?.code?.length > 0 ? { locality: selectedLocality?.code } : {}),
          ...(name?.length > 0 ? { name: name } : {}),
        },
      });
      if (fetchedData?.Properties?.length > 0) {
        setIsLoading(false);
        setPropertyData(fetchedData?.Properties);
      } else {
        setIsLoading(false);
        setShowToast({ error: true, label: "CS_PT_NO_PROPERTIES_FOUND" });
        return;
      }
    } catch (err) {
      setIsLoading(false);
      setShowToast({ error: true, label: t(err.message) });
      return;
    }
  };

  const handlePropertyChange = (e) => {
    setPropertyId(e.target.value);
  };

  const handleMobileChange = (e) => {
    setMobileNumber(e.target.value);
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const propertyIdInput = {
    label: "PROPERTY_ID",
    type: "text",
    name: "id",
    isMandatory: false,
  };

  function selectLocality(locality) {
    setSelectedLocality(locality);
  }

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(null);
      }, 3000); // auto close after 3 sec

      return () => clearTimeout(timer); // cleanup
    }
  }, [showToast]);

  if (isBoundaryLoading) return <Loader />;

  return (
    <React.Fragment>
      <Modal className="property-search-modal"
        headerBarEnd={<CloseBtn onClick={closeModal} />}
        formId="modal-action"
        popupStyles={{
          width: "unset",
          minWidth: "1000px",
          padding: "20px",
        }}
        hideSubmit={true}
      >
        <LabelFieldPair>
          <div
            className="field ndc_property_search"
            style={{
              display: "flex",
              gap: "16px",
              width: "100%",
              ...(isMobile
                ? {
                    flexDirection: "column",
                  }
                : {}),
            }}
            ref={myElementRef}
            id="search-property-field"
          >
            <TextInput
              key={propertyIdInput.name}
              value={propertyId}
              onChange={handlePropertyChange}
              disable={false}
              placeholder={t("PT_PROPERTY_ID_PLACEHOLDER")}
              defaultValue={undefined}
            />
            <TextInput
              key={"mobileNumber"}
              value={mobileNumber}
              onChange={handleMobileChange}
              disable={false}
              maxlength={10}
              placeholder={t("NOC_OWNER_MOBILE_NO_PLACEHOLDER")}
              defaultValue={undefined}
            />
            <TextInput
              key={"name"}
              value={name}
              onChange={handleNameChange}
              disable={false}
              placeholder={t("BPA_ENTER_APPLICANT_NAME_PLACEHOLDER")}
              defaultValue={undefined}
            />
            <Dropdown
              optionCardStyles={{ maxHeight: "20vmax", overflow: "scroll", marginTop: "20px" }}
              isMandatory={false}
              option={fetchedLocalities.sort((a, b) => a.name.localeCompare(b.name))}
              selected={selectedLocality}
              optionKey="i18nkey"
              select={selectLocality}
              t={t}
              placeholder={t("BPA_LOC_MOHALLA_LABEL")}
            />
            {!isSearchClicked && (
              <button className="submit-bar" type="button" style={{ color: "white", width: "100%", maxWidth: "100px" }} onClick={searchProperty}>
                {`${t("PT_SEARCH")}`}
              </button>
            )}
          </div>
        </LabelFieldPair>
        {propertyData?.length > 0 && (
          <StatusTable>
            {isLoading ? (
              <Loader />
            ) : (
              <Table
                className="customTable table-border-style"
                t={t}
                data={propertyData}
                columns={documentsColumns}
                getCellProps={() => ({ style: {} })}
                disableSort={false}
                autoSort={true}
                manualPagination={false}
                isPaginationRequired={false}
              />
            )}
          </StatusTable>
        )}

        {showToast && (
          <Toast
            isDleteBtn={true}
            labelstyle={{ width: "100%" }}
            error={showToast.error}
            warning={showToast.warning}
            label={t(showToast.label)}
            onClose={() => {
              setShowToast(null);
            }}
          />
        )}
      </Modal>
    </React.Fragment>
  );
};

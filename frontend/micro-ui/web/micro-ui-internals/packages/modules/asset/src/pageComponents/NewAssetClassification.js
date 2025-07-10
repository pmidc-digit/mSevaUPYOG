import React, { useEffect, useState } from "react";
import { FormStep, TextInput, CardLabel, InfoBannerIcon, Dropdown, TextArea } from "@mseva/digit-ui-react-components";
import { useLocation } from "react-router-dom";
import Timeline from "../components/ASTTimeline";
import { Controller, useForm } from "react-hook-form";

const NewAssetClassification = ({ t, config, onSelect, userType, formData }) => {
  const { control } = useForm();
  const { pathname: url } = useLocation();
  let index = 0;
  let validation = {};

  const calculateCurrentFinancialYear = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; // getMonth() is zero-based
    if (month >= 4) {
      return `${year}-${year + 1}`;
    } else {
      return `${year - 1}-${year}`;
    }
  };

  const initialFinancialYear = calculateCurrentFinancialYear();

  // data set priveis
  const [assetclassification, setassetclassification] = useState(
    (formData.asset && formData.asset[index] && formData.asset[index].assetclassification) || formData?.asset?.assetclassification || ""
  );
  const [assettype, setassettype] = useState(
    (formData.asset && formData.asset[index] && formData.asset[index].assettype) || formData?.asset?.assettype || ""
  );
  const [assetsubtype, setassetsubtype] = useState(
    (formData.asset && formData.asset[index] && formData.asset[index].assetsubtype) || formData?.asset?.assetsubtype || ""
  );

  const [assetparentsubCategory, setassetparentsubCategory] = useState(
    (formData.asset && formData.asset[index] && formData.asset[index].assetparentsubCategory) || formData?.asset?.assetparentsubCategory || ""
  );

  const [BookPagereference, setBookPagereference] = useState(
    (formData.asset && formData.asset[index] && formData.asset[index].BookPagereference) || formData?.asset?.BookPagereference || ""
  );
  const [AssetName, setAssetName] = useState(
    (formData.asset && formData.asset[index] && formData.asset[index].AssetName) || formData?.asset?.AssetName || ""
  );
  const [Assetdescription, setAssetdescription] = useState(
    (formData.asset && formData.asset[index] && formData.asset[index].Assetdescription) || formData?.asset?.Assetdescription || ""
  );
  const [Department, setDepartment] = useState(
    (formData.asset && formData.asset[index] && formData.asset[index].Department) || formData?.asset?.Department || ""
  );

  const [assetsOfType, setAssetsOfType] = useState(
    (formData.asset && formData.asset[index] && formData.asset[index].assetsOfType) || formData?.asset?.assetsOfType || ""
  );
  const [assetsUsage, setAssetsUsage] = useState(
    (formData.asset && formData.asset[index] && formData.asset[index].assetsUsage) || formData?.asset?.assetsUsage || ""
  );
  const [assetAssignable, setAssetAssignable] = useState(
    (formData.asset && formData.asset[index] && formData.asset[index].assetAssignable) || formData?.asset?.assetAssignable || ""
  );

  const [financialYear, setfinancialYear] = useState(
    (formData.asset && formData.asset[index] && formData.asset[index].financialYear) || formData?.asset?.financialYear || initialFinancialYear
  );
  const [sourceOfFinance, setsourceOfFinance] = useState(
    (formData.asset && formData.asset[index] && formData.asset[index].sourceOfFinance) || formData?.asset?.sourceOfFinance || ""
  );

  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();

  // const { data: Menu_Asset } = Digit.Hooks.asset.useAssetClassification(stateId, "ASSET", "assetClassification"); // hook for asset classification Type
  const { data: Menu_Asset } = Digit.Hooks.useCustomMDMS(Digit.ULBService.getStateId(), "ASSET", [{ name: "assetClassification" }], {
    select: (data) => {
      const formattedData = data?.["ASSET"]?.["assetClassification"];
      const activeData = formattedData?.filter((item) => item.active === true);
      return activeData;
    },
  });

  // const { data: Asset_Type } = Digit.Hooks.asset.useAssetType(stateId, "ASSET", "assetParentCategory");
  const { data: Asset_Type } = Digit.Hooks.useCustomMDMS(Digit.ULBService.getStateId(), "ASSET", [{ name: "assetParentCategory" }], {
    select: (data) => {
      const formattedData = data?.["ASSET"]?.["assetParentCategory"];
      const activeData = formattedData?.filter((item) => item.active === true);
      return activeData;
    },
  });

  const { data: Asset_Sub_Type } = Digit.Hooks.asset.useAssetSubType(stateId, "ASSET", "assetCategory"); // hooks for Asset Parent Category


  // For Sub Catagories
  const { data: Asset_Parent_Sub_Type } = Digit.Hooks.useCustomMDMS(Digit.ULBService.getStateId(), "ASSET", [{ name: "assetSubCategory" }], {
    select: (data) => {
      const formattedData = data?.["ASSET"]?.["assetSubCategory"];
      const activeData = formattedData?.filter((item) => item.active === true);
      return activeData;
    },
  });

  const { data: sourceofFinanceMDMS } = Digit.Hooks.useCustomMDMS(Digit.ULBService.getStateId(), "ASSET", [{ name: "SourceFinance" }], {
    select: (data) => {
      const formattedData = data?.["ASSET"]?.["SourceFinance"];
      const activeData = formattedData?.filter((item) => item.active === true);
      return activeData;
    },
  }); // Note : used direct custom MDMS to get the Data ,Do not copy and paste without understanding the Context

  let sourcefinance = [];

  sourceofFinanceMDMS &&
    sourceofFinanceMDMS.map((finance) => {
      sourcefinance.push({ i18nKey: `AST_${finance.code}`, code: `${finance.code}`, value: `${finance.name}` });
    });

  const { data: currentFinancialYear } = Digit.Hooks.useCustomMDMS(Digit.ULBService.getStateId(), "ASSET", [{ name: "FinancialYear" }], {
    select: (data) => {
      const formattedData = data?.["ASSET"]?.["FinancialYear"];
      return formattedData;
    },
  });

  let financal = [];

  currentFinancialYear &&
    currentFinancialYear.map((financialyear) => {
      financal.push({ i18nKey: `${financialyear.code}`, code: `${financialyear.code}`, value: `${financialyear.name}` });
    });

  const { data: departmentName } = Digit.Hooks.useCustomMDMS(Digit.ULBService.getStateId(), "common-masters", [{ name: "Department" }], {
    select: (data) => {
      const formattedData = data?.["common-masters"]?.["Department"];
      const activeData = formattedData?.filter((item) => item.active === true);
      return activeData;
    },
  });
  let departNamefromMDMS = [];

  departmentName &&
    departmentName.map((departmentname) => {
      departNamefromMDMS.push({
        i18nKey: `COMMON_MASTERS_DEPARTMENT_${departmentname.code}`,
        code: `${departmentname.code}`,
        value: `COMMON_MASTERS_DEPARTMENT_${departmentname.code}`,
      });
    });
  let menu_Asset = []; //variable name for assetCalssification
  let asset_type = []; //variable name for asset type
  let asset_sub_type = []; //variable name for asset sub  parent caregory
  let asset_parent_sub_category = [];

  Menu_Asset &&
    Menu_Asset.map((asset_mdms) => {
      menu_Asset.push({ i18nKey: `${asset_mdms.name}`, code: `${asset_mdms.code}`, value: `${asset_mdms.name}` });
    });

  Asset_Type &&
    Asset_Type.map((asset_type_mdms) => {
      if (asset_type_mdms.assetClassification == assetclassification?.code) {
        asset_type.push({
          i18nKey: `${asset_type_mdms.name}`,
          code: `${asset_type_mdms.code}`,
          value: `${asset_type_mdms.name}`,
        });
      }
    });

  Asset_Sub_Type &&
    Asset_Sub_Type.map((asset_sub_type_mdms) => {
      if (asset_sub_type_mdms.assetParentCategory == assettype?.code) {
        asset_sub_type.push({
          i18nKey: `${asset_sub_type_mdms.name}`,
          code: `${asset_sub_type_mdms.code}`,
          value: `${asset_sub_type_mdms.name}`,
        });
      }
    });

  Asset_Parent_Sub_Type &&
    Asset_Parent_Sub_Type.map((asset_parent_mdms) => {
      if (asset_parent_mdms.assetCategory == assetsubtype?.code) {
        asset_parent_sub_category.push({
          i18nKey: `${asset_parent_mdms.name}`,
          code: `${asset_parent_mdms.code}`,
          value: `${asset_parent_mdms.name}`,
        });
      }
    });

  function setAssetClassification(e) {
    setassetclassification(e.target.value);
  }
  function setAssetType(e) {
    setassettype(e.target.value);
  }

  function setFinancialYear(e) {
    setfinancialYear(e.target.value);
  }

  function setSourceOfFinance(e) {
    setsourceOfFinance(e.target.value);
  }

  function setAssetSubType(e) {
    setassetsubtype(e.target.value);
  }

  function setbookpagereference(e) {
    setBookPagereference(e.target.value);
  }
  function setassetname(e) {
    setAssetName(e.target.value);
  }
  function setassetDescription(e) {
    setAssetdescription(e.target.value);
  }
  function setdepartment(e) {
    setDepartment(e.target.value);
  }

  const goNext = () => {
    let owner = formData.asset && formData.asset[index];
    let ownerStep;
    if (userType === "citizen") {
      ownerStep = { ...owner, financialYear, sourceOfFinance, assetclassification, assetparentsubCategory, assetsubtype, assettype };
      onSelect(config.key, { ...formData[config.key], ...ownerStep }, false, index);
    } else {
      ownerStep = {
        ...owner,
        financialYear,
        sourceOfFinance,
        assetclassification,
        assetparentsubCategory,
        assetsubtype,
        assettype,
        BookPagereference,
        AssetName,
        Department,
        assetsOfType,
        assetsUsage,
        assetAssignable,
        Assetdescription,
      };
      onSelect(config.key, ownerStep, false, index);
    }
  };

  const onSkip = () => onSelect();

  useEffect(() => {
    if (userType === "citizen") {
      goNext();
    }
  }, [
    financialYear,
    sourceOfFinance,
    assetclassification,
    assetsubtype,
    assettype,
    assetparentsubCategory,
    BookPagereference,
    AssetName,
    Department,
    assetsOfType,
    assetsUsage,
    assetAssignable,
    Assetdescription,
  ]);



  const { data: assetCurrentUsageData } = Digit.Hooks.useCustomMDMS(Digit.ULBService.getStateId(), "ASSET", [{ name: "AssetUsage" }], {
    select: (data) => {
      const formattedData = data?.["ASSET"]?.["AssetUsage"];
      return formattedData;
    },
  });
  let assetCurrentUsage = [];

  assetCurrentUsageData &&
    assetCurrentUsageData.map((assT) => {
      assetCurrentUsage.push({ i18nKey: `${assT.code}`, code: `${assT.code}`, value: `${assT.name}` });
    });

    // This is use for Asset Assigned / Not Assigned menu
    let assetAssignableMenu = [
      {i18nKey: 'YES', code: 'YES', value: 'YES'},
      {i18nKey: 'NO', code: 'NO', value: 'NO'},
    ];
  
    
  return (
    <React.Fragment>
      {window.location.href.includes("/employee") ? <Timeline currentStep={1} /> : null}

      <FormStep
        config={config}
        onSelect={goNext}
        onSkip={onSkip}
        t={t}
        isDisabled={!assetclassification || !assetsubtype || !BookPagereference}
      >
        <div>
          <div>
            {t("AST_FINANCIAL_YEAR")} <span style={{ color: "red" }}>*</span>
            <div className="tooltip" style={{ width: "12px", height: "5px", marginLeft: "10px", display: "inline-flex", alignItems: "center" }}>
              <InfoBannerIcon />
              <span
                className="tooltiptext"
                style={{
                  whiteSpace: "pre-wrap",
                  fontSize: "small",
                  wordWrap: "break-word",
                  width: "300px",
                  marginLeft: "15px",
                  marginBottom: "-10px",
                }}
              >
                {`${t(`AST_WHICH_FINANCIAL_YEAR`)}`}
              </span>
            </div>
          </div>

          <Controller
            control={control}
            name={"financialYear"}
            defaultValue={financialYear}
            rules={{ required: t("CORE_COMMON_REQUIRED_ERRMSG") }}
            render={({ field }) => (
              <Dropdown
                className="form-field"
                selected={financialYear}
                select={setfinancialYear}
                option={financal}
                optionKey="i18nKey"
                placeholder={"Select"}
                t={t}
              />
            )}
          />

          <div>
            {t("AST_SOURCE_FINANCE")} <span style={{ color: "red" }}>*</span>
            <div className="tooltip" style={{ width: "12px", height: "5px", marginLeft: "10px", display: "inline-flex", alignItems: "center" }}>
              <InfoBannerIcon />
              <span
                className="tooltiptext"
                style={{
                  whiteSpace: "pre-wrap",
                  fontSize: "small",
                  wordWrap: "break-word",
                  width: "300px",
                  marginLeft: "15px",
                  marginBottom: "-10px",
                }}
              >
                {`${t(`AST_SOURCE_OF_FUNDING`)}`}
              </span>
            </div>
          </div>
          <Controller
            control={control}
            name={"sourceOfFinance"}
            defaultValue={sourceOfFinance}
            rules={{ required: t("CORE_COMMON_REQUIRED_ERRMSG") }}
            render={(props) => (
              <Dropdown
                className="form-field"
                selected={sourceOfFinance}
                select={setsourceOfFinance}
                option={sourcefinance}
                optionKey="i18nKey"
                placeholder={"Select"}
                t={t}
              />
            )}
          />

          <div>
            {t("AST_CATEGORY")} <span style={{ color: "red" }}>*</span>
            <div className="tooltip" style={{ width: "12px", height: "5px", marginLeft: "10px", display: "inline-flex", alignItems: "center" }}>
              <InfoBannerIcon />
              <span
                className="tooltiptext"
                style={{
                  whiteSpace: "pre-wrap",
                  fontSize: "small",
                  wordWrap: "break-word",
                  width: "300px",
                  marginLeft: "15px",
                  marginBottom: "-10px",
                }}
              >
                {`${t(`AST_CLASSIFICATION_ASSET`)}`}
              </span>
            </div>
          </div>
          <Controller
            control={control}
            name={"assetclassification"}
            defaultValue={assetclassification}
            rules={{ required: t("CORE_COMMON_REQUIRED_ERRMSG") }}
            render={(props) => (
              <Dropdown
                className="form-field"
                selected={assetclassification}
                select={setassetclassification}
                option={menu_Asset}
                optionKey="i18nKey"
                placeholder={"Select"}
                t={t}
              />
            )}
          />
          <div>{`${t("AST_PARENT_CATEGORY")}`} <span style={{ color: "red" }}>*</span></div>
          <Controller
            control={control}
            name={"assettype"}
            defaultValue={assettype}
            rules={{ required: t("CORE_COMMON_REQUIRED_ERRMSG") }}
            render={(props) => (
              <Dropdown
                className="form-field"
                selected={assettype}
                select={setassettype}
                option={asset_type}
                optionKey="i18nKey"
                placeholder={"Select"}
                t={t}
              />
            )}
          />
          <div>{`${t("AST_SUB_CATEGORY")}`} <span style={{ color: "red" }}>*</span></div>
          <Controller
            control={control}
            name={"assetsubtype"}
            defaultValue={assetsubtype}
            rules={{ required: t("CORE_COMMON_REQUIRED_ERRMSG") }}
            render={(props) => (
              <Dropdown
                className="form-field"
                selected={assetsubtype}
                select={setassetsubtype}
                option={asset_sub_type}
                optionKey="i18nKey"
                placeholder={"Select"}
                t={t}
              />
            )}
          />

          <div>{`${t("AST_CATEGORY_SUB_CATEGORY")}`}</div>
          <Controller
            control={control}
            name={"assetparentsubCategory"}
            defaultValue={assetparentsubCategory}
            rules={{ required: t("CORE_COMMON_REQUIRED_ERRMSG") }}
            render={(props) => (
              <Dropdown
                className="form-field"
                selected={assetparentsubCategory}
                select={setassetparentsubCategory}
                option={asset_parent_sub_category}
                optionKey="i18nKey"
                placeholder={"Select"}
                t={t}
              />
            )}
          />
          {/* <div>{t("AST_TYPE")}</div>
          <Controller
            control={control}
            name={"assetsOfType"}
            defaultValue={assetsOfType}
            rules={{ required: t("CORE_COMMON_REQUIRED_ERRMSG") }}
            render={(props) => (
              <Dropdown
                className="form-field"
                selected={assetsOfType}
                select={setAssetsOfType}
                option={assetType}
                optionKey="i18nKey"
                placeholder={"Select"}
                t={t}
              />
            )}
          /> */}

          <div>
            {t("AST_BOOK_REF_SERIAL_NUM")} <span style={{ color: "red" }}>*</span>
            <div className="tooltip" style={{ width: "12px", height: "5px", marginLeft: "10px", display: "inline-flex", alignItems: "center" }}>
              <InfoBannerIcon />
              <span
                className="tooltiptext"
                style={{
                  whiteSpace: "pre-wrap",
                  fontSize: "small",
                  wordWrap: "break-word",
                  width: "300px",
                  marginLeft: "15px",
                  marginBottom: "-10px",
                }}
              >
                {`${t(`AST_BOOK_REF_NUMBER`)}`}
              </span>
            </div>
          </div>
          <TextInput
            t={t}
            type={"text"}
            isMandatory={false}
            optionKey="i18nKey"
            name="BookPagereference"
            value={BookPagereference}
            onChange={setbookpagereference}
            style={{ width: "50%" }}
            ValidationRequired={false}
            {...(validation = {
              isRequired: true,
              pattern: "^[a-zA-Z0-9/-]*$",
              type: "text",
              title: t("PT_NAME_ERROR_MESSAGE"),
            })}
          />

          <div>{`${t("AST_NAME")}`} <span style={{ color: "red" }}>*</span> </div>
          <TextInput
            t={t}
            type={"text"}
            isMandatory={false}
            optionKey="i18nKey"
            name="AssetName"
            value={AssetName}
            onChange={setassetname}
            style={{ width: "50%" }}
            ValidationRequired={false}
            {...(validation = {
              isRequired: true,
              pattern: "^[a-zA-Z0-9/-]*$",
              type: "text",
              title: t("PT_NAME_ERROR_MESSAGE"),
            })}
          />

          <div>
            {t("ASSET_DESCRIPTION")}
            <div className="tooltip" style={{ width: "12px", height: "5px", marginLeft: "10px", display: "inline-flex", alignItems: "center" }}>
              <InfoBannerIcon />
              <span
                className="tooltiptext"
                style={{
                  whiteSpace: "pre-wrap",
                  fontSize: "small",
                  wordWrap: "break-word",
                  width: "300px",
                  marginLeft: "15px",
                  marginBottom: "-10px",
                }}
              >
                {`${t(`AST_ANY_DESCRIPTION`)}`}
              </span>
            </div>
          </div>

          <div className="form-field">
            <TextArea
              t={t}
              type={"textarea"}
              isMandatory={false}
              optionKey="i18nKey"
              name="Assetdescription"
              value={Assetdescription}
              onChange={setassetDescription}
              ValidationRequired={false}
              {...(validation = {
                isRequired: true,
                pattern: "^[a-zA-Z0-9/-]*$",
                type: "text",
                title: t("PT_NAME_ERROR_MESSAGE"),
              })}
            />
          </div>

          <div>
            {t("AST_DEPARTMENT")} <span style={{ color: "red" }}>*</span>
            <div className="tooltip" style={{ width: "12px", height: "5px", marginLeft: "10px", display: "inline-flex", alignItems: "center" }}>
              <InfoBannerIcon />
              <span
                className="tooltiptext"
                style={{
                  whiteSpace: "pre-wrap",
                  fontSize: "small",
                  wordWrap: "break-word",
                  width: "300px",
                  marginLeft: "15px",
                  marginBottom: "-10px",
                }}
              >
                {`${t(`AST_PROCURED_DEPARTMENT`)}`}
              </span>
            </div>
          </div>
          <Controller
            control={control}
            name={"Department"}
            defaultValue={Department}
            rules={{ required: t("CORE_COMMON_REQUIRED_ERRMSG") }}
            render={(props) => (
              <Dropdown
                className="form-field"
                selected={Department}
                select={setDepartment}
                option={departNamefromMDMS}
                optionKey="i18nKey"
                placeholder={"Select"}
                t={t}
              />
            )}
          />

          <div>{t("AST_USAGE")} <span style={{ color: "red" }}>*</span></div>
          <Controller
            control={control}
            name={"assetsUsage"}
            defaultValue={assetsUsage}
            rules={{ required: t("CORE_COMMON_REQUIRED_ERRMSG") }}
            render={(props) => (
              <Dropdown
                className="form-field"
                selected={assetsUsage}
                select={setAssetsUsage}
                option={assetCurrentUsage}
                optionKey="i18nKey"
                placeholder={"Select"}
                t={t}
              />
            )}
          />

          <div>{t("AST_STATUS_ASSIGNABLE")} <span style={{ color: "red" }}>*</span> </div>
          <Controller
            control={control}
            name={"assetAssignable"}
            defaultValue={assetAssignable}
            rules={{ required: t("CORE_COMMON_REQUIRED_ERRMSG") }}
            render={(props) => (
              <Dropdown
                className="form-field"
                selected={assetAssignable}
                select={setAssetAssignable}
                option={assetAssignableMenu}
                optionKey="i18nKey"
                placeholder={"Select"}
                t={t}
              />
            )}
          />
        </div>
      </FormStep>
    </React.Fragment>
  );
};

export default NewAssetClassification;

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const useSwachComplaintTypes = ({ stateCode }) => {
  const [complaintTypes, setComplaintTypes] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    (async () => {
      const res = await Digit.GetSwachBharatCategories.getMenu(stateCode, t);
      let menu = res.filter((o) => o.key !== "");
      menu.push({ key: "Others", name: t("SWACHBHARATCATEGORY.OTHERS") });
      setComplaintTypes(menu);
    })();
  }, [t, stateCode]);

  return complaintTypes;
};

export default useSwachComplaintTypes;

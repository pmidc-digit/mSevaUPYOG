import React, { useEffect, useState } from "react";

const useSwachComplaintSubType = (complaintType, t) => {
  const [subTypeMenu, setSubTypeMenu] = useState([]);

  useEffect(() => {
    (async () => {
      if (complaintType) {
        const menu = await Digit.GetSwachBharatCategories.getSubMenu(Digit.ULBService.getCurrentTenantId(), complaintType, t);
        setSubTypeMenu(menu);
      }
    })();
  }, [complaintType]);

  return subTypeMenu;
};

export default useSwachComplaintSubType;

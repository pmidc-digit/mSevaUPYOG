import React, { useEffect, useState } from "react";

const usechallangenerationTenants = () => {
  const tenantInfo = Digit.SessionStorage.get("ChallanGeneration_TENANTS");
  const [tenants, setTenants] = useState(tenantInfo ? tenantInfo : null);
  return tenants;
};

export default usechallangenerationTenants;

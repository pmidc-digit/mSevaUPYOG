import React, { useEffect, useState } from "react";

const useSwachTenants = () => {
  const tenantInfo = Digit.SessionStorage.get("SWACH_TENANTS");
  const [tenants, setTenants] = useState(tenantInfo ? tenantInfo : null);
  return tenants;
};

export default useSwachTenants;

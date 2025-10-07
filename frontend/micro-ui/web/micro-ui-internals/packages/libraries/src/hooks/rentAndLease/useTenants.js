import React, { useEffect, useState } from "react";

const useRentAndLeaseTenants = () => {
  const tenantInfo = Digit.SessionStorage.get("RentAndLease_TENANTS");
  const [tenants, setTenants] = useState(tenantInfo ? tenantInfo : null);
  return tenants;
};

export default useRentAndLeaseTenants;

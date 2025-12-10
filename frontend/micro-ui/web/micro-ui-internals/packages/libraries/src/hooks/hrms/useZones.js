import { useState, useEffect } from "react";

const useZones = (stateId, selectedULB) => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedULB) {
      setZones([]);
      return;
    }

    const fetchZones = async () => {
      try {
        setLoading(true);
        const response = await Digit.MDMSService.getMultipleTypes(stateId, "tenant", ["zoneMaster"]);
        const zoneMasterData = response?.tenant?.zoneMaster || [];
        const ulbZones = zoneMasterData.find((zm) => zm.tanentId === selectedULB.code);

        if (ulbZones?.zones) {
          const sortedZones = ulbZones.zones
            .map((zone) => ({ code: zone.code, name: zone.name }))
            .sort((a, b) => a.name.localeCompare(b.name));
          setZones(sortedZones);
        } else {
          setZones([]);
        }
      } catch (error) {
        setZones([]);
      } finally {
        setLoading(false);
      }
    };

    fetchZones();
  }, [selectedULB, stateId]);

  return { zones, loading };
};

export default useZones;

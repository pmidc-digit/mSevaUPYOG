package org.egov.edcr.feature;

import java.math.BigDecimal;

import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.LogManager;
import org.egov.edcr.entity.blackbox.PlanDetail;
import org.egov.edcr.service.LayerNames;
import org.egov.edcr.utility.Util;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class WaterTankCapacityExtract extends FeatureExtract {
    private static final Logger LOG = LogManager.getLogger(WaterTankCapacityExtract.class);
    @Autowired
    private LayerNames layerNames;

    @Override
    public PlanDetail extract(PlanDetail pl) {
        if (pl.getDoc().containsDXFLayer(layerNames.getLayerName("LAYER_NAME_WATER_TANK_CALCULATION"))) {
            String tankCapacity = Util.getMtextByLayerName(pl.getDoc(),
                    layerNames.getLayerName("LAYER_NAME_WATER_TANK_CALCULATION"),
                    layerNames.getLayerName("LAYER_NAME_WATER_TANK_CAPACITY_L"));
            if (tankCapacity != null && !tankCapacity.isEmpty()) {
                BigDecimal cap = Util.extractBigDecimalFromText(tankCapacity, pl,
                        layerNames.getLayerName("LAYER_NAME_WATER_TANK_CALCULATION"), "Water tank capacity");
                if (cap != null) {
                    pl.getUtility().setWaterTankCapacity(cap);
                }
            }
        }

        return pl;
    }

    @Override
    public PlanDetail validate(PlanDetail pl) {
        return pl;
    }

}

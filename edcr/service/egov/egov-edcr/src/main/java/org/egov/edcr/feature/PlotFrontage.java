package org.egov.edcr.feature;

import static org.egov.edcr.constants.DxfFileConstants.A;
import static org.egov.edcr.constants.DxfFileConstants.A2;
import static org.egov.edcr.constants.DxfFileConstants.A_AF;
import static org.egov.edcr.constants.DxfFileConstants.A_AIF;
import static org.egov.edcr.constants.DxfFileConstants.A_FH;
import static org.egov.edcr.constants.DxfFileConstants.A_SA;
import static org.egov.edcr.constants.DxfFileConstants.C;
import static org.egov.edcr.constants.DxfFileConstants.C_MA;
import static org.egov.edcr.constants.DxfFileConstants.C_MIP;
import static org.egov.edcr.constants.DxfFileConstants.C_MOP;
import static org.egov.edcr.constants.DxfFileConstants.D_A;
import static org.egov.edcr.constants.DxfFileConstants.D_B;
import static org.egov.edcr.constants.DxfFileConstants.D_C;
import static org.egov.edcr.constants.DxfFileConstants.E_CLG;
import static org.egov.edcr.constants.DxfFileConstants.E_EARC;
import static org.egov.edcr.constants.DxfFileConstants.E_NS;
import static org.egov.edcr.constants.DxfFileConstants.E_PS;
import static org.egov.edcr.constants.DxfFileConstants.E_SACA;
import static org.egov.edcr.constants.DxfFileConstants.E_SFDAP;
import static org.egov.edcr.constants.DxfFileConstants.E_SFMC;
import static org.egov.edcr.constants.DxfFileConstants.F;
import static org.egov.edcr.constants.DxfFileConstants.F_B;
import static org.egov.edcr.constants.DxfFileConstants.F_BU;
import static org.egov.edcr.constants.DxfFileConstants.F_CA;
import static org.egov.edcr.constants.DxfFileConstants.F_CNGS;
import static org.egov.edcr.constants.DxfFileConstants.F_D;
import static org.egov.edcr.constants.DxfFileConstants.F_HM;
import static org.egov.edcr.constants.DxfFileConstants.F_LB;
import static org.egov.edcr.constants.DxfFileConstants.F_MIP;
import static org.egov.edcr.constants.DxfFileConstants.F_MTP;
import static org.egov.edcr.constants.DxfFileConstants.F_PFSF;
import static org.egov.edcr.constants.DxfFileConstants.F_PFSS;
import static org.egov.edcr.constants.DxfFileConstants.F_PFST;
import static org.egov.edcr.constants.DxfFileConstants.F_PO;
import static org.egov.edcr.constants.DxfFileConstants.F_PS;
import static org.egov.edcr.constants.DxfFileConstants.F_RB;
import static org.egov.edcr.constants.DxfFileConstants.F_SCC;
import static org.egov.edcr.constants.DxfFileConstants.F_VGP;
import static org.egov.edcr.constants.DxfFileConstants.G_F;
import static org.egov.edcr.constants.DxfFileConstants.G_G;
import static org.egov.edcr.constants.DxfFileConstants.G_GIF;
import static org.egov.edcr.constants.DxfFileConstants.G_GIP;
import static org.egov.edcr.constants.DxfFileConstants.G_HI;
import static org.egov.edcr.constants.DxfFileConstants.G_ITF;
import static org.egov.edcr.constants.DxfFileConstants.G_ITP;
import static org.egov.edcr.constants.DxfFileConstants.G_KI;
import static org.egov.edcr.constants.DxfFileConstants.G_RSI;
import static org.egov.edcr.constants.DxfFileConstants.G_S;
import static org.egov.edcr.constants.DxfFileConstants.G_SI;
import static org.egov.edcr.constants.DxfFileConstants.G_TI;
import static org.egov.edcr.constants.DxfFileConstants.G_WT;
import static org.egov.edcr.constants.DxfFileConstants.H_PP;
import static org.egov.edcr.constants.DxfFileConstants.J;
import static org.egov.edcr.constants.DxfFileConstants.J_CNG;
import static org.egov.edcr.constants.DxfFileConstants.J_FCSS;
import static org.egov.edcr.constants.DxfFileConstants.J_FS;
import static org.egov.edcr.constants.DxfFileConstants.L_C;
import static org.egov.edcr.constants.DxfFileConstants.L_CO;
import static org.egov.edcr.constants.DxfFileConstants.L_ERC;
import static org.egov.edcr.constants.DxfFileConstants.L_GO;
import static org.egov.edcr.constants.DxfFileConstants.L_GP;
import static org.egov.edcr.constants.DxfFileConstants.L_MP;
import static org.egov.edcr.constants.DxfFileConstants.L_NH;
import static org.egov.edcr.constants.DxfFileConstants.L_NS;
import static org.egov.edcr.constants.DxfFileConstants.L_PS;
import static org.egov.edcr.constants.DxfFileConstants.M_DFPAB;
import static org.egov.edcr.constants.DxfFileConstants.M_HOTHC;
import static org.egov.edcr.constants.DxfFileConstants.M_NAPI;
import static org.egov.edcr.constants.DxfFileConstants.M_OHF;
import static org.egov.edcr.constants.DxfFileConstants.M_VH;
import static org.egov.edcr.constants.DxfFileConstants.R_R;
import static org.egov.edcr.constants.DxfFileConstants.S_BH;
import static org.egov.edcr.constants.DxfFileConstants.S_CA;
import static org.egov.edcr.constants.DxfFileConstants.S_CRC;
import static org.egov.edcr.constants.DxfFileConstants.S_ECFG;
import static org.egov.edcr.constants.DxfFileConstants.S_ICC;
import static org.egov.edcr.constants.DxfFileConstants.S_MCH;
import static org.egov.edcr.constants.DxfFileConstants.S_SAS;
import static org.egov.edcr.constants.DxfFileConstants.S_SC;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

import org.egov.common.entity.edcr.Block;
import org.egov.common.entity.edcr.Building;
import org.egov.common.entity.edcr.Floor;
import org.egov.common.entity.edcr.Measurement;
import org.egov.common.entity.edcr.Occupancy;
import org.egov.common.entity.edcr.OccupancyTypeHelper;
import org.egov.common.entity.edcr.Plan;
import org.egov.common.entity.edcr.Result;
import org.egov.common.entity.edcr.ScrutinyDetail;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class PlotFrontage extends FeatureProcess {

    private static final Logger LOG = LoggerFactory.getLogger(PlotFrontage.class);

    private static final String RULENO = "4.9";
    private BigDecimal permissableFrontage = BigDecimal.ZERO;
    
    private static final List<String> FAR_PRIORITY = Collections.unmodifiableList(
			Arrays.asList(S_ECFG, A_FH, S_SAS, D_B, D_C, D_A, H_PP, E_NS, M_DFPAB, E_PS, E_SFMC, E_SFDAP, E_EARC, S_MCH,
					S_BH, S_CRC, S_CA, S_SC, S_ICC, A2, E_CLG, M_OHF, M_VH, M_NAPI, A_SA, M_HOTHC, E_SACA,

					C_MA, C_MIP, C_MOP,

					F, A, C,

					J_FS, J_FCSS, J_CNG, J,

					A_AF, A_AIF,

					G_G, G_F, G_S, G_HI, G_WT, G_RSI, G_GIP, G_GIF, G_ITP, G_ITF, G_TI, G_KI, G_SI,

					L_GP, L_GO, L_NS, L_PS, L_CO, L_ERC, L_MP, L_NH, L_C,

					R_R,

					F_RB, F_HM, F_SCC, F_PO, F_B, F_LB, F_D, F_CA, F_VGP, F_BU, F_PFSF, F_PFST, F_PFSS, F_PS, F_CNGS));

    @Override
    public Map<String, Date> getAmendments() {
        return new LinkedHashMap<>();
    }

    @Override
    public Plan validate(Plan pl) {
        return pl;
    }

    @Override
    public Plan process(Plan pl) {

        try {

            ScrutinyDetail plotFrontageDetail = new ScrutinyDetail();
            plotFrontageDetail.setKey("Common_Plot-Frontage");

            plotFrontageDetail.addColumnHeading(1, RULE_NO);
            plotFrontageDetail.addColumnHeading(2, DESCRIPTION);
            plotFrontageDetail.addColumnHeading(3, PERMISSIBLE);
            plotFrontageDetail.addColumnHeading(4, PROVIDED);
            plotFrontageDetail.addColumnHeading(5, STATUS);

            BigDecimal frontageWidth = BigDecimal.ZERO;
            
            OccupancyTypeHelper mostRestrictiveOccupancy = pl.getVirtualBuilding().getMostRestrictiveFarHelper();
            if(mostRestrictiveOccupancy!=null &&
            		mostRestrictiveOccupancy.getSubtype()!=null &&
            		mostRestrictiveOccupancy.getSubtype().getCode()!=null) {            	
            	String subType = mostRestrictiveOccupancy.getSubtype().getCode();
            	if(F_MTP.equals(subType) || F_MIP.equals(subType)) {
            		if (F_MTP.equalsIgnoreCase(subType)) {
                		permissableFrontage = BigDecimal.valueOf(24.00);
    				} else if (F_MIP.equalsIgnoreCase(subType)) {				    
    					permissableFrontage = BigDecimal.valueOf(21.33);
    				}
                	
                	if (pl.getPlotFrontageList() != null) {
                        frontageWidth = pl.getPlotFrontageList()
                                .stream()
                                .filter(Objects::nonNull)
                                .map(Measurement::getWidth)
                                .filter(Objects::nonNull)
                                .reduce(BigDecimal.ZERO, BigDecimal::add).setScale(2, RoundingMode.HALF_UP);
                    }

                    boolean accepted = frontageWidth.compareTo(permissableFrontage) >= 0;

                    LOG.info("Plot Frontage Provided : {} m", frontageWidth);
                    LOG.info("Permissible Frontage   : {} m", permissableFrontage);
                    LOG.info("Plot Frontage Status   : {}", accepted ? "Accepted" : "Not Accepted");

                    Map<String, String> row = new HashMap<>();

                    row.put(RULE_NO, RULENO);
                    row.put(DESCRIPTION, "Plot Frontage");
                    row.put(PERMISSIBLE, permissableFrontage.stripTrailingZeros().toPlainString() + " m");
                    row.put(PROVIDED, frontageWidth.stripTrailingZeros().toPlainString() + " m");
                    row.put(STATUS,
                            accepted ? Result.Accepted.getResultVal() : Result.Not_Accepted.getResultVal());

                    plotFrontageDetail.getDetail().add(row);

                    pl.getReportOutput().getScrutinyDetails().add(plotFrontageDetail);
            	}
            	
            	
            }

            

        } catch (Exception e) {
            LOG.error("Error while processing Plot Frontage scrutiny.", e);
        }

        return pl;
    }
    
    

    
}
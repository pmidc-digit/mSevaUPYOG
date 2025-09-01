package org.egov.noc.calculator.web.models.noc;

import java.util.List;

public class NocMdms {
    private List<NocFee> NocFee; // Note: case-sensitive based on your JSON

    public List<NocFee> getNocFee() {
        return NocFee;
    }

    public void setNocFee(List<NocFee> NocFee) {
        this.NocFee = NocFee;
    }
}
package com.cdac.esign.xmlparser;

import javax.xml.bind.annotation.*;
import java.util.List;

@XmlRootElement(name = "EsignResp")
@XmlAccessorType(XmlAccessType.FIELD)
public class EsignResp {

    @XmlAttribute(name = "status")
    private String status;

    @XmlAttribute(name = "txn")
    private String txn;

    @XmlAttribute(name = "errMsg")
    private String error;

    @XmlElement(name = "Signatures")
    private Signatures signatures;

    // Getters & setters...
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getTxn() { return txn; }
    public void setTxn(String txn) { this.txn = txn; }
    public String getError() { return error; }
    public void setError(String error) { this.error = error; }
    public Signatures getSignatures() { return signatures; }
    public void setSignatures(Signatures signatures) { this.signatures = signatures; }

    // ===== Inner Classes =====
    @XmlAccessorType(XmlAccessType.FIELD)
    public static class Signatures {
        @XmlElement(name = "DocSig")
        private List<DocSig> list;

        public List<DocSig> getList() { return list; }
        public void setList(List<DocSig> list) { this.list = list; }
    }

    @XmlAccessorType(XmlAccessType.FIELD)
    public static class DocSig {
        @XmlElement(name = "Dsc")
        private String dsc;

        public String getDsc() { return dsc; }
        public void setDsc(String dsc) { this.dsc = dsc; }
    }
}

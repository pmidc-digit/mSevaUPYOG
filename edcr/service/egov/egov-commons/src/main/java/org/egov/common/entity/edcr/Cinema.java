package org.egov.common.entity.edcr;

import java.io.Serializable;
import java.util.List;

public class Cinema implements Serializable {

    private List<Measurement> cinemas;
    private Integer seats;
    private Integer noOfCinemas;

    public List<Measurement> getCinemas() {
        return cinemas;
    }

    public void setCinemas(List<Measurement> cinemas) {
        this.cinemas = cinemas;
    }

    public Integer getSeats() {
        return seats;
    }

    public void setSeats(Integer seats) {
        this.seats = seats;
    }

    public Integer getNoOfCinemas() {
        return noOfCinemas;
    }

    public void setNoOfCinemas(Integer noOfCinemas) {
        this.noOfCinemas = noOfCinemas;
    }
}

package org.egov.edcr.entity;

public enum RoadTypes {

    NH("National Highway"),
    SH("State Highway"),
    MDR("Major District Road"),
    SR("Bypass/Scheduled Road"),
    OTHER("Other Road");

    private final String description;

    RoadTypes(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

    public static String getCode(String roadType) {

        if (roadType == null) {
            return OTHER.name();
        }

        for (RoadTypes type : RoadTypes.values()) {
            if (type.description.equalsIgnoreCase(roadType.trim())) {
                return type.name();
            }
        }

        return OTHER.name();
    }
}

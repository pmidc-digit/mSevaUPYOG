package org.egov.commons.edcr.mdms.dataParser;

import java.math.BigDecimal;
import java.util.Map;

public class mdmsDataParser {

    private mdmsDataParser() {
        // Utility class, prevent instantiation
    }

    /**
     * Safely convert any object (Integer, Long, Double, BigDecimal, String) to BigDecimal.
     * If null or invalid, returns BigDecimal.ZERO.
     */
    public static BigDecimal toBigDecimal(Object value) {
        if (value == null) return BigDecimal.ZERO;

        try {
            if (value instanceof BigDecimal) {
                return (BigDecimal) value;
            } else if (value instanceof Integer) {
                return BigDecimal.valueOf(((Integer) value).longValue());
            } else if (value instanceof Long) {
                return BigDecimal.valueOf((Long) value);
            } else if (value instanceof Double) {
                return BigDecimal.valueOf((Double) value);
            } else if (value instanceof Float) {
                return BigDecimal.valueOf(((Float) value).doubleValue());
            } else if (value instanceof String) {
                return new BigDecimal((String) value);
            }
        } catch (Exception e) {
            // log here if needed
        }

        return BigDecimal.ZERO; // fallback
    }

    /** Convert object to Double safely. */
    public static Double toDouble(Object value) {
        BigDecimal bd = toBigDecimal(value);
        if (bd == null || bd.compareTo(BigDecimal.ZERO) == 0) {
            return 0.0;
        }
        return bd.doubleValue();
    }

    /** Convert object to Integer safely. */
    public static Integer toInteger(Object value) {
        BigDecimal bd = toBigDecimal(value);
        if (bd == null || bd.compareTo(BigDecimal.ZERO) == 0) {
            return 0;
        }
        return bd.intValue();
    }

    /** Convert object to Long safely. */
    public static Long toLong(Object value) {
        BigDecimal bd = toBigDecimal(value);
        if (bd == null || bd.compareTo(BigDecimal.ZERO) == 0) {
            return 0L;
        }
        return bd.longValue();
    }

    /** Convert object to String safely. */
    public static String toString(Object value) {
        return value == null ? "" : value.toString();
    }

    /**
     * Fetch value from Map with null-safety and parse to Double.
     * If key not found or null, returns 0.0.
     */
    public static Double getDouble(Map<String, Object> map, String key) {
        if (map == null || key == null) return 0.0;

        Object value = map.get(key);
        if (value == null) return 0.0;

        if (value instanceof Double) return (Double) value;
        if (value instanceof Integer) return ((Integer) value).doubleValue();
        if (value instanceof Long) return ((Long) value).doubleValue();
        if (value instanceof BigDecimal) return ((BigDecimal) value).doubleValue();
        if (value instanceof String) {
            try {
                return Double.parseDouble((String) value);
            } catch (NumberFormatException e) {
                return 0.0;
            }
        }
        return 0.0;
    }


    /** Same as above for BigDecimal */
    public static BigDecimal getBigDecimal(Map<String, Object> map, String key) {
        if (map == null || key == null) return BigDecimal.ZERO;
        return toBigDecimal(map.get(key));
    }
}
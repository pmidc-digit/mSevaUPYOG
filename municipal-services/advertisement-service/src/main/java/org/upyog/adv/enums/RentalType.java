package org.upyog.adv.enums;

/**
 * How the advertisement rate is applied.
 * <ul>
 *   <li>{@code FIXED} — charge the full period amount per complete billing period
 *       (e.g. ₹3000 per calendar month, regardless of 28/30/31 days).</li>
 *   <li>{@code DAILY} — divide the period amount by days-in-period and multiply
 *       by booking days (legacy behavior).</li>
 * </ul>
 */
public enum RentalType {
    FIXED,
    DAILY
}

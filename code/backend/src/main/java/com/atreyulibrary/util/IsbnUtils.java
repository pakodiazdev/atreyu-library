package com.atreyulibrary.util;

/**
 * Utility methods for ISBN validation and normalisation.
 */
public final class IsbnUtils {

    private IsbnUtils() {
    }

    /**
     * Validates an ISBN-13 string, optionally containing hyphens or spaces.
     *
     * @param isbn the raw ISBN string to validate
     * @return {@code true} if the string is a valid ISBN-13, {@code false} otherwise
     */
    public static boolean isValidIsbn13(final String isbn) {
        if (isbn == null) {
            return false;
        }
        final String digits = isbn.replaceAll("[\\s-]", "");
        if (digits.length() != 13 || !digits.matches("\\d+")) {
            return false;
        }
        int sum = 0;
        for (int i = 0; i < 12; i++) {
            final int digit = Character.getNumericValue(digits.charAt(i));
            sum += (i % 2 == 0) ? digit : digit * 3;
        }
        final int checkDigit = (10 - (sum % 10)) % 10;
        return checkDigit == Character.getNumericValue(digits.charAt(12));
    }

    /**
     * Strips hyphens and spaces from an ISBN string.
     * Other non-digit characters (e.g. letters) are preserved as-is.
     *
     * @param isbn the raw ISBN string
     * @return the string with hyphens and spaces removed, or {@code null} if input is {@code null}
     */
    public static String normalise(final String isbn) {
        if (isbn == null) {
            return null;
        }
        return isbn.replaceAll("[\\s-]", "");
    }
}

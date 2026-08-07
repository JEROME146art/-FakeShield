package com.fakeshield.model;

public enum NewsStatus {

    REAL("Real News", "#28a745"),
    FAKE("Fake News", "#dc3545"),
    SUSPICIOUS("Suspicious", "#ffc107"),
    UNVERIFIED("Unverified", "#6c757d"),
    SATIRE("Satire", "#17a2b8");

    private final String displayName;
    private final String colorCode;

    NewsStatus(String displayName, String colorCode) {
        this.displayName = displayName;
        this.colorCode = colorCode;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getColorCode() {
        return colorCode;
    }
}
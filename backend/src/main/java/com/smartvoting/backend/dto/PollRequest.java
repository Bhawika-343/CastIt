package com.smartvoting.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public class PollRequest {
    private String question;
    private String category;
    private LocalDateTime expiresAt;
    private List<String> options;

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    public List<String> getOptions() { return options; }
    public void setOptions(List<String> options) { this.options = options; }
}

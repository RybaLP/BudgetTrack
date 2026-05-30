package com.filip.budgetapp.transaction.dto;

import com.filip.budgetapp.transaction.TransactionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record TransactionRequest(
        @NotNull(message = "Amount cannot be null")
        @Positive(message = "Amount must be greater than 0")
        BigDecimal amount,

        @NotNull(message = "Transaction type cannot be null")
        TransactionType type,

        @NotBlank(message = "Category cannot be empty")
        String category,

        String description,

        @NotNull(message = "Account ID cannot be null")
        Long accountId
) {}
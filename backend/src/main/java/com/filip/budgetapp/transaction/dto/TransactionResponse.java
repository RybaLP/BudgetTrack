package com.filip.budgetapp.transaction.dto;

import com.filip.budgetapp.transaction.TransactionType;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TransactionResponse(
        Long id,
        BigDecimal amount,
        TransactionType type,
        String category,
        String description,
        LocalDateTime transactionDate,
        Long accountId
) {}
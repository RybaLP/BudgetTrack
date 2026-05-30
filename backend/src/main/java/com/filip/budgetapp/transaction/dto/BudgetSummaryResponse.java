package com.filip.budgetapp.transaction.dto;

import java.math.BigDecimal;
import java.util.Map;

public record BudgetSummaryResponse(
        BigDecimal totalIncome,
        BigDecimal totalExpenses,
        Map<String, BigDecimal> expensesByCategory
) {}
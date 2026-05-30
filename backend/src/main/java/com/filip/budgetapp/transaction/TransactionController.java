package com.filip.budgetapp.transaction;

import com.filip.budgetapp.transaction.dto.BudgetSummaryResponse;
import com.filip.budgetapp.transaction.dto.TransactionRequest;
import com.filip.budgetapp.transaction.dto.TransactionResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/transactions")
@io.swagger.v3.oas.annotations.tags.Tag(name = "Transactions", description = "Operacje na transakcjach i raporty")
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping
    public ResponseEntity<List<TransactionResponse>> getTransactions(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to
    ) {
        LocalDateTime finalTo = (to == null) ? LocalDateTime.now() : to;
        LocalDateTime finalFrom = (from == null) ? LocalDateTime.of(2000, 1, 1, 0, 0) : from;

        List<TransactionResponse> transactions = transactionService.getFilteredTransactions(category, finalFrom, finalTo);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/summary")
    public ResponseEntity<BudgetSummaryResponse> getBudgetSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to
    ) {
        LocalDateTime finalTo = (to == null) ? LocalDateTime.now() : to;
        LocalDateTime finalFrom = (from == null) ? LocalDateTime.of(2000, 1, 1, 0, 0) : from;

        BudgetSummaryResponse summary = transactionService.getBudgetSummary(finalFrom, finalTo);
        return ResponseEntity.ok(summary);
    }

    @PostMapping
    public ResponseEntity<TransactionResponse> createTransaction(@Valid @RequestBody TransactionRequest request) {
        TransactionResponse createdTransaction = transactionService.createTransaction(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTransaction);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.noContent().build();
    }
}
package com.filip.budgetapp.transaction;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    boolean existsByAccountId(Long accountId);

    @Query(value = """
        SELECT * FROM transactions t WHERE
        (CAST(:category AS text) IS NULL OR t.category = :category) AND
        t.transaction_date >= CAST(:fromDate AS timestamp) AND
        t.transaction_date <= CAST(:toDate AS timestamp)
        """, nativeQuery = true)
    List<Transaction> filterTransactions(
            @Param("category") String category,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate
    );
}
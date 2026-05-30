package com.filip.budgetapp.transaction;

import com.filip.budgetapp.account.Account;
import com.filip.budgetapp.account.AccountRepository;
import com.filip.budgetapp.transaction.dto.BudgetSummaryResponse;
import com.filip.budgetapp.transaction.dto.TransactionRequest;
import com.filip.budgetapp.transaction.dto.TransactionResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("TransactionService unit tests")
class TransactionServiceTest {

    @Mock private TransactionRepository transactionRepository;
    @Mock private AccountRepository accountRepository;
    @Mock private TransactionMapper transactionMapper;
    @InjectMocks private TransactionService transactionService;

    private Account account;
    private TransactionRequest expenseRequest;
    private TransactionRequest incomeRequest;

    @BeforeEach
    void setUp() {
        account = Account.builder()
                .id(1L)
                .name("Main Account")
                .balance(new BigDecimal("1000.00"))
                .build();

        expenseRequest = new TransactionRequest(
                new BigDecimal("200.00"),
                TransactionType.EXPENSE,
                "Food",
                "Groceries from supermarket",
                1L
        );

        incomeRequest = new TransactionRequest(
                new BigDecimal("500.00"),
                TransactionType.INCOME,
                "Salary",
                "Monthly payroll",
                1L
        );
    }

    // ─────────────────────────────────────────────────────────────
    // CREATE
    // ─────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("createTransaction()")
    class CreateTransactionTests {

        @Test
        @DisplayName("EXPENSE → decreases account balance")
        void shouldDecreaseBalanceOnExpense() {
            Transaction saved = new Transaction();
            TransactionResponse expected = new TransactionResponse(
                    1L, new BigDecimal("200.00"), TransactionType.EXPENSE, "Food", "Groceries from supermarket", null, 1L
            );

            when(accountRepository.findById(1L)).thenReturn(Optional.of(account));
            when(transactionRepository.save(any())).thenReturn(saved);
            when(transactionMapper.toResponse(saved)).thenReturn(expected);

            TransactionResponse result = transactionService.createTransaction(expenseRequest);

            assertNotNull(result);
            assertEquals(0, new BigDecimal("800.00").compareTo(account.getBalance()));
            verify(accountRepository).save(account);
            verify(transactionRepository).save(any(Transaction.class));
        }

        @Test
        @DisplayName("INCOME → increases account balance")
        void shouldIncreaseBalanceOnIncome() {
            Transaction saved = new Transaction();
            TransactionResponse expected = new TransactionResponse(
                    2L, new BigDecimal("500.00"), TransactionType.INCOME, "Salary", "Monthly payroll", null, 1L
            );

            when(accountRepository.findById(1L)).thenReturn(Optional.of(account));
            when(transactionRepository.save(any())).thenReturn(saved);
            when(transactionMapper.toResponse(saved)).thenReturn(expected);

            TransactionResponse result = transactionService.createTransaction(incomeRequest);

            assertNotNull(result);
            assertEquals(0, new BigDecimal("1500.00").compareTo(account.getBalance()));
            verify(accountRepository).save(account);
            verify(transactionRepository).save(any(Transaction.class));
        }

        @Test
        @DisplayName("account not found → 404 NOT_FOUND")
        void shouldThrow404WhenAccountNotFound() {
            when(accountRepository.findById(1L)).thenReturn(Optional.empty());

            ResponseStatusException ex = assertThrows(
                    ResponseStatusException.class,
                    () -> transactionService.createTransaction(expenseRequest)
            );

            assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
            assertEquals("Account not found", ex.getReason());
            verify(accountRepository, never()).save(any());
            verify(transactionRepository, never()).save(any());
        }

        @Test
        @DisplayName("saves transaction linked to correct account")
        void shouldSaveTransactionLinkedToAccount() {
            Transaction saved = new Transaction();
            when(accountRepository.findById(1L)).thenReturn(Optional.of(account));
            when(transactionRepository.save(any())).thenReturn(saved);
            when(transactionMapper.toResponse(saved)).thenReturn(mock(TransactionResponse.class));

            transactionService.createTransaction(expenseRequest);

            verify(transactionRepository).save(argThat(t ->
                    t.getAccount().equals(account) &&
                            t.getType() == TransactionType.EXPENSE &&
                            t.getAmount().compareTo(new BigDecimal("200.00")) == 0
            ));
        }
    }

    // ─────────────────────────────────────────────────────────────
    // DELETE
    // ─────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("deleteTransaction()")
    class DeleteTransactionTests {

        @Test
        @DisplayName("delete EXPENSE → refunds balance")
        void shouldRefundBalanceWhenDeletingExpense() {
            Transaction tx = Transaction.builder()
                    .id(10L)
                    .amount(new BigDecimal("200.00"))
                    .type(TransactionType.EXPENSE)
                    .account(account)
                    .build();

            when(transactionRepository.findById(10L)).thenReturn(Optional.of(tx));

            transactionService.deleteTransaction(10L);

            assertEquals(0, new BigDecimal("1200.00").compareTo(account.getBalance()));
            verify(accountRepository).save(account);
            verify(transactionRepository).delete(tx);
        }

        @Test
        @DisplayName("delete INCOME → deducts balance back")
        void shouldDeductBalanceWhenDeletingIncome() {
            Transaction tx = Transaction.builder()
                    .id(11L)
                    .amount(new BigDecimal("500.00"))
                    .type(TransactionType.INCOME)
                    .account(account)
                    .build();

            when(transactionRepository.findById(11L)).thenReturn(Optional.of(tx));

            transactionService.deleteTransaction(11L);

            assertEquals(0, new BigDecimal("500.00").compareTo(account.getBalance()));
            verify(accountRepository).save(account);
            verify(transactionRepository).delete(tx);
        }

        @Test
        @DisplayName("transaction not found → 404 NOT_FOUND")
        void shouldThrow404WhenTransactionNotFound() {
            when(transactionRepository.findById(99L)).thenReturn(Optional.empty());

            ResponseStatusException ex = assertThrows(
                    ResponseStatusException.class,
                    () -> transactionService.deleteTransaction(99L)
            );

            assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
            assertEquals("Transaction not found", ex.getReason());
            verify(accountRepository, never()).save(any());
            verify(transactionRepository, never()).delete(any());
        }
    }

    // ─────────────────────────────────────────────────────────────
    // GET SUMMARY
    // ─────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("getBudgetSummary()")
    class GetBudgetSummaryTests {

        private final LocalDateTime from = LocalDateTime.of(2000, 1, 1, 0, 0);
        private final LocalDateTime to   = LocalDateTime.now();

        @Test
        @DisplayName("sums income and expenses correctly")
        void shouldSumIncomeAndExpenses() {
            Transaction income1 = Transaction.builder()
                    .type(TransactionType.INCOME).amount(new BigDecimal("300.00")).category("Salary").build();
            Transaction income2 = Transaction.builder()
                    .type(TransactionType.INCOME).amount(new BigDecimal("200.00")).category("Bonus").build();
            Transaction expense1 = Transaction.builder()
                    .type(TransactionType.EXPENSE).amount(new BigDecimal("100.00")).category("Food").build();
            Transaction expense2 = Transaction.builder()
                    .type(TransactionType.EXPENSE).amount(new BigDecimal("50.00")).category("Food").build();

            when(transactionRepository.filterTransactions(null, from, to))
                    .thenReturn(List.of(income1, income2, expense1, expense2));

            BudgetSummaryResponse summary = transactionService.getBudgetSummary(from, to);

            assertEquals(0, new BigDecimal("500.00").compareTo(summary.totalIncome()));
            assertEquals(0, new BigDecimal("150.00").compareTo(summary.totalExpenses()));
        }

        @Test
        @DisplayName("groups expenses by category")
        void shouldGroupExpensesByCategory() {
            Transaction food1 = Transaction.builder()
                    .type(TransactionType.EXPENSE).amount(new BigDecimal("80.00")).category("Food").build();
            Transaction food2 = Transaction.builder()
                    .type(TransactionType.EXPENSE).amount(new BigDecimal("40.00")).category("Food").build();
            Transaction transport = Transaction.builder()
                    .type(TransactionType.EXPENSE).amount(new BigDecimal("30.00")).category("Transport").build();

            when(transactionRepository.filterTransactions(null, from, to))
                    .thenReturn(List.of(food1, food2, transport));

            BudgetSummaryResponse summary = transactionService.getBudgetSummary(from, to);

            assertEquals(0, new BigDecimal("120.00").compareTo(summary.expensesByCategory().get("Food")));
            assertEquals(0, new BigDecimal("30.00").compareTo(summary.expensesByCategory().get("Transport")));
        }

        @Test
        @DisplayName("no transactions → zeros and empty map")
        void shouldReturnZerosWhenNoTransactions() {
            when(transactionRepository.filterTransactions(null, from, to)).thenReturn(List.of());

            BudgetSummaryResponse summary = transactionService.getBudgetSummary(from, to);

            assertEquals(0, BigDecimal.ZERO.compareTo(summary.totalIncome()));
            assertEquals(0, BigDecimal.ZERO.compareTo(summary.totalExpenses()));
            assertTrue(summary.expensesByCategory().isEmpty());
        }

        @Test
        @DisplayName("INCOME transactions are excluded from expensesByCategory")
        void shouldNotIncludeIncomeInExpensesByCategory() {
            Transaction income = Transaction.builder()
                    .type(TransactionType.INCOME).amount(new BigDecimal("1000.00")).category("Salary").build();

            when(transactionRepository.filterTransactions(null, from, to)).thenReturn(List.of(income));

            BudgetSummaryResponse summary = transactionService.getBudgetSummary(from, to);

            assertFalse(summary.expensesByCategory().containsKey("Salary"));
        }
    }
}
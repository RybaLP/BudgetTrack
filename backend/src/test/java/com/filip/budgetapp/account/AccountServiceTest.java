package com.filip.budgetapp.account;

import com.filip.budgetapp.transaction.*;
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
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Transaction unit tests")
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private TransactionMapper transactionMapper;

    @InjectMocks
    private TransactionService transactionService;

    private Account account;
    private TransactionRequest expenseRequest;
    private TransactionRequest incomeRequest;

    @BeforeEach
    void setUp() {
        this.account = Account.builder()
                .id(1L)
                .name("Main Account")
                .balance(new BigDecimal("1000.00"))
                .build();

        this.expenseRequest = new TransactionRequest(
                new BigDecimal("200.00"),
                TransactionType.EXPENSE,
                "Food",
                "Groceries from supermarket",
                1L
        );

        this.incomeRequest = new TransactionRequest(
                new BigDecimal("500.00"),
                TransactionType.INCOME,
                "Salary",
                "Monthly payroll",
                1L
        );
    }

    @DisplayName("Creating transaction tests")
    @Nested
    class CreateTransactionTests {

        @Test
        @DisplayName("Should create expense transaction and decrease account balance")
        void shouldCreateExpenseTransactionAndDecreaseAccountBalance() {
            // GIVEN
            Transaction savedTransaction = new Transaction();
            TransactionResponse expectedResponse = new TransactionResponse(
                    100L, new BigDecimal("200.00"), TransactionType.EXPENSE, "Food", "Groceries from supermarket", null, 1L
            );

            when(accountRepository.findById(expenseRequest.accountId())).thenReturn(Optional.of(account));
            when(transactionRepository.save(any(Transaction.class))).thenReturn(savedTransaction);
            when(transactionMapper.toResponse(savedTransaction)).thenReturn(expectedResponse);

            // WHEN
            TransactionResponse response = transactionService.createTransaction(expenseRequest);

            // THEN
            assertNotNull(response);
            assertEquals(100L, response.id());
            // 1000.00 - 200.00 = 800.00
            assertTrue(new BigDecimal("800.00").compareTo(account.getBalance()) == 0);

            verify(accountRepository, times(1)).save(account);
            verify(transactionRepository, times(1)).save(any(Transaction.class));
        }

        @Test
        @DisplayName("Should create income transaction and increase account balance")
        void shouldCreateIncomeTransactionAndIncreaseAccountBalance() {
            // GIVEN
            Transaction savedTransaction = new Transaction();
            TransactionResponse expectedResponse = new TransactionResponse(
                    101L, new BigDecimal("500.00"), TransactionType.INCOME, "Salary", "Monthly payroll", null, 1L
            );

            when(accountRepository.findById(incomeRequest.accountId())).thenReturn(Optional.of(account));
            when(transactionRepository.save(any(Transaction.class))).thenReturn(savedTransaction);
            when(transactionMapper.toResponse(savedTransaction)).thenReturn(expectedResponse);

            // WHEN
            TransactionResponse response = transactionService.createTransaction(incomeRequest);

            // THEN
            assertNotNull(response);
            assertEquals(101L, response.id());
            // 1000.00 + 500.00 = 1500.00
            assertTrue(new BigDecimal("1500.00").compareTo(account.getBalance()) == 0);

            verify(accountRepository, times(1)).save(account);
            verify(transactionRepository, times(1)).save(any(Transaction.class));
        }

        @Test
        @DisplayName("Should throw ResponseStatusException 404 when account is not found")
        void shouldThrowExceptionWhenAccountDoesNotExist() {
            // GIVEN
            when(accountRepository.findById(expenseRequest.accountId())).thenReturn(Optional.empty());

            // WHEN
            final ResponseStatusException exception = assertThrows(
                    ResponseStatusException.class,
                    () -> transactionService.createTransaction(expenseRequest)
            );

            // THEN
            assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
            assertEquals("Account not found", exception.getReason());

            verify(accountRepository, never()).save(any());
            verify(transactionRepository, never()).save(any());
        }
    }

    @DisplayName("Deleting transaction tests")
    @Nested
    class DeleteTransactionTests {

        @Test
        @DisplayName("Should delete expense transaction and increase account balance back")
        void shouldDeleteExpenseTransactionAndIncreaseAccountBalanceBack() {
            // GIVEN
            Transaction transaction = Transaction.builder()
                    .id(50L)
                    .amount(new BigDecimal("200.00"))
                    .type(TransactionType.EXPENSE)
                    .account(account)
                    .build();

            when(transactionRepository.findById(50L)).thenReturn(Optional.of(transaction));

            // WHEN
            transactionService.deleteTransaction(50L);

            // THEN
            // Deleting an expense must refund the money: 1000.00 + 200.00 = 1200.00
            assertTrue(new BigDecimal("1200.00").compareTo(account.getBalance()) == 0);

            verify(accountRepository, times(1)).save(account);
            verify(transactionRepository, times(1)).delete(transaction);
        }

        @Test
        @DisplayName("Should delete income transaction and decrease account balance back")
        void shouldDeleteIncomeTransactionAndDecreaseAccountBalanceBack() {
            // GIVEN
            Transaction transaction = Transaction.builder()
                    .id(51L)
                    .amount(new BigDecimal("500.00"))
                    .type(TransactionType.INCOME)
                    .account(account)
                    .build();

            when(transactionRepository.findById(51L)).thenReturn(Optional.of(transaction));

            // WHEN
            transactionService.deleteTransaction(51L);

            // THEN
            // Deleting an income must deduct the money back: 1000.00 - 500.00 = 500.00
            assertTrue(new BigDecimal("500.00").compareTo(account.getBalance()) == 0);

            verify(accountRepository, times(1)).save(account);
            verify(transactionRepository, times(1)).delete(transaction);
        }

        @Test
        @DisplayName("Should throw ResponseStatusException 404 when transaction to delete is not found")
        void shouldThrowExceptionWhenTransactionToDeleteDoesNotExist() {
            // GIVEN
            when(transactionRepository.findById(99L)).thenReturn(Optional.empty());

            // WHEN
            final ResponseStatusException exception = assertThrows(
                    ResponseStatusException.class,
                    () -> transactionService.deleteTransaction(99L)
            );

            // THEN
            assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
            assertEquals("Transaction not found", exception.getReason());

            verify(accountRepository, never()).save(any());
            verify(transactionRepository, never()).delete(any());
        }
    }
}
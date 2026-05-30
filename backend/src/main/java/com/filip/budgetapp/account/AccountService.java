package com.filip.budgetapp.account;

import com.filip.budgetapp.account.dto.AccountRequest;
import com.filip.budgetapp.account.dto.AccountResponse;
import com.filip.budgetapp.transaction.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Najlepiej używać importu ze Springa
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final AccountMapper accountMapper;
    private final TransactionRepository transactionRepository;

    @Transactional
    public AccountResponse createAccount(AccountRequest accountRequest) {
        if (accountRepository.existsByName(accountRequest.name())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Account with this name already exists");
        }

        Account account = Account.builder()
                .name(accountRequest.name())
                .balance(BigDecimal.ZERO)
                .build();

        Account savedAccount = accountRepository.save(account);
        return accountMapper.toResponse(savedAccount);
    }

    @Transactional
    public void deleteAccount(Long id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found"));

        if (transactionRepository.existsByAccountId(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot delete account because it has associated transactions");
        }

        accountRepository.delete(account);
    }

    @Transactional(readOnly = true)
    public List<AccountResponse> getAllAccounts() {
        return accountRepository.findAll().stream()
                .map(accountMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AccountResponse getAccountById(Long id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found"));
        return accountMapper.toResponse(account);
    }
}
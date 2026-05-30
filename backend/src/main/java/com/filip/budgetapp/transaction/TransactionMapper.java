package com.filip.budgetapp.transaction;

import com.filip.budgetapp.transaction.dto.TransactionResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TransactionMapper {

    @Mapping(source = "account.id", target = "accountId")
    TransactionResponse toResponse(Transaction transaction);
}
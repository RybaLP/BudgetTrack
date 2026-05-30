package com.filip.budgetapp.account.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AccountRequest(
        @NotBlank(message = "Nazwa konta nie może być pusta")
        @Size(max = 50, message = "Nazwa konta może mieć maksymalnie 50 znaków")
        String name)
{}

# --- KROK 1: Budowanie aplikacji (wersja tymczasowa) ---
FROM eclipse-temurin:25-jdk-alpine AS builder
WORKDIR /app

# Kopiujemy pliki konfiguracyjne Mavena i skrypty wrappera
COPY .mvn ./.mvn
COPY mvnw pom.xml ./

# Nadajemy uprawnienia wykonywalności dla skryptu mvnw
RUN chmod +x mvnw

# Pobieramy zależności przy użyciu wrappera
RUN ./mvnw dependency:go-offline -B

# Kopiujemy kod źródłowy i budujemy paczkę JAR przy użyciu wrappera
COPY src ./src
RUN ./mvnw clean package -DskipTests

# --- KROK 2: Uruchamianie aplikacji (wersja końcowa, lekka) ---
FROM eclipse-temurin:25-jre-alpine
WORKDIR /app

# Kopiujemy zbudowany plik JAR
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
# Stage 1: Build with Maven
FROM maven:3.9.5-eclipse-temurin-17 AS build

WORKDIR /app

# Copy everything
COPY . .

# Build the JAR (skip tests)
RUN mvn clean package -DskipTests

# Stage 2: Runtime with Tesseract OCR
FROM eclipse-temurin:17-jre

# Install Tesseract OCR
RUN apt-get update && \
    apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-eng \
    libtesseract-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy JAR from build stage
COPY --from=build /app/target/*.jar app.jar

# Expose port
EXPOSE 8090

# Run application
ENTRYPOINT ["java", "-jar", "app.jar"]
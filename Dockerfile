# Stage 1: Build with Maven
FROM maven:3.9.5-eclipse-temurin-17 AS build

WORKDIR /app

# Copy everything
COPY . .

# Build the JAR (skip tests for faster build)
RUN mvn clean package -DskipTests

# Stage 2: Run with JRE only (smaller image)
FROM eclipse-temurin:17-jre

WORKDIR /app

# Copy the built JAR
COPY --from=build /app/target/*.jar app.jar

# Expose port
EXPOSE 8090

# Start the application
ENTRYPOINT ["java", "-jar", "app.jar"]
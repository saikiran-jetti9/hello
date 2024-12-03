FROM openjdk:17.0.1-jdk-slim AS run
WORKDIR /beeja-notifications
COPY build/libs/beeja-notifications-1.0-SNAPSHOT.jar beeja-notifications-1.0-SNAPSHOT.jar
CMD ["java", "-jar", "beeja-notifications-1.0-SNAPSHOT.jar"]
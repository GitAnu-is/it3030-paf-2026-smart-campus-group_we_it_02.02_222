# UniOps Backend

This repository’s Spring Boot Maven project is nested under `backend/backend/` (it contains the actual `pom.xml` and `mvnw.cmd`).

## Run

From the repo root:

```powershell
cd backend\backend
.\mvnw.cmd spring-boot:run
```

Or without changing directories:

```powershell
mvn -f backend\backend\pom.xml spring-boot:run
```

If your terminal is already in `UniOps\backend`:

```powershell
mvn -f backend\pom.xml spring-boot:run
```

## Build

```powershell
mvn -f backend\backend\pom.xml -DskipTests package
```

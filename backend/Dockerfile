FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY scrum-poker.sln ./
COPY backend/ScrumPoker.Api.csproj ./backend/
RUN dotnet restore ./backend/ScrumPoker.Api.csproj

COPY . .
RUN dotnet publish backend/ScrumPoker.Api.csproj \
    -c Release \
    -o /app/publish \
    --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS final
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "ScrumPoker.Api.dll"]
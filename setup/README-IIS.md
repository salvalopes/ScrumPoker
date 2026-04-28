# IIS Deployment Setup

This setup now follows the same broad pattern as your existing infrastructure:

- `default.build` as the main installer/build entrypoint
- `Install.bat` as the command wrapper
- `Config\*.properties` for environment-specific settings
- `IIS\*.json` for IIS site/application metadata

## Intended IIS layout

This project is prepared for a single IIS site:

- site root serves the React frontend
- `/apiapp` is an IIS application that serves the ASP.NET Core backend

The frontend is therefore built with:

- `VITE_API_BASE_URL=/apiapp`
- `VITE_HUB_URL=/apiapp/hubs/poker`

## Main files

- `default.build`: builds frontend and backend, stages a deployable site layout, and emits environment appsettings
- `Install.bat`: runs `default.build /t:PublishHost /p:Environment=...`
- `Config\build.properties`: common build paths
- `Config\production.properties`: production site/app settings
- `Config\staging.properties`: staging site/app settings
- `IIS\production.json`: IIS site/application definition example
- `IIS\staging.json`: IIS site/application definition example

## Generated package layout

After running the installer, the staged output is created under:

- `artifacts\Site\<environment>\package`

Inside that package:

- site root contains the frontend static files
- `apiapp\` contains the backend publish output

## Commands

Production package:

```bat
setup\Install.bat production
```

Staging package:

```bat
setup\Install.bat staging
```

## Prerequisites

- IIS with Static Content
- IIS WebSocket Protocol
- IIS URL Rewrite
- ASP.NET Core Hosting Bundle installed
- Node/npm available on the build machine
- MSBuild available at the path configured in `Install.bat`

## Notes

- `IIS\*.json` currently contains placeholder values for user, password, hostnames, and IPs
- replace those values with your real infrastructure settings before using them operationally
- this app keeps all room state in memory, so deploy a single backend instance only

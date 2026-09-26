# DemoEnglish

App web para practicar **inglés técnico**: diccionario, mazo Anki en el navegador, práctica de tiempos/verbos, vídeos curados y **práctica de entrevista** (dictado, grabación de audio y resumen opcional con IA).

| Capa | Stack |
|------|--------|
| Frontend | React, TypeScript, Vite, Tailwind |
| API local | ASP.NET Core (`DemoEnglish.Api`, .NET 10) |
| API SWA | Azure Functions isolated (`api/`) |
| Dominio | Clean Architecture (Domain / Application / Infrastructure) |

## Requisitos

- [.NET SDK 10](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) 20+ (recomendado 22)
- Opcional: [Azure Functions Core Tools](https://learn.microsoft.com/azure/azure-functions/functions-run-local) (`func`) para la API SWA en local
- Opcional: clave [OpenAI](https://platform.openai.com/) para el resumen de entrevista

## Arranque rápido (local)

Terminal 1 — API Kestrel:

```bash
dotnet restore DemoEnglish.slnx
dotnet run --project src/DemoEnglish.Api/DemoEnglish.Api.csproj
```

- HTTP: `http://localhost:5183`
- HTTPS: `https://localhost:7282` (perfil https)
- Swagger (Development): `http://localhost:5183/swagger`

Si el certificado HTTPS no es de confianza:

```bash
dotnet dev-certs https --trust
```

Terminal 2 — frontend:

```bash
cd frontend
npm install
npm run dev
```

Abre `http://localhost:5173`. En `frontend/.env.development`:

```env
VITE_API_BASE_URL=https://localhost:7282
```

(Puedes pegar también la URL de Swagger; se normaliza al origen.)

### Pruebas

```bash
dotnet test DemoEnglish.slnx
```

## Funcionalidades

| Área | Qué hace |
|------|----------|
| **Diccionario** | Busca palabras ([FreeDictionaryAPI.com](https://freedictionaryapi.com/), Wiktionary), IPA, TTS, añadir al mazo Anki. |
| **Mazo Anki** | Importar `.apkg` / texto / CSV de entrevista; exportar `.txt` para Anki; estudio en modal (2 caras), dictado y Word check. |
| **Práctica** | Tiempos verbales, teoría, listas de verbos, vídeos curados con transcripción YouTube. |
| **Interview** | Pantalla interna: dictado Web Speech, grabación/reproducción de audio (`MediaRecorder`), resumen IA opcional. |
| **Ajustes** | Voz y velocidad TTS (`localStorage`). |

### Interview (uso personal)

Botón **Interview** en la cabecera:

1. **Dictate** — transcript en vivo (Chrome/Edge; HTTPS o localhost).
2. **Record audio** — clip en el navegador + reproducción (no se sube al servidor).
3. **AI summary** — envía el texto a `POST /api/interview/summary` (requiere `OpenAI:ApiKey`).

Dictado y grabación **no** se usan a la vez (conflicto de micrófono con Web Speech + MediaRecorder).

### Anki `.apkg`

El backend **copia el stream a un archivo temporal**, abre el ZIP desde disco, extrae solo `collection.anki2` / `collection.anki21` (SQLite) y lee `notes.flds` (U+001F). Primer campo = frente; resto = reverso. HTML se reduce a texto básico. Así el paquete grande no vive entero en un `MemoryStream`.

En el navegador, `ApkgMediaStore` indexa el ZIP al importar pero **solo materializa blob URLs** de `[sound:]` / `[img:]` al abrir una tarjeta (con prefetch ligero de la anterior/siguiente en orden A–Z).

- API Kestrel: hasta **10 GiB** por subida, **10.000** notas por petición.
- Functions / SWA: hasta **~100 MiB** por subida (el multipart de Functions sigue en memoria; para mazos muy grandes conviene local/Kestrel o un flujo Blob + job async, no implementado aún).

## API (endpoints)

Misma forma en Kestrel y en Functions:

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/dictionary/entries/{word}` | Definición simplificada |
| `POST` | `/api/anki/import` | Multipart `file` (`.apkg` / `.txt` / `.tsv` / `.csv`) |
| `POST` | `/api/anki/export` | JSON `{ "cards": [{ "front", "back" }] }` → `.txt` Anki |
| `GET` | `/api/anki/sample` | Ejemplo de mazo |
| `POST` | `/api/interview/summary` | JSON `{ "transcript" }` → `{ "summary" }` |
| `GET` | `/api/youtube/captions/{videoId}?lang=en` | Captions oficiales (OAuth; vídeos propios) |

Config OpenAI (Kestrel: `appsettings` / user-secrets; Functions: env):

```bash
# Desde src/DemoEnglish.Api
dotnet user-secrets set "OpenAI:ApiKey" "sk-..."
# opcional
dotnet user-secrets set "OpenAI:ChatModel" "gpt-4o-mini"
```

## Azure Functions (SWA)

Carpeta [`api/`](api/): worker **.NET 8 isolated** (compatible con SWA managed) con las mismas rutas. Application / Infrastructure / Domain también en **net8.0**; el host Kestrel (`DemoEnglish.Api`) sigue en **net10.0** y las referencia sin problema.

```bash
cd api
copy local.settings.json.example local.settings.json
# edita OpenAI__ApiKey si quieres el coach
func start
```

Puerto local típico: `http://localhost:7071`.

En producción SWA el frontend usa **mismo origen** (`VITE_API_BASE_URL` vacío → `/api/...`).

## Azure Static Web Apps — qué configurar

1. Crea un **Static Web App** y copia el *deployment token*.
2. En GitHub → **Settings → Secrets → Actions**:
   - `AZURE_STATIC_WEB_APPS_API_TOKEN` = token de Azure
3. En el SWA → **Configuration → Application settings** (opcional):

| Setting | Uso |
|---------|-----|
| `OpenAI__ApiKey` | Resumen de entrevista |
| `OpenAI__ChatModel` | Modelo (default `gpt-4o-mini`) |
| `DictionaryApi__BaseUrl` | Override diccionario (default `https://freedictionaryapi.com/`) |
| `YouTube__ClientId` | OAuth client id (captions oficiales) |
| `YouTube__ClientSecret` | OAuth client secret |
| `YouTube__RefreshToken` | Refresh token de una cuenta que **posea** los vídeos |
| `YouTube__ApiKey` | Opcional (no basta sola para `captions.download`) |

### YouTube captions (Data API v3)

`GET /api/youtube/captions/{videoId}?lang=en` usa **captions.list** + **captions.download** con OAuth.

**Límite de Google:** solo puedes descargar captions de vídeos **tuyos** (cuenta del refresh token). Lecciones de BBC u otros canales → usa **Open on YouTube** (el embed sí muestra CC del player).

Configuración rápida:

1. Google Cloud → habilita **YouTube Data API v3**.
2. Crea credenciales OAuth (tipo Desktop) → `ClientId` + `ClientSecret`.
3. Obtén un **refresh token** con scope `https://www.googleapis.com/auth/youtube.force-ssl` (p. ej. [OAuth 2.0 Playground](https://developers.google.com/oauthplayground): engranaje → “Use your own OAuth credentials” → autoriza YouTube Data API v3 → Exchange authorization code).
4. Local (API):

```bash
cd src/DemoEnglish.Api
dotnet user-secrets set "YouTube:ClientId" "...."
dotnet user-secrets set "YouTube:ClientSecret" "...."
dotnet user-secrets set "YouTube:RefreshToken" "...."
```

5. SWA: Application settings `YouTube__ClientId`, `YouTube__ClientSecret`, `YouTube__RefreshToken`.

4. Push a `main`/`master` o ejecuta el workflow [`.github/workflows/azure-static-web-apps.yml`](.github/workflows/azure-static-web-apps.yml) (*Actions → Azure Static Web Apps → Run workflow*). El job publica `frontend/dist` y la API precompilada (`swa-api/`).

SPA + Functions gestionadas; no hace falta App Service aparte si usas solo `api/`.

## CI (GitHub Actions)

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) en push/PR a `main`/`master`:

1. `dotnet build` + `dotnet test`
2. Build de `api/DemoEnglish.Functions.csproj`
3. `npm ci` + `npm run build` en `frontend/`

## Estructura del repo

```
DemoEnglish/
├── frontend/                 # React + Vite
├── api/                      # Azure Functions (SWA)
├── src/
│   ├── DemoEnglish.Api/      # Host Kestrel (dev / mazos grandes)
│   ├── DemoEnglish.Application/
│   ├── DemoEnglish.Domain/
│   └── DemoEnglish.Infrastructure/
├── tests/DemoEnglish.Tests/
├── tools/                    # Utilidades (p. ej. export interview)
└── .github/workflows/        # CI + deploy SWA
```

| Proyecto | Rol |
|----------|-----|
| `DemoEnglish.Domain` | Núcleo |
| `DemoEnglish.Application` | Contratos y DTOs (diccionario, Anki, OpenAI options) |
| `DemoEnglish.Infrastructure` | FreeDictionaryAPI.com, SQLite `.apkg`, coach OpenAI, DI |
| `DemoEnglish.Api` | Controllers, Swagger, CORS, uploads grandes |
| `DemoEnglish.Functions` | HTTP triggers para SWA |

## Frontend — build y variables

```bash
cd frontend
npm run build   # salida: frontend/dist/
```

| Variable | Cuándo |
|----------|--------|
| `VITE_API_BASE_URL` | Dev: origen del API Kestrel. Prod SWA: vacío (mismo origen). |
| `VITE_ANKI_MODAL_MAX_WIDTH` / `_HEIGHT` / `_HEIGHT_VP` | Tamaño del modal de tarjeta (opcionales). |

`frontend/public/staticwebapp.config.json` — fallback SPA y rutas `/api/*`.

## Qué no subir a Git

Ya cubierto por `.gitignore` / `api/.gitignore`:

- `**/bin/`, `**/obj/`, `artifacts/`
- `frontend/node_modules/`, `frontend/dist/`
- `api/local.settings.json` (usa el `.example`)

## Licencia y datos

Definiciones: [FreeDictionaryAPI.com](https://freedictionaryapi.com/) (datos de Wiktionary, CC BY-SA 4.0).  
Anki es marca de Ankitect Pty Ltd.; esta app solo genera/importa formatos compatibles con la [documentación de Anki](https://docs.ankiweb.net/).

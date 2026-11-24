# Práctica OAuth 2.0 + Auth0

Ejemplo mínimo de cómo proteger una API con Auth0 usando tres piezas:

| Carpeta / archivo | Qué es | Concepto que demuestra |
|---|---|---|
| `spa/` | SPA React (Vite) | Login con **Authorization Code + PKCE** |
| `api/` | API Express | Validación del **access token (JWT)** y **permisos (RBAC)** |
| `action/` | Action post-login de Auth0 | **Claim personalizado** con los roles |
| `m2m-test.sh` | Script con curl | **Client Credentials** (servicio a servicio) |

## Cómo funciona

```
 Usuario                SPA (5173)                 Auth0                  API (3001)
    |  clic "Login"        |                          |                        |
    |--------------------->|  /authorize + PKCE       |                        |
    |                      |------------------------->|                        |
    |       pantalla de login de Auth0                |                        |
    |<----------------------------------------------->|                        |
    |                      |  redirect con ?code=     |                        |
    |                      |<-------------------------|                        |
    |                      |  code + code_verifier    |                        |
    |                      |------------------------->|                        |
    |                      |  ID token + access token |                        |
    |                      |<-------------------------|                        |
    |                      |  GET /api/orders  (Authorization: Bearer <token>) |
    |                      |-------------------------------------------------->|
    |                      |                          |  valida firma (JWKS),  |
    |                      |                          |  iss, aud, exp y       |
    |                      |                          |  permiso read:orders   |
    |                      |  200 / 401 / 403                                  |
    |                      |<--------------------------------------------------|
```

**Respuestas de la API**

| Ruta | Sin token | Token válido sin permiso | Token con `read:orders` |
|---|---|---|---|
| `GET /api/public` | 200 | 200 | 200 |
| `GET /api/private` | 401 | 200 | 200 |
| `GET /api/orders` | 401 | **403** | 200 |

## Estructura del código

```
api/src/
  config.js     Lee y valida las variables de entorno (falla al arrancar si falta alguna)
  auth.js       checkJwt (autenticación, 401) y requirePermission (autorización, 403)
  server.js     Rutas y manejo centralizado de errores

spa/src/
  config.js     Variables VITE_* (públicas: sin secretos)
  main.jsx      Auth0Provider: configura el login con PKCE
  App.jsx       Muestra login o la vista autenticada
  api.js        fetch a la API con el header Authorization: Bearer
  components/
    Profile.jsx    Datos del usuario y roles (del ID token)
    ApiTester.jsx  Botones para probar los endpoints

action/add-roles-claim.js   Añade los roles al ID token y al access token
m2m-test.sh                 Obtiene un token M2M y llama a la API
```

## 1. Configurar Auth0 (Dashboard)

1. Crea una cuenta gratis en https://auth0.com y un tenant.
2. **Applications > Create Application** → tipo *Single Page Application*.
   - Allowed Callback URLs: `http://localhost:5173`
   - Allowed Logout URLs: `http://localhost:5173`
   - Allowed Web Origins: `http://localhost:5173`
   - Copia *Domain* y *Client ID*.
3. **APIs > Create API** → Identifier `https://api.practica.local`.
   - Settings: activa **Enable RBAC** y **Add Permissions in the Access Token**.
   - Permissions: agrega `read:orders`.
4. **User Management > Roles** → crea el rol `admin` y asígnale `read:orders`.
5. **User Management > Users** → crea un usuario y asígnale el rol `admin`.
   (Crea un segundo usuario sin rol para demostrar el 403.)
6. **Actions > Library > Build Custom** → pega `action/add-roles-claim.js`, *Deploy*,
   y agrégala en **Actions > Flows > Login** (*Apply*).
7. **Applications > Create Application** → tipo *Machine to Machine*, selecciona la API
   y marca el permiso `read:orders`. Copia su *Client ID* y *Client Secret*.

## 2. Levantar la API

```bash
cd api
cp .env.example .env     # edita AUTH0_DOMAIN
npm install
npm run dev              # o npm start
```

## 3. Levantar la SPA

```bash
cd spa
cp .env.example .env     # edita VITE_AUTH0_DOMAIN y VITE_AUTH0_CLIENT_ID
npm install
npm run dev
```

Abre http://localhost:5173, inicia sesión y pulsa los botones.

## 4. Probar M2M (Client Credentials)

```bash
AUTH0_DOMAIN=TU-TENANT.us.auth0.com \
AUTH0_AUDIENCE=https://api.practica.local \
M2M_CLIENT_ID=xxx M2M_CLIENT_SECRET=yyy \
./m2m-test.sh
```

Debe responder `200` con la lista de pedidos.

## Puntos clave para la entrevista

**PKCE en la SPA, sin secretos en el frontend.**
Una SPA es un *cliente público*: todo su código es visible, así que no puede guardar un
`client_secret`. PKCE lo sustituye: la SPA genera un `code_verifier` aleatorio y solo
envía su hash. Quien intercepte el `code` no puede canjearlo sin el verifier.

**ID token vs access token.**
El ID token dice a la SPA *quién* es el usuario (nombre, email, roles). El access token
es lo que se envía a la API; su `aud` es la API y la SPA no debería interpretarlo.

**La API valida el token por completo** (`api/src/auth.js`):
- *Firma*, con la clave pública de Auth0 obtenida del endpoint JWKS (no hay secreto compartido).
- `iss`: lo emitió nuestro tenant.
- `aud`: es para esta API, no para otra.
- `exp`: no está caducado.

**401 vs 403.**
401 = no sé quién eres (sin token o token inválido). 403 = sé quién eres, pero no tienes
permiso. Por eso separamos `checkJwt` (autenticación) de `requirePermission` (autorización).

**RBAC.**
Los permisos se asignan a roles y los roles a usuarios. Con RBAC activo, Auth0 incluye el
claim `permissions` en el access token y la API solo comprueba el permiso, no el rol.
Así se pueden cambiar roles sin tocar código.

**Action con claim namespaced.**
Auth0 no incluye roles en los tokens por defecto. La Action los añade con un nombre tipo
URL (`https://practica.local/roles`) para no chocar con claims estándar de OIDC.

**Client Credentials para servicio a servicio.**
No hay usuario: el servicio se autentica con `client_id` + `client_secret` (que sí puede
guardar, porque corre en un servidor). En el token, el permiso llega en `scope`; por eso
`requirePermission` revisa tanto `permissions` como `scope`.

**Otras buenas prácticas aplicadas**
- Configuración por variables de entorno, validada al arrancar; `.env` fuera de git.
- CORS restringido al origen de la SPA.
- Manejo de errores centralizado: no se exponen detalles internos en errores 500.
- Los tokens los gestiona el SDK (en memoria); el código no los guarda en `localStorage`.

## Problemas frecuentes

| Síntoma | Causa probable |
|---|---|
| `401 invalid_token` con "audience" | Falta `VITE_AUTH0_AUDIENCE` o no coincide con `AUTH0_AUDIENCE` |
| `403 insufficient_scope` con el usuario admin | Falta "Add Permissions in the Access Token" o el rol no tiene `read:orders`. Cierra sesión y vuelve a entrar para obtener un token nuevo |
| "Roles: ninguno" | La Action no está en el flujo Login o el namespace no coincide |
| Error "Callback URL mismatch" | Falta `http://localhost:5173` en Allowed Callback URLs |

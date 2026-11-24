/**
 * API de ejemplo protegida con Auth0 (OAuth 2.0 Resource Server).
 *
 * Rutas:
 *   GET /api/public   -> abierta, sin token.
 *   GET /api/private  -> requiere un access token válido.
 *   GET /api/orders   -> requiere token válido + permiso "read:orders".
 */
import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { checkJwt, requirePermission } from './auth.js';

const app = express();

// Solo la SPA puede llamar a la API desde el navegador.
app.use(cors({ origin: config.corsOrigin }));

// ---------------------------------------------------------------------------
// Rutas
// ---------------------------------------------------------------------------

app.get('/api/public', (req, res) => {
  res.json({ message: 'Endpoint público: no necesita token.' });
});

app.get('/api/private', checkJwt, (req, res) => {
  // "sub" identifica a quién pertenece el token (usuario o cliente M2M).
  res.json({ message: 'Token válido.', sub: req.auth.payload.sub });
});

// Los middlewares se ejecutan en orden: primero autenticación, luego autorización.
app.get('/api/orders', checkJwt, requirePermission('read:orders'), (req, res) => {
  res.json({
    orders: [
      { id: 1, item: 'Libro' },
      { id: 2, item: 'Taza' },
    ],
  });
});

// ---------------------------------------------------------------------------
// Manejo de errores
// ---------------------------------------------------------------------------

// Cualquier ruta no definida.
app.use((req, res) => {
  res.status(404).json({ error: 'not_found' });
});

// Manejador central de errores (Express lo reconoce por tener 4 parámetros).
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Errores de autenticación/autorización de express-oauth2-jwt-bearer:
  // 400 petición mal formada, 401 token ausente o inválido, 403 sin permiso.
  if (err.status && err.status < 500) {
    // Cabecera estándar (RFC 6750) que explica al cliente por qué se rechazó el token.
    if (err.headers) res.set(err.headers);
    return res.status(err.status).json({ error: err.code || 'unauthorized', message: err.message });
  }

  // Error inesperado: lo registramos en el servidor pero no exponemos detalles al cliente.
  console.error(err);
  res.status(500).json({ error: 'internal_server_error' });
});

app.listen(config.port, () => {
  console.log(`API escuchando en http://localhost:${config.port}`);
});

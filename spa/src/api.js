import { config } from './config.js';

/**
 * Llama a un endpoint de la API enviando el access token como Bearer token.
 *
 * Devuelve el código HTTP y el cuerpo, sin lanzar error en 401/403,
 * porque en esta demo queremos VER esas respuestas.
 *
 * @param {string} path         p. ej. '/api/orders'
 * @param {string} accessToken  token obtenido de Auth0
 * @returns {Promise<{ status: number, body: unknown }>}
 */
export async function callApi(path, accessToken) {
  const response = await fetch(`${config.apiUrl}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  // Leemos como texto y luego intentamos JSON, por si la respuesta no es JSON.
  const text = await response.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }

  return { status: response.status, body };
}

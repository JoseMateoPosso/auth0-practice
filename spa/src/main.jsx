/**
 * Punto de entrada de la SPA.
 *
 * Auth0Provider envuelve la app y se encarga del flujo
 * Authorization Code + PKCE:
 *   1. loginWithRedirect() genera un code_verifier aleatorio y envía a Auth0
 *      solo su hash (code_challenge).
 *   2. Auth0 autentica al usuario y vuelve a redirect_uri con un "code".
 *   3. El SDK canjea el code + code_verifier por los tokens.
 * Así, aunque alguien intercepte el "code", no puede canjearlo sin el verifier.
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import { config } from './config.js';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Auth0Provider
      domain={config.auth0Domain}
      clientId={config.auth0ClientId}
      authorizationParams={{
        // A dónde vuelve Auth0 tras el login (debe estar en "Allowed Callback URLs").
        redirect_uri: window.location.origin,
        // Sin audience, Auth0 no emite un access token JWT para nuestra API.
        audience: config.auth0Audience,
      }}
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>
);

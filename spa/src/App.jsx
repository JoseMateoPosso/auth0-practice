import { useAuth0 } from '@auth0/auth0-react';
import Profile from './components/Profile.jsx';
import ApiTester from './components/ApiTester.jsx';

/**
 * Componente raíz: decide qué mostrar según el estado de autenticación.
 */
export default function App() {
  const { isLoading, error, isAuthenticated, loginWithRedirect, logout } = useAuth0();

  // Mientras el SDK procesa el callback de Auth0 o restaura la sesión.
  if (isLoading) {
    return <p>Cargando...</p>;
  }

  // Errores del login (p. ej. el usuario canceló o la configuración es incorrecta).
  if (error) {
    return <p>Error de autenticación: {error.message}</p>;
  }

  return (
    <main style={{ fontFamily: 'sans-serif', padding: 24 }}>
      <h1>Práctica OAuth 2.0 + Auth0</h1>

      {isAuthenticated ? (
        <>
          <Profile />
          <ApiTester />
          <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
            Cerrar sesión
          </button>
        </>
      ) : (
        <button onClick={() => loginWithRedirect()}>Iniciar sesión</button>
      )}
    </main>
  );
}

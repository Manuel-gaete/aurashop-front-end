import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { login as apiLogin, registro as apiRegistro, getMe, getSession, saveSession, clearSession } from '../services/api';

const AuthContext = createContext(null);

function usuarioDesdeSesion() {
  const s = getSession();
  return s ? { nombre: s.nombre, correo: s.correo, rol: s.rol } : null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(usuarioDesdeSesion);

  // api.js avisa con este evento cuando no pudo renovar el token
  useEffect(() => {
    const alExpirar = () => setUser(null);
    window.addEventListener('aurashop:sesion-expirada', alExpirar);
    return () => window.removeEventListener('aurashop:sesion-expirada', alExpirar);
  }, []);

  // Al cargar la página, confirma con el servidor que la sesión guardada sigue siendo válida.
  // Si el token venció intenta renovarlo; si no puede, api.js cierra la sesión.
  useEffect(() => {
    if (getSession()) {
      getMe().catch(() => {});
    }
  }, []);

  async function login(correo, password) {
    const data = await apiLogin(correo, password);
    saveSession(data);
    setUser({ nombre: data.nombre, correo: data.correo, rol: data.rol });
  }

  async function registrar(nombre, correo, password) {
    await apiRegistro(nombre, correo, password);
    await login(correo, password); // entra directo después de registrarse
  }

  function logout() {
    clearSession();
    setUser(null);
  }

  // Permisos según la tabla del README del backend
  const permisos = useMemo(() => {
    const rol = user?.rol;
    return {
      editaCatalogo: rol === 'ADMINISTRADOR' || rol === 'EDITOR_PRODUCTOS',
      veUsuarios: rol === 'ADMINISTRADOR' || rol === 'SOPORTE',
      editaUsuarios: rol === 'ADMINISTRADOR',
      veTodasOrdenes: rol === 'ADMINISTRADOR' || rol === 'SOPORTE',
    };
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, registrar, logout, permisos }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
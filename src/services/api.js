const BASE_URL = '/api';
const SESSION_KEY = 'aurashop_session';

// ---------- Sesión (tokens guardados en el navegador) ----------
export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}
export const saveSession = (s) => localStorage.setItem(SESSION_KEY, JSON.stringify(s));
export const clearSession = () => localStorage.removeItem(SESSION_KEY);

// Mensajes de respaldo por si el backend no envía el texto del error
const MENSAJES = {
  400: 'Los datos enviados no son válidos.',
  401: 'Debes iniciar sesión (o tu sesión expiró).',
  403: 'No tienes permisos para realizar esta acción.',
  404: 'No se encontró el recurso solicitado.',
  409: 'Conflicto: el dato ya existe o no hay stock suficiente.',
  500: 'Error interno del servidor.',
};

// ---------- Renovación del access token (dura 15 min) ----------
let renovando = null; // evita lanzar varios refresh a la vez

function renovarToken() {
  if (renovando) return renovando;
  const sesion = getSession();
  if (!sesion?.refreshToken) return Promise.resolve(false);

  renovando = (async () => {
    try {
      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: sesion.refreshToken }),
      });
      if (!res.ok) return false;
      saveSession(await res.json());
      return true;
    } catch {
      return false;
    } finally {
      renovando = null;
    }
  })();
  return renovando;
}

// ---------- Función base (igual a la de PetCare + JWT) ----------
async function request(endpoint, options = {}, { auth = true, retry = true } = {}) {
  const sesion = getSession();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (auth && sesion?.accessToken) {
    headers.Authorization = `Bearer ${sesion.accessToken}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  // Token vencido: intentamos renovarlo una vez y repetimos la petición
  if (response.status === 401 && auth && sesion?.refreshToken && retry) {
    if (await renovarToken()) {
      return request(endpoint, options, { auth, retry: false });
    }
    clearSession();
    window.dispatchEvent(new Event('aurashop:sesion-expirada'));
  }

  if (!response.ok) {
    let errorMessage = MENSAJES[response.status] || `Error ${response.status}`;
    try {
      const data = await response.json();
      errorMessage = data.message || errorMessage;
    } catch {
      // Sin cuerpo JSON
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

const enviar = (metodo, body) => ({ method: metodo, body: JSON.stringify(body) });

// --- AUTH ---
export const login = (correo, password) =>
  request('/auth/login', enviar('POST', { correo, password }), { auth: false });

export const registro = (nombre, correo, password) =>
  request('/auth/registro', enviar('POST', { nombre, correo, password }), { auth: false });

export const getMe = () => request('/auth/me');

// --- PRODUCTOS ---
export const getProductos = () => request('/productos', {}, { auth: false });
export const createProducto = (producto) => request('/productos', enviar('POST', producto));
export const updateProducto = (id, producto) => request(`/productos/${id}`, enviar('PUT', producto));
export const deleteProducto = (id) => request(`/productos/${id}`, { method: 'DELETE' });

// --- CATEGORÍAS ---
export const getCategorias = () => request('/categorias', {}, { auth: false });
export const createCategoria = (categoria) => request('/categorias', enviar('POST', categoria));
export const updateCategoria = (id, categoria) => request(`/categorias/${id}`, enviar('PUT', categoria));
export const deleteCategoria = (id) => request(`/categorias/${id}`, { method: 'DELETE' });

// --- USUARIOS (ADMINISTRADOR / SOPORTE) ---
export const getUsuarios = () => request('/usuarios');
export const createUsuario = (usuario) => request('/usuarios', enviar('POST', usuario));
export const updateUsuario = (id, usuario) => request(`/usuarios/${id}`, enviar('PUT', usuario));
export const deleteUsuario = (id) => request(`/usuarios/${id}`, { method: 'DELETE' });

// --- ÓRDENES ---
export const crearOrden = (orden) => request('/ordenes', enviar('POST', orden));
export const getMisOrdenes = () => request('/ordenes/mias');
export const getOrdenes = () => request('/ordenes');

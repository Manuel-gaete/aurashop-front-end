import { useEffect, useMemo, useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useCart } from './context/CartContext';
import { nombreRol } from './utils/format';
import Tienda from './components/Tienda';
import Carrito from './components/Carrito';
import AuthPage from './components/AuthPage';
import MisOrdenes from './components/MisOrdenes';
import AdminProductos from './components/AdminProductos';
import AdminCategorias from './components/AdminCategorias';
import AdminUsuarios from './components/AdminUsuarios';
import AdminOrdenes from './components/AdminOrdenes';
import './App.css';

export default function App() {
  const { user, logout, permisos } = useAuth();
  const { count } = useCart();

  // "Pantalla" actual (la app no usa react-router, igual que PetCare)
  const [view, setView] = useState('tienda');

  // Mensajes globales
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Los componentes hijos usan notify.error / notify.success
  const notify = useMemo(
    () => ({
      error: (msg) => {
        setSuccess('');
        setError(msg);
      },
      success: (msg) => {
        setError('');
        setSuccess(msg);
      },
    }),
    []
  );

  function goTo(nuevaVista) {
    setError('');
    setSuccess('');
    setView(nuevaVista);
  }

  // Si la sesión expira, volvemos a la tienda
  useEffect(() => {
    if (!user) setView((v) => (['tienda', 'carrito', 'login', 'registro'].includes(v) ? v : 'tienda'));
  }, [user]);

  function handleLogout() {
    logout();
    goTo('tienda');
  }

  // Menú según el rol del usuario
  const menu = [
    { id: 'tienda', label: 'Tienda', visible: true },
    { id: 'mis-ordenes', label: 'Mis órdenes', visible: !!user },
    { id: 'admin-productos', label: 'Productos', visible: permisos.editaCatalogo },
    { id: 'admin-categorias', label: 'Categorías', visible: permisos.editaCatalogo },
    { id: 'admin-usuarios', label: 'Usuarios', visible: permisos.veUsuarios },
    { id: 'admin-ordenes', label: 'Todas las órdenes', visible: permisos.veTodasOrdenes },
  ].filter((m) => m.visible);

  // Guardia: si la vista no está permitida para este usuario, mostramos la tienda
  const privadas = ['mis-ordenes', 'admin-productos', 'admin-categorias', 'admin-usuarios', 'admin-ordenes'];
  const permitida =
    !privadas.includes(view) || menu.some((m) => m.id === view);
  const vistaActual = permitida ? view : 'tienda';

  function renderVista() {
    switch (vistaActual) {
      case 'carrito':
        return <Carrito notify={notify} goTo={goTo} />;
      case 'login':
      case 'registro':
        return <AuthPage mode={vistaActual} notify={notify} goTo={goTo} />;
      case 'mis-ordenes':
        return <MisOrdenes notify={notify} goTo={goTo} />;
      case 'admin-productos':
        return <AdminProductos notify={notify} />;
      case 'admin-categorias':
        return <AdminCategorias notify={notify} />;
      case 'admin-usuarios':
        return <AdminUsuarios notify={notify} />;
      case 'admin-ordenes':
        return <AdminOrdenes notify={notify} />;
      default:
        return <Tienda notify={notify} />;
    }
  }

  return (
    <div className="app-container">
      <header className="topbar">
        <div>
          <h1>AuraShop — Tienda Gamer</h1>
          <p>Hardware, periféricos y accesorios para tu setup</p>
        </div>

        <div className="topbar-right">
          <button className="btn btn-light" onClick={() => goTo('carrito')}>
            🛒 Carrito
            {count > 0 && <span className="cart-count">{count}</span>}
          </button>
          {user ? (
            <>
              <span className="badge-api">
                {user.nombre} · {nombreRol(user.rol)}
              </span>
              <button className="btn btn-light" onClick={handleLogout}>
                Salir
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-light" onClick={() => goTo('login')}>
                Iniciar sesión
              </button>
              <button className="btn btn-light" onClick={() => goTo('registro')}>
                Registrarme
              </button>
            </>
          )}
        </div>

        <nav className="nav">
          {menu.map((m) => (
            <button
              key={m.id}
              className={`nav-link ${vistaActual === m.id ? 'active' : ''}`}
              onClick={() => goTo(m.id)}
            >
              {m.label}
            </button>
          ))}
        </nav>
      </header>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
          <button onClick={() => setError('')}>✕</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span>{success}</span>
          <button onClick={() => setSuccess('')}>✕</button>
        </div>
      )}

      <main>{renderVista()}</main>
    </div>
  );
}

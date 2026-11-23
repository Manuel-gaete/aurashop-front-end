import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const DEMO = ['fernando@duoc.cl', 'editor@duoc.cl', 'soporte@duoc.cl', 'cliente@gmail.com'];

// Una sola pantalla para login y registro: cambia según la prop "mode"
export default function AuthPage({ mode, notify, goTo }) {
  const { login, registrar } = useAuth();
  const esRegistro = mode === 'registro';

  const [form, setForm] = useState({ nombre: '', correo: '', password: '' });
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setEnviando(true);
    try {
      if (esRegistro) {
        await registrar(form.nombre, form.correo, form.password);
        notify.success('Cuenta creada. ¡Bienvenido a AuraShop!');
      } else {
        await login(form.correo, form.password);
        notify.success('Sesión iniciada correctamente.');
      }
      goTo('tienda');
    } catch (err) {
      notify.error(esRegistro ? `No se pudo registrar: ${err.message}` : err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="card narrow">
      <div className="card-header">
        <h2>{esRegistro ? 'Crear cuenta' : 'Iniciar sesión'}</h2>
      </div>

      <form className="form-box" onSubmit={handleSubmit}>
        {esRegistro && (
          <div className="form-group">
            <label>Nombre completo</label>
            <input
              required
              placeholder="Ana Pérez"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
          </div>
        )}
        <div className="form-group">
          <label>Correo</label>
          <input
            type="email"
            required
            placeholder="ana@correo.cl"
            value={form.correo}
            onChange={(e) => setForm({ ...form, correo: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Contraseña {esRegistro && '(entre 4 y 30 caracteres)'}</label>
          <input
            type="password"
            required
            minLength={esRegistro ? 4 : undefined}
            maxLength={esRegistro ? 30 : undefined}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={enviando}>
          {enviando ? 'Enviando...' : esRegistro ? 'Registrarme' : 'Entrar'}
        </button>
      </form>

      <p className="list-item-sub center">
        {esRegistro ? '¿Ya tienes cuenta? ' : '¿Aún no tienes cuenta? '}
        <button className="link" onClick={() => goTo(esRegistro ? 'login' : 'registro')}>
          {esRegistro ? 'Inicia sesión' : 'Regístrate'}
        </button>
      </p>

      {!esRegistro && (
        <div className="demo-box">
          <strong>Usuarios de demostración</strong>
          <div className="chips">
            {DEMO.map((c) => (
              <button key={c} className="chip" type="button" onClick={() => setForm({ ...form, correo: c })}>
                {c}
              </button>
            ))}
          </div>
          <span className="list-item-sub">La contraseña de demostración está en el README del backend.</span>
        </div>
      )}
    </section>
  );
}

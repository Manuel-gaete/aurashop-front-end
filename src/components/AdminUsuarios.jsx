import { useEffect, useState } from 'react';
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ROLES, nombreRol } from '../utils/format';

const FORM_VACIO = { nombre: '', correo: '', password: '', rol: 'CLIENTE' };

export default function AdminUsuarios({ notify }) {
  const { user, permisos } = useAuth();
  const puedeEditar = permisos.editaUsuarios; // SOPORTE solo puede mirar

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState(FORM_VACIO);

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    setLoading(true);
    try {
      setUsuarios(await getUsuarios());
    } catch (err) {
      notify.error(`No se pudieron cargar los usuarios: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  function abrirNuevo() {
    setEditandoId(null);
    setForm(FORM_VACIO);
    setShowForm(true);
  }

  function abrirEdicion(u) {
    setEditandoId(u.id);
    setForm({ nombre: u.nombre, correo: u.correo, password: '', rol: u.rol });
    setShowForm(true);
  }

  function cerrarForm() {
    setShowForm(false);
    setEditandoId(null);
  }

  async function handleGuardar(e) {
    e.preventDefault();
    try {
      if (editandoId) {
        await updateUsuario(editandoId, form); // password vacía = no se cambia
        notify.success(`Usuario "${form.nombre}" actualizado.`);
      } else {
        await createUsuario(form);
        notify.success(`Usuario "${form.nombre}" creado.`);
      }
      cerrarForm();
      cargar();
    } catch (err) {
      notify.error(`Error al guardar el usuario: ${err.message}`);
    }
  }

  async function handleEliminar(u) {
    if (!window.confirm(`¿Eliminar a ${u.nombre} (${u.correo})?`)) return;
    try {
      await deleteUsuario(u.id);
      setUsuarios((prev) => prev.filter((x) => x.id !== u.id));
      notify.success(`Usuario "${u.nombre}" eliminado.`);
    } catch (err) {
      notify.error(`No se pudo eliminar (¿tiene órdenes asociadas?): ${err.message}`);
    }
  }

  return (
    <section className="card">
      <div className="card-header">
        <h2>Usuarios ({usuarios.length})</h2>
        {puedeEditar && (
          <button className="btn btn-primary" onClick={showForm ? cerrarForm : abrirNuevo}>
            {showForm ? 'Cancelar' : '+ Nuevo'}
          </button>
        )}
      </div>

      {!puedeEditar && <p className="list-item-sub note">Tu rol solo permite consultar usuarios.</p>}

      {showForm && (
        <form className="form-box" onSubmit={handleGuardar}>
          <div className="form-row">
            <div className="form-group">
              <label>Nombre</label>
              <input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Correo</label>
              <input
                type="email"
                required
                value={form.correo}
                onChange={(e) => setForm({ ...form, correo: e.target.value })}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Contraseña {editandoId && '(vacía = no cambiar)'}</label>
              <input
                type="password"
                required={!editandoId}
                minLength={editandoId && !form.password ? undefined : 4}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Rol</label>
              <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {nombreRol(r)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary">
            {editandoId ? 'Guardar cambios' : 'Crear usuario'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="empty-state">Cargando usuarios...</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                {puedeEditar && <th></th>}
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id}>
                  <td>{u.nombre}</td>
                  <td>{u.correo}</td>
                  <td>
                    <span className="badge badge-role">{nombreRol(u.rol)}</span>
                  </td>
                  {puedeEditar && (
                    <td className="actions">
                      <button className="btn btn-secondary" onClick={() => abrirEdicion(u)}>
                        Editar
                      </button>
                      <button
                        className="btn btn-danger"
                        disabled={u.correo === user.correo}
                        title={u.correo === user.correo ? 'No puedes eliminarte a ti mismo' : ''}
                        onClick={() => handleEliminar(u)}
                      >
                        Eliminar
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

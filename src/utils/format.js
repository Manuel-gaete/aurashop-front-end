const formatoCLP = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
});

export const clp = (valor) => formatoCLP.format(Number(valor) || 0);

export const fechaHora = (iso) =>
  iso ? new Date(iso).toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' }) : '';

export const ROLES = ['ADMINISTRADOR', 'EDITOR_PRODUCTOS', 'SOPORTE', 'CLIENTE'];

export const nombreRol = (rol) =>
  ({
    ADMINISTRADOR: 'Administrador',
    EDITOR_PRODUCTOS: 'Editor de productos',
    SOPORTE: 'Soporte',
    CLIENTE: 'Cliente',
  })[rol] || rol;

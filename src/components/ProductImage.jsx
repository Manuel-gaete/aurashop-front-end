import { useState } from 'react';

// Las imágenes viven en /public/img (el backend solo guarda el nombre del archivo).
// Si el archivo no existe, se muestra un recuadro con la inicial del producto.
export default function ProductImage({ img, nombre, className = 'product-img' }) {
  const [fallo, setFallo] = useState(false);

  if (!img || fallo) {
    return <div className={`${className} product-img-placeholder`}>{nombre?.charAt(0) || '?'}</div>;
  }
  return (
    <img
      className={className}
      src={`/img/${encodeURI(img)}`}
      alt={nombre}
      loading="lazy"
      onError={() => setFallo(true)}
    />
  );
}

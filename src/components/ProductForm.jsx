import { useState } from 'react';

const emptyProduct = {
  name: '',
  description: '',
  category: '',
  price: '',
  quantity: '',
};

export default function ProductForm({ onAdd, onCancel }) {
  const [product, setProduct] = useState(emptyProduct);
  const [errorMessage, setErrorMessage] = useState('');

  function updateField(event) {
    setProduct({ ...product, [event.target.name]: event.target.value });
    setErrorMessage('');
  }

  function handleSubmit(event) {
    event.preventDefault();
    const name = product.name.trim();
    const description = product.description.trim();
    const category = product.category.trim();
    const price = Number(product.price);
    const quantity = Number(product.quantity);

    if (!name || !description || !category) {
      setErrorMessage('Escribe el nombre, la descripción y la categoría.');
      return;
    }

    if (product.price === '' || !Number.isFinite(price) || price < 0) {
      setErrorMessage('Escribe un precio válido mayor o igual a cero.');
      return;
    }

    if (product.quantity === '' || !Number.isInteger(quantity) || quantity < 0) {
      setErrorMessage('Escribe una cantidad entera mayor o igual a cero.');
      return;
    }

    onAdd({
      name,
      description,
      category,
      price,
      quantity,
    });
  }

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      <div className="form-heading">
        <div>
          <span className="eyebrow">NUEVO REGISTRO</span>
          <h2>Agregar producto</h2>
        </div>
        <button className="icon-button" type="button" onClick={onCancel} aria-label="Cerrar formulario">×</button>
      </div>
      <label>
        Nombre del producto
        <input name="name" value={product.name} onChange={updateField} required maxLength="80" />
      </label>
      <label>
        Descripción
        <input name="description" value={product.description} onChange={updateField} required maxLength="120" />
      </label>
      <div className="form-row">
        <label>
          Categoría
          <input name="category" value={product.category} onChange={updateField} required maxLength="40" />
        </label>
        <label>
          Precio (USD)
          <input name="price" type="number" min="0" step="0.01" value={product.price} onChange={updateField} required />
        </label>
        <label>
          Cantidad en stock
          <input name="quantity" type="number" min="0" step="1" value={product.quantity} onChange={updateField} required />
        </label>
      </div>
      {errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}
      <div className="form-actions">
        <button className="button-secondary" type="button" onClick={onCancel}>Cancelar</button>
        <button className="button-primary" type="submit">Agregar producto</button>
      </div>
    </form>
  );
}

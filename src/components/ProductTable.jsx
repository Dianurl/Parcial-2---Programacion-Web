const currency = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'USD',
});

export default function ProductTable({ products, onDelete, isLoading }) {
  if (isLoading) {
    return <p className="empty-state">Cargando productos...</p>;
  }

  if (products.length === 0) {
    return <p className="empty-state">No hay productos que coincidan con la búsqueda.</p>;
  }

  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th scope="col">Producto</th>
            <th scope="col">Categoría</th>
            <th scope="col">Precio</th>
            <th scope="col">Existencias</th>
            <th scope="col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>
                <span className="product-name">{product.name}</span>
                <span className="product-description">{product.description}</span>
                <span className="product-id">ID {product.id}</span>
              </td>
              <td><span className="category-label">{product.category}</span></td>
              <td className="price-cell">{currency.format(product.price)}</td>
              <td>
                <span className={`stock-count ${product.quantity <= 5 ? 'stock-low' : ''}`}>
                  {product.quantity}
                </span>
                {product.quantity <= 5 && <span className="stock-note">Pocas existencias</span>}
              </td>
              <td>
                <button className="delete-button" type="button" onClick={() => onDelete(product)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

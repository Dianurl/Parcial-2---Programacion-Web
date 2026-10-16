import { useEffect, useState } from 'react';
import ProductForm from './components/ProductForm.jsx';
import ProductTable from './components/ProductTable.jsx';
import SearchBar from './components/SearchBar.jsx';

export default function App() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  async function refreshProducts(showError = true) {
    if (showError) setIsLoading(true);

    try {
      const response = await fetch('/api/productos');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'No se pudieron consultar los productos.');
      }
      if (!Array.isArray(result)) {
        throw new Error('La respuesta del servidor no tiene el formato esperado.');
      }

      setProducts(result);
      return true;
    } catch {
      if (showError) {
        setFeedback({ type: 'error', message: 'No se pudo conectar con el inventario SQL Server.' });
      }
      return false;
    } finally {
      if (showError) setIsLoading(false);
    }
  }

  useEffect(() => {
    refreshProducts();
  }, []);

  const visibleProducts = products.filter((product) => {
    const searchableText = `${product.name} ${product.category}`;
    return searchableText.toLowerCase().includes(searchTerm.toLowerCase());
  });
  const totalUnits = products.reduce((total, product) => total + product.quantity, 0);
  const lowStockCount = products.filter((product) => product.quantity <= 5).length;

  async function addProduct(product) {
    setFeedback(null);
    try {
      const response = await fetch('/api/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'No se pudo registrar el producto.');
      }

      setProducts((currentProducts) => [...currentProducts, result.product]);
      setShowForm(false);

      if (await refreshProducts(false)) {
        setFeedback({ type: 'success', message: result.message });
      } else {
        setFeedback({ type: 'error', message: 'Producto registrado, pero no se pudo actualizar la lista.' });
      }
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'No se pudo registrar el producto.' });
    }
  }

  async function deleteProduct(product) {
    const confirmed = window.confirm(`¿Deseas eliminar el producto "${product.name}"?`);
    if (!confirmed) return;

    setFeedback(null);
    try {
      const response = await fetch(`/api/productos/${product.id}`, { method: 'DELETE' });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'No se pudo eliminar el producto.');
      }

      setProducts((currentProducts) => currentProducts.filter((item) => item.id !== product.id));
      setFeedback({ type: 'success', message: result.message });

      if (!(await refreshProducts(false))) {
        setFeedback({ type: 'error', message: 'Producto eliminado, pero no se pudo actualizar la lista.' });
      }
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'No se pudo eliminar el producto.' });
    }
  }

  return (
    <main className="app-shell">
      <section className="dashboard">
        <div className="page-heading">
          <div>
            <h1>Parcial #2 - Registro de productos</h1>
          </div>
          <button className="button-primary add-button" type="button" onClick={() => setShowForm(!showForm)}>
            <span aria-hidden="true">+</span> Agregar producto
          </button>
        </div>

        <section className="summary" aria-label="Resumen del inventario">
          <article className="summary-item">
            <span className="summary-label">PRODUCTOS</span>
            <strong>{products.length.toString().padStart(2, '0')}</strong>
            <span className="summary-foot">productos registrados</span>
          </article>
          <article className="summary-item">
            <span className="summary-label">UNIDADES</span>
            <strong>{totalUnits}</strong>
            <span className="summary-foot">en total</span>
          </article>
          <article className="summary-item summary-alert">
            <span className="summary-label">BAJO STOCK</span>
            <strong>{lowStockCount.toString().padStart(2, '0')}</strong>
            <span className="summary-foot">5 unidades o menos</span>
          </article>
        </section>

        {showForm && <ProductForm onAdd={addProduct} onCancel={() => setShowForm(false)} />}

        <section className="inventory-section" aria-labelledby="inventory-title">
          <div className="inventory-toolbar">
            <div>
              <h2 id="inventory-title">Todos los productos</h2>
              <p>Mostrando {visibleProducts.length} de {products.length} productos</p>
            </div>
            <SearchBar value={searchTerm} onChange={setSearchTerm} />
          </div>
          {feedback && <p className={`api-feedback ${feedback.type}`} role={feedback.type === 'error' ? 'alert' : 'status'}>{feedback.message}</p>}
          <ProductTable products={visibleProducts} onDelete={deleteProduct} isLoading={isLoading} />
        </section>

      </section>
    </main>
  );
}

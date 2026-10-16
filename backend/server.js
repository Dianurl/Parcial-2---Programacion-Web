import 'dotenv/config';
import express from 'express';
import sql from 'mssql';

const app = express();
const port = Number(process.env.PORT) || 3000;
let poolPromise;

app.use(express.json());

function getPool() {
  const requiredConfig = ['DB_SERVER', 'DB_DATABASE', 'DB_USER', 'DB_PASSWORD'];
  const missingConfig = requiredConfig.filter((key) => !process.env[key]);

  if (missingConfig.length > 0) {
    throw new Error(`Missing SQL Server configuration: ${missingConfig.join(', ')}`);
  }

  if (!poolPromise) {
    poolPromise = sql.connect({
      server: process.env.DB_SERVER,
      database: process.env.DB_DATABASE,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: Number(process.env.DB_PORT) || 1433,
      options: {
        encrypt: process.env.DB_ENCRYPT !== 'false',
        trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
      },
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
      },
    }).catch((error) => {
      poolPromise = undefined;
      throw error;
    });
  }

  return poolPromise;
}

app.get('/api/productos', async (_request, response) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
        ProductoID AS id,
        Nombre AS name,
        Descripcion AS description,
        Categoria AS category,
        Precio AS price,
        Stock AS quantity
      FROM dbo.Productos
      ORDER BY ProductoID
    `);

    response.json(result.recordset);
  } catch (error) {
    console.error('Error al consultar productos:', error);
    response.status(500).json({ message: 'No se pudieron consultar los productos.' });
  }
});

app.post('/api/productos', async (request, response) => {
  const body = request.body ?? {};
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const description = typeof body.description === 'string' ? body.description.trim() : '';
  const category = typeof body.category === 'string' ? body.category.trim() : '';
  const hasPrice = typeof body.price === 'number' || (typeof body.price === 'string' && body.price.trim() !== '');
  const hasQuantity = typeof body.quantity === 'number' || (typeof body.quantity === 'string' && body.quantity.trim() !== '');
  const price = Number(body.price);
  const quantity = Number(body.quantity);

  if (!name || !description || !category) {
    return response.status(400).json({ message: 'Nombre, descripción y categoría son obligatorios.' });
  }

  if (name.length > 80 || description.length > 120 || category.length > 40) {
    return response.status(400).json({ message: 'Uno o más campos de texto superan la longitud permitida.' });
  }

  if (!hasPrice || !Number.isFinite(price) || price < 0) {
    return response.status(400).json({ message: 'El precio debe ser un número válido mayor o igual a cero.' });
  }

  if (!hasQuantity || !Number.isInteger(quantity) || quantity < 0 || quantity > 2147483647) {
    return response.status(400).json({ message: 'El stock debe ser un entero válido mayor o igual a cero.' });
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('name', sql.NVarChar(80), name)
      .input('description', sql.NVarChar(120), description)
      .input('category', sql.NVarChar(40), category)
      .input('price', sql.Decimal(18, 2), price)
      .input('quantity', sql.Int, quantity)
      .query(`
        INSERT INTO dbo.Productos (Nombre, Descripcion, Categoria, Precio, Stock)
        OUTPUT
          INSERTED.ProductoID AS id,
          INSERTED.Nombre AS name,
          INSERTED.Descripcion AS description,
          INSERTED.Categoria AS category,
          INSERTED.Precio AS price,
          INSERTED.Stock AS quantity
        VALUES (@name, @description, @category, @price, @quantity)
      `);

    const product = result.recordset[0];
    return response.status(201).json({
      message: 'Producto registrado correctamente.',
      product: { ...product, ProductoID: product.id },
    });
  } catch (error) {
    console.error('Error al registrar producto:', error);
    return response.status(500).json({ message: 'No se pudo registrar el producto.' });
  }
});

app.delete('/api/productos/:id', async (request, response) => {
  const productId = Number(request.params.id);

  if (!/^\d+$/.test(request.params.id) || !Number.isSafeInteger(productId) || productId < 1 || productId > 2147483647) {
    return response.status(400).json({ message: 'El ID del producto no es válido.' });
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('productoId', sql.Int, productId)
      .query(`
        DELETE FROM dbo.Productos
        OUTPUT DELETED.ProductoID AS ProductoID
        WHERE ProductoID = @productoId
      `);

    if (result.recordset.length === 0) {
      return response.status(404).json({ message: 'No se encontró el producto.' });
    }

    return response.json({ message: 'Producto eliminado correctamente.', productoId });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    return response.status(500).json({ message: 'No se pudo eliminar el producto.' });
  }
});

app.listen(port, () => {
  console.log(`API disponible en http://localhost:${port}`);
});

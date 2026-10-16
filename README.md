# Parcial #2 - Registro de productos

## Iniciar

1. Copia `.env.example` a `.env` y configura las credenciales de SQL Server.
2. La API espera la tabla existente `dbo.Productos` con las columnas `ProductoID`, `Nombre`, `Descripcion`, `Categoria`, `Precio` y `Stock`.
3. En una terminal ejecuta `npm run server`.
4. En otra terminal ejecuta `npm run dev`.

La API queda disponible en `http://localhost:3000` y Vite reenvía `/api` a ese servidor.

## Probar DELETE con Postman

- Método: `DELETE`
- URL: `http://localhost:3000/api/productos/1`
- Sin cuerpo.

Una respuesta `200` confirma la eliminación; `400` indica un ID inválido y `404` que el producto no existe. Después consulta `GET http://localhost:3000/api/productos` para verificar que el ID ya no aparece.
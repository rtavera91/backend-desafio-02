// agregamos file system al proyecto
const fs = require("fs");

// clase constructora de productos
class ProductManager {
  constructor(path) {
    this.path = path;
  }

  // método para traer los productos del archivo
  async getProducts() {
    try {
      if (fs.existsSync(this.path)) {
        const products = await fs.promises.readFile(this.path, "utf-8");
        return JSON.parse(products);
      } else {
        return [];
      }
    } catch (error) {
      return error;
    }
  }

  // método para agregar productos
  async addProduct(title, description, price, thumbnail, code, stock) {
    try {
      const products = await this.getProducts();
      if (!title || !description || !price || !thumbnail || !code || !stock) {
        return console.log("error: All fields are required");
      } else if (products.some((product) => product.code === code.trim())) {
        return console.log("error: Product code already exists");
      } else {
        const product = {
          id: products.length ? products[products.length - 1].code + 1 : 1,
          title: title.trim(),
          description: description.trim(),
          price: price,
          thumbnail: thumbnail.trim(),
          code: code.trim(),
          stock: stock,
        };
        products.push(product);
        await fs.promises.writeFile(this.path, JSON.stringify(products));
      }
    } catch (error) {
      return error;
    }
  }

  // método para obtener un producto por su id
  async getProductById(id) {
    try {
      const products = await this.getProducts();
      return (
        products.find((product) => product.id == id) || {
          error: "Product Not Found",
        }
      );
    } catch (error) {
      return error;
    }
  }

  // método para actualizar información del producto por su id
  async updateProductById(id, data) {
    try {
      const products = await this.getProducts();
      const productIndex = products.findIndex((product) => product.id == id);
      if (productIndex === -1) {
        return { error: "Product Not Found" };
      }

      //validación de que no se pueda modificar el id del producto
      if (data.id && data.id !== id) {
        throw new Error("Updating the product ID is not allowed");
      }

      const updatedProduct = { ...products[productIndex], ...data };
      products[productIndex] = updatedProduct;
      await fs.promises.writeFile(this.path, JSON.stringify(products));
      return updatedProduct;
    } catch (error) {
      return error;
    }
  }

  // método para eliminar un producto por su id
  async deleteProductById(id) {
    try {
      const products = await this.getProducts();
      const newProductsArray = products.filter((product) => product.id != id);
      await fs.promises.writeFile(this.path, JSON.stringify(newProductsArray));
    } catch (error) {
      return error;
    }
  }
}

// TESTING
async function test() {
  //Se crea una instancia de la clase “ProductManager”
  const productManager = new ProductManager("./products.json");

  //Se llama a “getProducts” y devuelve arreglo vacío []
  console.log("Array vacío", await productManager.getProducts());

  //Se llamará al método “addProduct” para agregar un producto prueba
  await productManager.addProduct(
    "producto prueba",
    "Este es un producto prueba",
    200,
    "Sin imagen",
    "abc123",
    25
  );

  // Se llama al método “getProducts” nuevamente, aparece el producto agregado
  console.log("Primer producto agregado", await productManager.getProducts());

  // Se llama al método getProductById con el id del producto agregado
  console.log(
    "Buscamos el producto con id 1",
    await productManager.getProductById(1)
  );

  // Se llama al método getProductById con el id de un producto que no existe para ver mensaje de error
  console.log(
    "Buscamos el producto con id 500",
    await productManager.getProductById(500)
  );

  // Se llama al método updateProductById buscando modificar el id, para ver mensaje de error
  console.log(
    "Modificamos el id del producto con id 1",
    await productManager.updateProductById(1, { id: 2 })
  );

  // Se llama al método updateProductById para modificar el producto agregado
  console.log(
    "Modificamos el producto con id 1",
    await productManager.updateProductById(1, { title: "Producto modificado" })
  );

  // Se llama al método getProducts para ver que el producto se haya modificado
  console.log(
    "Vemos que el producto se haya modificado",
    await productManager.getProducts()
  );

  // Se llama al método deleteProductById para eliminar el producto agregado
  console.log(
    "Eliminamos el producto con id 1",
    await productManager.deleteProductById(1)
  );
}

test();

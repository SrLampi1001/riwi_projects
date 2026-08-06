def agregar_producto(inventario, nombre, precio, cantidad):
    """
    Agrega un producto al inventario
    Requiere input del usuario
    """
    producto = {
        "Nombre": nombre,
        "Precio": precio,
        "Cantidad": cantidad
    }
    inventario.append(producto)

def mostrar_inventario(inventario):
    """
    Muestra el inventario
    """
    if len(inventario)== 0:
        print("\nNo hay productos-------------------------------------------")
        return
    print("\n---------------------------------------------------------------------------------------------------------")
    for producto in inventario:
        print(f"Nombre: {producto["Nombre"]}    |   Precio: {producto["Precio"]}    |   Cantidad: {producto["Cantidad"]}")
    print("---------------------------------------------------------------------------------------------------------")

def buscar_producto(inventario, nombre):
    """
    Busca un producto en el inventario
    """
    if len(inventario)==0:
        print("\nNo hay productos en el inventario")
        return
    for producto in inventario:
        if producto["Nombre"].lower() == nombre.lower():
            return producto
    print("Producto no encontrado\n")
    return None

def actualizar_producto(inventario, nombre, nuevo_nombre, nuevo_precio, nueva_cantidad):
    """
    Actualiza el precio y/o cantidad del producto seleccionado en el inventario
    """
    producto = buscar_producto(inventario, nombre)
    if producto == None:
        return
    producto["Nombre"] = nuevo_nombre if nuevo_nombre != None else producto["Nombre"]
    producto["Precio"] = nuevo_precio if nuevo_precio != None else producto["Precio"]
    producto["Cantidad"] = nueva_cantidad if nueva_cantidad != None else producto["Cantidad"]


def eliminar_producto(inventario, nombre):
    """
    Elimina un producto del inventario
    """
    producto = buscar_producto(inventario, nombre)
    if producto == None:
        return
    inventario.remove(producto)
    print("Producto eliminado\n")

def calcular_estadisticas(inventario):
    """
    Calcula las estadísticas del inventario:

    unidades_totales = suma de cantidad
    valor_total = suma de precio * cantidad
    producto_mas_caro (nombre y precio)
    producto_mayor_stock (nombre y cantidad)

    Usa una lambda para calcular el subtotal de cada producto:
    subtotal = (lambda p: p["precio"]*p["cantidad"])(producto)
    """
    if len(inventario)==0:
        print("inventario vacío ------------")
        return None, None, None, None #retorno None estadísticas
    unidades_totales = 0
    valor_total = 0
    producto_mas_caro = ""; current_price = 0;
    producto_mayor_stock = ""; current_stock = 0;
    
    for producto in inventario:
        unidades_totales += producto["Cantidad"]
        valor_total += (lambda p: p["Precio"]*p["Cantidad"])(producto) #Autoejecucion con parametro producto, lambda

        if producto["Precio"] > current_price:
            producto_mas_caro = producto["Nombre"] 
            current_price = producto["Precio"]
        elif producto["Precio"] == current_price:
            producto_mas_caro += ", "+producto["Nombre"]

        if producto["Cantidad"] > current_stock:
            producto_mayor_stock = producto["Nombre"]
            current_stock = producto["Cantidad"]
        elif producto["Cantidad"] == current_stock:
            producto_mayor_stock += ", "+producto["Nombre"]
    
    producto_mayor_stock += f" ({current_stock} unidades)"
    producto_mas_caro += f" ({current_price} COP)"

    return unidades_totales, valor_total, producto_mas_caro, producto_mayor_stock
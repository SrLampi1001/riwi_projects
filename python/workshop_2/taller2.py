#Cree un programa completo que permita gestionar un inventario de productos usando todo lo aprendido
#Registrar productos: Nombre, precio, cantidad
#Mostrar inventario, Listar todos los productos
#Buscar y actualizar
#Eliminar productos

inventario = {};
def tryAndInt(toInt): #función para no terminar el programa cuando se envía un dato inválido a una entrada de dato entero
	try:
		toInt = int(toInt);
		return toInt;
	except:
		toInt = input("El valor ingresado no puede ser transformado en un número entero, por favor ingrese otro valor: ");
		return tryAndInt(toInt);

def tryAndFloat(toFloat): #función para no terminar el programa cuando se envíá un dato inválido para una entrada de dato float
	try:
		toFloat = float(toFloat)
		return toFloat;
	except:
		toFloat = input("El valor ingresado no puede ser transformado en un número flotante o decimal, por favor ingrese otro valor: ")
		return tryAndFloat(toFloat)

def registrar_producto(inventario = inventario):
	nombre = input("ingrese un nombre para el producto: ");
	producto = {
	"nombre": nombre,
	"precio": tryAndFloat(input("ingrese un precio para el producto: ")),
	"cantidad": tryAndInt(input("Ingrese una cantidad del producto: "))
	}
	inventario[nombre.lower()] = producto;
	print(f"\nProducto {nombre} registrado con exito")
def mostrar_inventario(inventario = inventario):
	print("---------------------------------------------------------------------------------------------------------------")
	for key in inventario.keys():
		obj = inventario[key];
		print(f"\nProducto: {obj["nombre"]}	|	Precio: {obj["precio"]}	|	Cantidad: {obj["cantidad"]}")
	print("---------------------------------------------------------------------------------------------------------------")
def actualizar_producto(inventario = inventario):
	toactualizar = input("Que producto va a actualizar?: ").lower();	actualizarDato = 0;
	if toactualizar in inventario:
		actualizarDato = input("\nSe ha encontrado el elemento que desea actualizar, que desea actualizar del producto?:\n1)Nombre\n2)Precio\n3)Cantidad\n:: ")
	else:
		print("\nNo se ha encontrado el elemento que desea actualizar")
		return;
	if actualizarDato == "1":
		newName = input("ingrese el nuevo nombre del producto: ");
		viejoElemento = inventario[toactualizar]; viejoElemento["nombre"] = newName;
		del inventario[toactualizar];
		inventario[newName.lower()] = viejoElemento;
	elif actualizarDato == "2":
		newPrice = tryAndFloat(input("ingrese un nuevo precio para el producto: "))
		inventario[toactualizar]["precio"] = newPrice;
	elif actualizarDato == "3":
		NewCantidad = tryAndInt(input("ingrese una nueva cantidad del producto: "))
	else:
		print("\nHas ingresado una opción inválida, por favor vuelva a repetir")
		actualizar_producto();
def eliminar_producto(inventario = inventario):
	aEliminar = input("\nIngrese el nombre del producto que desea eliminar: ").lower()
	if aEliminar in inventario:
		print("eliminando producto...")
		del inventario[aEliminar];
	else:
		print("no se ha encontrado el producto que desea eliminar")

while True:
	mensajeEntrada = """
	Bienvenido al Menú:\n
	Elija una de las opciones:
	1-Añadir un producto
	2-Ver inventario
	3-Actualizar un producto
	4-Eliminar un producto
	5-Salir
	:: """;
	opciones = input(mensajeEntrada);
	if opciones == "1":
		registrar_producto();
	elif opciones =="2":
		mostrar_inventario();
	elif opciones =="3":
		actualizar_producto();
	elif opciones == "4":
		eliminar_producto();
	elif opciones == "5":
		break;
	else:
		print("Has elegido una opción incorrecta")
		continue;

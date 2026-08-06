# Validación de datos condicionales:
# Crea un menú que pregunte al usuario que desa realizar:
# Agregar producto / Mostrar inventario / Calcular estadisticas / Salir
# Usa condicionales if, elif y else para procesar la opción elegida
inventario = [] # cada producto debe almacenarse como un diccionario dentro de una lista llamada inventario
# Estructura el codigo en funciones simples: agregar_producto(), mostrar_inventario(), calcular_estadisticas()

def agregar_producto(inventario = inventario): # inventario es inventario declarada globalmente
	producto = {
		"nombre": input("ingrese un nombre para el producto: "),
		"precio": float(input("Ingrese un precio para el producto: ")),
		"cantidad": int(input("ingrese una cantidad del producto: "))
	}
	inventario.append(producto);
	if input("Desea agregar otro producto? : ") == "si" : # Permite agregar varios productos seguidos:
		return False;
	else:
		return True # validar opcion
def mostrar_inventario(inventario = inventario):
	# Implemente una opción en el menú que recorra el inventario con un bucle for:
	# si el inventario está vacío, muestra un mensaje que lo indique
	if len(inventario) == 0 :
		print("El inventario se encuentra vacío");
	else:
		for prod in inventario:
			# Muestra los productos en un formato claro
			print(f"\nProducto: {prod["nombre"]}\nPrecio: {prod["precio"]}\nCantidad: {prod["cantidad"]}\n")
	return True; # Siempre retorna true
def calcular_estadisticas(inventario = inventario):
	# Valor total del inventario
	valor_total = 0;
	# Cantidad total de productos registrados
	cantidad_total_registrados = 0;
	print(f"Producto		Precio		Cantidad		Subtotal"); # Estilo de factura:
	for prod in inventario: # usar ciclo for para iterar en el inventario
		valor_total = valor_total + (prod["precio"]*prod["cantidad"]); #por cada producto que hay, calcular precio por cantidad y sumar al resultado total.
		print(f"{prod["nombre"]}		{prod["precio"]}		{prod["cantidad"]}		{prod["precio"]*prod["cantidad"]}") # coincidir con el estilo de factura
		cantidad_total_registrados = cantidad_total_registrados + prod["cantidad"] # sumar la cantidad de cada producto al total de registrados
	print(f"Productos totales: {cantidad_total_registrados}			Total: {valor_total}") # imprime los restultados de los calculos
	return True;
# inicio del menú :
salir = False; # Variable para terminar el bucle
while not salir: # Envuelve el menú en un bucle while que siga ejecutandose hasta que elija salir (mientras no salir)
	opcionElegida = input("Usuario/a, ingrese una de las siguientes opciones, bien sea por el número o escribiendo la opción:\n1- Agregar producto \n2-Mostrar inventario \n3-Calcular estadisticas\n4- salir \n")
	validacion = False;
	while not validacion: # mientras no este validado
		if opcionElegida == "1" or opcionElegida=="Agregar producto": # si la opción elegida es 1 o agregar producto
			validacion = agregar_producto() # Si se elige en la función añadir otro producto, la validación será false y el while se repetirá
		elif opcionElegida == "2" or opcionElegida=="Mostrar inventario":
			validacion = mostrar_inventario() # el valor de retorno siempre es TRUE y se ejecuta la funcion
		elif opcionElegida == "3" or opcionElegida=="Calcular estadisticas":
			validacion = calcular_estadisticas();
		elif opcionElegida == "4" or opcionElegida=="Salir":
			salir = True; # salir se hace verdadero
			break; # termina el while
		else: #si el usuario ingresa una opción inválida, muestra un mensaje de error y pide nuevamente la entrada:
			opcionElegida = input("La opción que ha ingresado no es válida, por favor ingrese una opción nuevamente: \n::")
			validacion = False;
# El objetivo de la semana es familiarizarse con la sintaxis de Python, y aprender lo básico de la programación on funciones, bucles y condicionales.

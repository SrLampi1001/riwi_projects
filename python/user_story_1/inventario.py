# Declara variables para nombre (string), precio (float), cantidad (int)
# solicita al usuario estos datos con la función input
nombre = input("Ingrese una cadena de texto para el nombre del producto: "); precio = input("ingrese un valor para el precio del producto: "); cantidad = input("ingrese la cantidad de unidades disponibles del producto: ");
#Asegúrate de que el precio y la cantidad se conviertan correctamente a sus tipos numéricos usando float() e int()
# Si el usuario ingresa un valor inválido, muestra un mensaje y vuelve a pedirlo
succesfulltry = False; #crear una variable que determina si el ciclo while se repite
while not succesfulltry: #significa mientras no sea un intento exitoso: 
	try:
		precio = float(precio);
		succesfulltry= True #en caso de el  Try ejecutarse correctamente, es decir, puede ser float, terminar ciclo
	except:
		precio = input("el valor de precio es inválido, por favor ingrese un valor válido esta vez: ")
		succesfulltry=False #en caso de que no se ejecute el TRY, entonces el intento fue un fracaso y continuar el ciclo while
succesfulltry = False; # se reutiliza la variable
while not succesfulltry: #reutilizar el mismo ciclo, pero con variable diferente
	try:
		cantidad = int(cantidad)
		succesfulltry =  True
	except:
		cantidad = input("el valor de cantidad es inválido, por favor ingrese un valor válido esta vez: ")
		succesfulltry =  False
# Crea una variable llamada costo_total
# Almacena en ella el resultado de multiplicar el precio por la cantidad
costo_total = precio * cantidad
# Mostrar resultados en consola
# Usa la función print para mostrar un mensaje con Nombre del producto, precio unitario, cantidad, costo total calculado
# el formato debe ser claro
print(f"Producto: {nombre}, \nPrecio unitario: {precio}, \nCantidad: {cantidad}, \nCosto total calculado: {costo_total}")

# El inicio del programa pide al usuario nombre, precio, cantidad de un producto, luego de insertar los datos verifica, dentro de un while
# haciendo uso de un try except para evitar que un error interrumpa la ejecución del programa, determinar si los valores ingresados son válidos
# y pueden ser utilizados para la creación del producto. Si no lo son, entonces se repetirá el ciclo while hasta que el usuario ingrese datos
# validos. 
# luego de esto, calcula el costo total de la cantidad del producto ingresado multiplicado por el precio unitario de cada producto
# esto se imprime en pantalla, y el programa finaliza.

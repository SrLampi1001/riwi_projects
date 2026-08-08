#crea un programa que permita gestionar una pequeña biblioteca:
#Ver los libros disponibles
#Prestar libros
#Devolver libros
#Ver el historial de prestamos
historial_prestamos = {};
biblioteca = {};
def pedir_string(): #función para pedir un string al usuario
	string = input("\ningrese una cadena de texto: ")
	if string == "":
		print("\ncadena de texto vacía es inválida, por favor ingrese de nuevo");
		return pedir_string();
	else:
		try:
			intento = float(string);
			print("\nLa cadena de texto no pueden ser números, por favor ingrese un valor válido")
			return pedir_string();
		except:
			return string;

def pedir_integer(): #función para pedir un número entero al usuario
	integer = input("\ningrese un número entero: ")
	if integer=="":
		return 0
	else:
		try:
			integer = int(integer)
			return integer
		except:
			print("\nValor de número entero inválido, por favor ingrese un nuevo valor")
			return pedir_integer();

def pedir_float(): #función para pedir un número decimal al usuario
	flot = input("\nIngrese un número entero  o decimal válido: ")
	if flot=="":
		return 0;
	else:
		try:
			flot = float(flot)
			return flot;
		except:
			print("\nValor de número entero o decímal inválido, por favor ingrese un nuevo valor")
			return pedir_float();

def nuevo_libro(): #función para crear un nuevo libro
	print("Ingrese nombre:"); nombre = pedir_string();
	print("Ingrese autor:");autor = pedir_string();
	print("Ingrese precio:"); precio = pedir_float();
	libro = {
		"nombre": nombre,
		"autor": autor,
		"precio": precio,
		"prestado": False,
		"en": "biblioteca"
	}
	biblioteca[nombre] = libro;

def prestar_libro(): #función para pedir un libro prestado
	print("ingrese el nombre del libro:");libro=pedir_string();
	if libro not in biblioteca:
		print("\nel libro no existe")
		return;
	elif biblioteca[libro]["prestado"]==True:
		print("\nel libro ya ha sido prestado")
		return;
	else:
		print("Ingrese su nombre:");persona = pedir_string();
		biblioteca[libro]["prestado"] = True;
		biblioteca[libro]["en"] = persona;
	if libro in historial_prestamos:
		historial_prestamos[libro].append(persona);
	else:
		historial_prestamos[libro] = [persona];
	print("\nse ha prestado el libro")

def devolver_libro(): #función para devolver un libro prestado
	print("ingrese nombre del libro");libro=pedir_string();
	if libro not in biblioteca:
		print("\nEl libro no existe")
		return
	elif biblioteca[libro]["prestado"]==False:
		print("\nEl libro nunca ha sido prestado")
		return
	else:
		biblioteca[libro]["prestado"] = False;
		print(f"\nEl libro ha sido devuelto con exito, gracias {biblioteca[libro]["en"]} por devolverlo")
		biblioteca[libro]["en"] ="biblioteca";
def mostrar_libros(): #función para mostrar todos los libros en la biblioteca
	for libro in biblioteca.keys():
		print(f"\nLibro: {libro}	|	Autor : {biblioteca[libro]["autor"]}	|	Precio : {biblioteca[libro]["precio"]}	|	Disponible: {"si" if (biblioteca[libro]["prestado"]==False) else "no"}	|	En propiedad de:  {biblioteca[libro]["en"]}")

def mostrar_historial_prestamos(): #función para mostrar el historial de prestamos:
	for libro in historial_prestamos.keys():
		print(f"\n{libro} fue prestado a:")
		nombres = "";
		for nombre in historial_prestamos[libro]:
			nombres = nombres + nombre+"	|	";
		print(nombres+"\n");
#inicio menú
while True:
	mensaje = """
Bienvenido al menú de la biblioteca, elija una de las opciones:

1) Ingresar un libro a la biblioteca
2) Ver los libros en la biblioteca
3) Pedir un libro prestado
4) Devolver un libro prestado
5) Ver el historial de prestamos de la biblioteca
6) Salir

::
	"""
	print(mensaje);
	entrada = pedir_integer();
	if entrada > 6 or entrada < 1:
		print("\nHa ingresado una opción que no existe, intente nuevamente")
		print("--------------------------------------------------------------------------------------------------------")
		continue
	if entrada == 6:
		break;
	elif entrada == 1:
		print("\nIngrese los datos del libro en el siguiente orden:\n - Nombre del libro\n - Autor del Libro\n - Precio del libro")
		nuevo_libro();
	elif entrada == 2:
		print("\nA continuación el catálogo de libros de la biblioteca")
		mostrar_libros()
	elif entrada == 3:
		print("\nIngrese en el siguiente orden: nombre del libro que desea pedir prestado, y su nombre")
		prestar_libro()
	elif entrada == 4:
		print("\nIngrese el nombre del libro que desea devolver a la biblioteca")
		devolver_libro()
	else:
		print("\nA continuación el historial de prestamos de la biblioteca")
		mostrar_historial_prestamos()


#Simula una app de tareas pendientes:
#Agregar tareas
#marcar tareas como completadas
#Eliminar tareas
#Mostrar todas las tareas
#Salir del sistema
tareas = [];
def crear_string(): #función para pedir strings al usuario
	string = input()
	if string == "":
		print("invalido")
		return crear_string()
	try:
		float(string); print("inválido")
		return crear_string()
	except:
		return string
def crear_int(): #función parap pedir int al usuario
	i = input()
	try:
		return int(i)
	except:
		print("inválido")
		return crear_int()

def crear_tarea(): #funcion para crear una tarea
	print("ingrese el titúlo de la tarea:\n");titulo = crear_string() #pedida al usuario del nombre de la tarea
	print("ingrese el contenido de la tarea:\n");contenido = crear_string(); #pedida al usuario del contenido de la tarea
	tarea = {
	"titulo": titulo, #titulo de la tarea
	"contenido": contenido, #contenido de la tarea
	"finalizada": False, #si está finalizada o no
	}
	tareas.append(tarea) #insertar la tarea en la lista de tareas
	print("el número de la tarea es :" + str(len(tareas)))

def editar_tarea(): #función para editar el contenido de una tarea
	print("ingrese la tarea que quiere editar por el número de la tarea, o -1 si desea salir ")
	n = crear_int()
	if n == -1:
		return
	try:
		tarea = tareas[n-1]
	except:
		print("la tarea no existe")
		return editar_tarea() #termina la ejecución de la función, pero llama una ejecución nueva para editar otra tarea, sin volver al menú principal
	print("Escriba 1 para cambiar el titulo, 2 para cambiar el contenido o 3 para salir")
	n = crear_int()
	if n == 1:
		print("Escriba el nuevo titulo:")
		tarea["titulo"] = crear_string() #pedir al usuario un nuevo string
	elif n == 2:
		print("escriba el nuevo contenido:")
		tarea["contenido"] = crear_string() #pedir al usuario nuevo string
	elif n== 3:
		return;
	else:
		print("ha elegido una opción que no existe")
		return editar_tarea()
def marcar_tarea_completada(): #función para marcar tarea como completada
	print("Seleccione la tarea para completar por el número, o -1 para salir")
	n = crear_int()
	if n == -1:
		return;
	try:
		tarea = tareas[n-1]
	except:
		print("no existe la tarea")
		return marcar_tarea_completada()
	tarea["finalizada"] = True
	print("se ha marcado como completada existosamente")
def eliminar_tarea(): #función para eliminar una tarea de la lista
	print("Seleccione la tarea para eliminar por le número, o -1 para salir")
	n = crear_int();
	if n == -1:
		return
	try:
		tarea = tareas[n-1]
	except:
		print("no existe la tarea")
		return eliminar_tarea()
	del tareas[n-1]

def mostrar_tareas(): #función para mostrar todas las tareas
	i = 1;
	for tarea in tareas:
		print(f"tarea número: {i}:\n{tarea["titulo"]}:\n{tarea["contenido"]}\nFinalizada: {"Si"if (tarea["finalizada"] ==True) else "No"}\n")
		i = i+1

while True: #menú
	message = """
To-Do List

Elija una opción

1- Ver todas las tareas
2- Crear una nueva tarea
3- Editar una tarea
4- Eliminar una tarea
5- Marcar tarea como completada
6- Salir"""
	print(message)
	entrada = crear_int()
	match entrada:
		case 1:
			print("\n------------------------------------------------------------------------------------")
			print("todas las tareas: \n")
			mostrar_tareas()
			print("\n------------------------------------------------------------------------------------")
			continue
		case 2:
			crear_tarea()
			continue
		case 3:
			editar_tarea()
			continue
		case 4:
			eliminar_tarea()
			continue
		case 5:
			marcar_tarea_completada()
			continue
		case 6:
			break

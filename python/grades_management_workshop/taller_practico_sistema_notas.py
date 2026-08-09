#usar la función:
def calcular_promedio(notas):
	return sum(notas) / len(notas)
#usar la función
def estado_estudiante(promedio):
	if promedio >= 3:
		return "aprovado"
	else:
		return "Reprovado"
"""#usar el siguiente programa principal
nombre = input("nombre: ")
notas = [float(input(f"Nota {i+1}: ")) for i in range(3)]
prom= round(calcular_promedio(notas), 2)
print(f"{nombre}: {prom} - {estado_estudiante(prom)}")
"""
#Desafío extra: Modifica el programa para aceptar cualquier cantidad de notas o añade una función que muestre si el promedio es excelente (>=4.5), bueno (>= 4) o suficiente (>=3)
def pedir_string(): #función para pedir un string
	string = input();
	if string=="":
		print("inválido")
		return pedir_string();
	try:
		float(string)
		print("inválido")
		return pedir_string()
	except:
		return string
def pedir_nota(): #función para pedir una nota
	nota = input();
	if nota == "":
		return -1
	try:
		nota = float(nota);
	except:
		print("valor inválido")
		return pedir_nota();
	validation = False if nota not in [x*0.1 for x in range(1,51)] else True #usando x*0.1, obtenemos una lista que empieza en 1.1 hasta 5.0
	if not validation:
		print("nota fuera del rango aceptado (0 a 5)")
		return pedir_nota()
	return float(nota)

def estado_promedio(promedio): #funcioń para determinar promedio excelente, bueno, suficiente o malo
	if promedio >= 4.5:
		return "excelente"
	elif promedio >= 4:
		return "bueno"
	elif promedio >= 3:
		return "suficiente"
	else:
		return "malo"
#Nuevo proceso principal con funciones mejoradas, y capacitado para aceptar cualquer cantidad de notas

print("ingrese el nombre:")
nombre = pedir_string()
print("ingrese las notas, si desea dejar de añadir notas, presione enter en la entrada vacía")
notas = [] #declarar la variable notas
nota = 0; #declarar la variable nota para usar en el while
while nota != -1: 
	nota = pedir_nota()
	notas.append(nota) if nota != -1 else print("fin notas")

prom= round(calcular_promedio(notas), 2)
print(f"{nombre}: {prom} - {estado_estudiante(prom)} - {estado_promedio(prom)}")

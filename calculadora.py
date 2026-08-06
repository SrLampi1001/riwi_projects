#Crear una calculadora que permita realizar operaciones básicas y ver el historial
#debe permitir:
#sumar, restar, multiplicar y dividir
#mostrar todo el historial
#borrar el historial

#A notar de la calculadora
# los números decimales deben de ser es)critos con puntos y no con comas
operaciones = ["*", "/", "+", "-", "(",")"]
historial_operaciones = [] #Lista para guardar las operaciones realizadas
#operacion_basica = "(1.3+30*(150/888-3)+((44/3+1)-545*77+66677 * 1.4491))/700 - (30+(90/7*54)-65/(355*(55/4+(35.214*81.3-(45+999)))))"
#operacion_basica = "(1.3+30*(150/888-3)+((44-12)-545*77+66677 ** 1.4491))/700 - (30+(0/20)-65/(355*(55/4+(35.214*81.3-(45+999)))))"
#operacion_resuelta = (1.3+30*(150/888-3)+((44-12)-545*77+66677 * 1.4491))/700 - (30+(0/20)-65/(355*(55/4+(35.214*81.3-(45+999)))));
#print (f"{operacion_basica} = {operacion_resuelta}")

def convertir_float(number): #función envoltoria del metodo float para evitar un cierre de programa al ingresar una entrada inválida
    try:
        return float(number)
    except:
        print(f"El número que  ha ingresado en la operación {number} es inválido, por favor ingrese un valor válido a continuación:")
        return convertir_float(input())

def extraer_numeros(operacion):
    #operación de manejo de excepción en caso de ingresar un valor vacío desde que no existe caso (por el menu)
#    if operacion == "": #en caso de ingresar una operación vacia, retornar
#        print("Error!! no se puede ingresar una operación vacia")
#        return "error", "error" 
    numeros = [] # lista de números en el orden en que aparecen en la operación
    current_number = "" #variable temporal para guardar el número en que se está trabajando
    parentesis_maximo = 0
    parentesis_abiertos = 0
    for i in operacion:
        if i in operaciones:
            if current_number != "": #en caso de existir un caso en que el numero actual de trabajo está vacío, es decir, hubo 2 no numeros consecutivos
                numeros.append(convertir_float(current_number)) #guardar el número como float en el arreglo
            current_number = "" #reiniciar la variable temporal para el siguiente número
            numeros.append(i)
            #llevar un registro de cual es el parentesís más pequeño, para empezar desde esa operación
            if i== "(":
                parentesis_abiertos += 1
                parentesis_maximo = parentesis_abiertos if parentesis_abiertos > parentesis_maximo else parentesis_maximo
            elif i==")":
                parentesis_abiertos += -1
        elif i in ["1","2","3","4","5","6","7","8","9","0", "."]:
            current_number += i
        elif i != " ": #si no se da ninguno de los anteriores casos, significa que el valor en el string no es un número (y es diferente a un espacio vacío), punto o símbolo de operación, por lo tanto, es inválido
            print("Error!! Ha ingresado un carácter inválido")
            return "error", "error" #evitar un error que cierre el programa al pasar la cantidad inadecuada de parametros a la siguiente función del programa
    if parentesis_abiertos != 0: #La variable lleva registro de la cantidad de parentesis que han sido cerradas en el 
        print("Error!! hay uno o más parentesís que no han sido cerrados")
        return "error", "error"
    if(current_number != ""):
        numeros.append(convertir_float(current_number)) #guardar el último número, el bucle no guarda el número final
    return numeros, parentesis_maximo

def operar(lista_numeros, parentesis_maximo, i = True): #función para ir resolviendo cada paréntesis
    #Condicional que guarda la primera operacion 
    if lista_numeros == "error": #Verificar si la entrada fue "error"
        return
    if parentesis_maximo == 0: #Cuando la cantidad de parentesis es 0, hacer la operacion 
        return operar_minimo(lista_numeros)
    parentesis_actual = 0
    operacion_a_resolver = []
    llego_a_maximo = False
    for i in range(len(lista_numeros)):
        if lista_numeros[i] == "(":
            parentesis_actual += 1
        elif lista_numeros[i] == ")":
            parentesis_actual += -1
        
        if parentesis_actual == parentesis_maximo:
            operacion_a_resolver.append(lista_numeros[i]) if lista_numeros[i] != "(" else None;
            if llego_a_maximo == False:
                lista_numeros[i] = "inicio"
            insertar_en = i
            llego_a_maximo = True
        elif llego_a_maximo == True and parentesis_actual == parentesis_maximo-1: #en caso de ya haber llegado al maximo de parentesis, y se redujo
            lista_numeros[insertar_en] = "fin"
            lista_numeros[insertar_en+1] = operar_minimo(operacion_a_resolver) #insertar la operacion mínima resuelta, reduciendo el arreglo de la operación maxima uno a uno
            llego_a_maximo = False #resetear llego a maximo en caso de que exista otro parentesis en el mismo nivel
            operacion_a_resolver = [] #resetear el arreglo de la operación a resolver en caso de que exista en la operación un mismo nivel de parentesis en otro sitio
    while "inicio" in lista_numeros:
        if "error" in lista_numeros: #si se intentó una división entre 0, error estará en la lista de la operación, en cuyo caso, terminar
            return
        inicio = lista_numeros.index("inicio")
        fin = lista_numeros.index("fin", inicio)
        del lista_numeros[inicio : fin+1]
    return operar(lista_numeros, parentesis_maximo-1) #Se opera hasta que la cantidad de parentesis sea 0

def operar_minimo(lista_numeros): #función para resolver operacines sin parentesis
    if "/" in lista_numeros: #Por convención, se resuelven primero las divisiones más a la izquierda (in siempre busca la primera coincidencia de izquierda a derecha)
        i = lista_numeros.index("/", 1)
        if lista_numeros[i+1] == 0: #verificar que no se está intentando una división entre 0
            print("Error, división entre 0 no es posible") if lista_numeros[i+1]==0 else print("Error, no pueden ingresarse dos operadores consecutivos")
            return "error"
        result = lista_numeros[i-1]/lista_numeros[i+1]
        del lista_numeros[i-1 : i+2]
        lista_numeros.insert(i-1, result)
        return operar_minimo(lista_numeros)
    elif "*" in lista_numeros: #Depués de las divisiones, siguien las multplicaciones en orden
        i = lista_numeros.index("*", 1)
        if lista_numeros[i+1] in operaciones: #verificar que no se está intentando una división entre 0
            print("Error, no pueden ingresarse dos operadores consecutivos")
            return "error"
        result = lista_numeros[i-1]/lista_numeros[i+1]
        result = lista_numeros[i-1]*lista_numeros[i+1]
        del lista_numeros[i-1 : i+2]
        lista_numeros.insert(i-1, result)
        return operar_minimo(lista_numeros)
    elif "-" in lista_numeros: #las restas van en tercer lugar
        i = lista_numeros.index("-", 1)
        if lista_numeros[i+1] in operaciones: #verificar que no se está intentando una división entre 0
            print("Error, no pueden ingresarse dos operadores consecutivos")
            return "error"
        result = lista_numeros[i-1]-lista_numeros[i+1]
        del lista_numeros[i-1 : i+2]
        lista_numeros.insert(i-1, result)
        return operar_minimo(lista_numeros)
    elif "+" in lista_numeros: #las sumas van en lo último de prioridad
        i = lista_numeros.index("+", 1)
        if lista_numeros[i+1] in operaciones: #verificar que no se está intentando una división entre 0
            print("Error, no pueden ingresarse dos operadores consecutivos")
            return "error"
        result = lista_numeros[i-1]+lista_numeros[i+1]
        del lista_numeros[i-1 : i+2]
        lista_numeros.insert(i-1, result)
        return operar_minimo(lista_numeros)
    else:
        return lista_numeros[0]
    
def mostrar_historial(): #función para mostrar el historial de operaciones
    print(historial_operaciones)
    if len(historial_operaciones)==0:
        print("\nhistorial vacío")
        return
    for i in range(len(historial_operaciones)):
        print(f"\n Operación numero {i}: {historial_operaciones[i]}")

def eliminar_historial(): #función para eliminar el historial de operaciones
    global historial_operaciones
    historial_operaciones = []

mensaje = """
Bienvenido al Menú de la calculadora:
Si desea realizar una operación solo escriba abajo
para multiplicar use "*", para dividir "/", para sumar "+", para restar "-"
Recuerde usar () para agrupar operaciones, y no ingresar más de un operador consecutivamente

Si desea revisar el historial de operaciones ingrese "Historial"
Si desea borrar el historial ingrese "Borrar"

Para salir de la calculadora, presione enter sin ingresar nada

"""
bienvenida = input(mensaje)
while True:
    if bienvenida == "Historial":
        mostrar_historial()
    elif bienvenida == "Borrar":
        eliminar_historial()
    elif bienvenida == "":
        break
    else:
        list, max = extraer_numeros(bienvenida)
        print(operar(list, max))
    bienvenida = input("ingrese un valor:\n")
#print(operar_minimo([15,"+",68.2,"/",355,"*",888,"-",98]))
#print(f"resultado de 15+68.2/355*888-98 = {15+68.2/355*888-98}")

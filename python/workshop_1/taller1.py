#escribe un programa que pida dos numeros y muestre cuál es mayor
number1 = float(input("ingrese un numero: "));
number2 = float(input("ingrese otro numero para comparar si es mayor al anterior: "));

if (number1 > number2):
	print("Bueno, el primer numero " + str(number1) + " es mayor que " + str(number2))
elif number1 != number2:
	print("Bueno, el segundo número " + str(number2) + " si es mayor al primero " + str(number1))
else:
	print("genio, eran iguales los números")
#Solicita al usuario su edad y muestra si es mayor o menor de edad

edad = int(input("señor usuario, sea tan amable de ingresar, en numeros, su edad: "));
if (edad > 17):
	print("señor usuario, usted es mayor de edad, puede continuar")
else:
	print("señor usuario, usted es menor de edad, no debería, pero puede continuar")

#Cree un programa que pida un numero y diga si es positivo, negativo o cero.
number3 = float(input("ingrese un numero, cualesquier sea, y este maravilloso programa le dirá si es positivo, negativo o 0: "));
if number3 > 0:
	print("Felicidades, era positivo")
elif number3 < 0:
	print("Felicidades, era negativo")
else:
	print("parece que era 0, si era otra cosa, por favor dirigase a nuestro sector de quejas")

#Pide al usuario un numero del 1 al 7 y muestra que día de la semana corresponde.
semanasDias = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sábado", "Domingo"]
semanaInput = int(input("señor/señora usuaria (o joven), ingrese un numero del 1 al 7, y nosotros le diremos que día de la semana es, si ingresa otro numero diferente, no tendrá la oportunidad de experimentar nuestro maravilloso programa: "))
if semanaInput > 7 or semanaInput < 1:
	print("lo siento señor/a usuario, usted ingresó un numero no válido, no pudiste experimentar el programa")
else:
	print(f"el dia de la semana que corresponde al número {semanaInput} es... el día {semanasDias[(semanaInput-1)]}")

#Solicita tres numeros y determina cual es el mayor de los tres.
number4 = float(input("Señor/a usuario/a, hemos actualizado nuestro programa y ahora puede ingresar 3, si, 3, números y saber cual es el más grande. \n Por favor ingrese el primer número: "))
number5 = float(input("Ingrese el segundo número: "));
number6 = float(input("Ingrese el tercer número: "))
if number4 > number5:
	if number4 > number6:
		print(f"El Primer número ingresado, {number4} es el más grande de los 3")
	elif number4 != number6:
		print(f"El tercer número que ingresó, {number6} es el más grande de los 3")
	else:
		print(f"El tercer y primer número son iguales {number4}, y son mayores que el segundo {number5}")
elif number5 > number6:
	print(f"El segundo número que ingresó, {number5}, es el más grande de los 3")
else:
	print(f"el tercer número que ingresó {number6}, es el más grande de los 3")

#crea un programa que crea una letra y diga si es vocal o consonante
vocales = ["a", "e", "i", "o", "u"]
letraInput = input("Señor/a usuario/a, ingrese una letra, por favor no un número, y le diremos si vocal o consonante \n::");
if letraInput in vocales:
	print(f"{letraInput} es una vocal")
else:
	print(f"{letraInput} es una consonante u otro símbolo")

#Escribe un programa que solicite una contraseña y repita el proceso hasta que el usuario ingrese "python123";
while input("Señor/señora usuaria, si quiere salir de este bucle, ingrese \"python123\" por favor: ") != "python123":
	print("aún aquí, en el bucle")

#Realiza un programa que sume todos los números del 1 al 100 usando un bucle while
sumatoria = 0;
for i in range(1, 101):
	sumatoria = sumatoria + i
print("Señor/a usuario/a, como felicitaciones por haber salido exitosamente del bucle, sepa que la suma de 1 al cien es: " + str(sumatoria))

#Pide un número y muestre su tabla de multiplicar del 1 al 10.
number7 = float(input("Señor/a cliente, por favor ingrese un número, preferiblemente entero, y le mostraremos la tabla de multiplicación de ese número hasta el 10: "))
for i in range(1, 11):
	print(f"{number7} x {i} = {number7*i}")
print("\nfin de la tabla")

#Solicita al usuario 5 números y muestra cuales son pares y cuantos impares.
number8 = int(input("Querido cliente, ahora le pido 5 números, le diremos cuales son pares y cuales no \n Ingrese el primer número: "))
numbers = [number8, int(input("ingrese el segundo número, entero por favor: ")), int(input("ingrese el tercer número, entero por favor: ")), int(input("ingrese el cuarto número, entero por favor: ")), int(input("ingrese el último número, también entero: "))]
pares = []; impares = [];
for num in numbers:
	if num%2 == 0:
		pares.append(num);
	else:
		impares.append(num);
print(f"Cliente, los números impares que ha ingresado fueron {impares}, que son un total de {len(impares)} \n Los número pares ingresados fueron {pares}, que son un total de {len(pares)}")

#Escribe un programa que pida numeros hasta que el usuario ingrese 0 y luego muestre la suma total.
sumatotal = 0;
number9 = float(input("Cliente, ingrese un número, le mostraremos la suma de todos los números que ingrese a partir de ahora: "));
while number9 != 0:
	sumatotal = sumatotal + number9;
	number9 = float(input("Cliente, ingrese otro número, o 0 para salir de aquí: "))
print("Cliente, la suma total de todos los números que ingresó hasta que decidio que era momento de poner 0, es de....\n"+str(sumatotal))

#pide una nota (0-5) y muestra si el estudiante aprueba (>=3) o reprueba

nota = float(input("\nCliente, ahora veamos, ingrese su nota por favor, del 1 a 5, y le diremos si ha aprovado, o reprovado: "));
if(nota < 1):
	print("Que? bueno, has reprovado o has ingresado una cantidad incorrecta, en todo caso, no hay segundas oportunidades, lo siento cliente")
elif(nota < 3):
	print("Has reprovado")
elif(nota > 5):
	print("Lo siento, pero no has superaprovado, ingresaste una nota inválida, pero no hay segundas oportunidades")
else:
	print("Felicidades!, has aprovado cliente")

#Crea un programa que pida el año actual, el año de nacimento y calcule la edad.

sigloNacio = int(input("Cliente, bienvenido, como este programa tiene problemas de memoria, queremos su edad de nuevo, PERO, nosotros la adivinaremos, solo ingrese el año en que nació por favor: "))
sigloAhora = int(input("Cliente, perdone, que año es actualmente? :"))
if input("Cliente, ya pasó su cumpleaños este año?: si o no: ") == "si":
	print(f"Ahora sabemos que tiene {sigloAhora-sigloNacio} años")
else:
	print(f"Ahora sabemos que tiene {sigloAhora-sigloNacio-1} años")

#Realiza un programa que pida una palabra y la muestre al revés

palabrota = input("\nCliente, ingrese una palabra porfavor, y nosotros, con nuestro increíble programa, la pondremos al revés: ")
otarbalap = "";
for i in range (len(palabrota)-1, -1, -1):
	otarbalap = otarbalap + palabrota[i];
print(f"Cliente, la palabra {palabrota} al revés, se escribe {otarbalap}")

#Pide un número y muestra todos los números pares desde 1 hasta ese número
number10 = int(input("Cliente, ingrese un número y nosotros le diremos todos los pares hasta ese número: "))
PairNumbers = [];
for i in range(0, number10, 2):
	if i == 0:
		continue;
	else:
		PairNumbers.append(i);
print(f"Cliente, los números pares que existen hasta el número {number10}, excluyendo el 0, son: {PairNumbers}\nQue en total amontan a {len(PairNumbers)} números")

#Escribe un programa que cuente cuantas letras "a" tiene una palabra.

palabrita = input("\nCliente, ingrese una palabra, esta vez, le diremos cuantas letras a tiene la palabra: ")
cantidada = 0;
for i in range(0, len(palabrita)):
	if palabrita[i] == "a":
		cantidada = cantidada+1;
print(f"Cliente, la cantidad de letras \"a\" que se encontraban en la palabra {palabrita}, es de {cantidada}")

#Crea un programa que solicite números hasta que el usuario escriba "fin" y luego muestre el promedio

inputUser = input("Cliente, bienvenido a la experiencia mágica de los promedios, por favor ingrese números Hasta el agotamiento, cuando se canse, escriba \"fin\" y le mostraremos el promedio\n:: ")
numbersitosAmount = 0;
numbersito = 0;
while inputUser != "fin":
	numbersito = float(inputUser) + numbersito;
	numbersitosAmount = numbersitosAmount +1;
	inputUser = input("ingrese otro número, o \"fin\", por favor: ")
if numbersitosAmount != 0:
	print(f"Felicidades, desde que ha ingresado la impresionante cantidad de {numbersitosAmount}, el promedio de todos fue: {numbersito/numbersitosAmount}")
else: 
	print("No ha ingresado ningún número, así que el promedio es 0")

#Pide al usuario una palabra y determina si es un palíndromo
palindromotalevez = input("Cliente, ahora llegamos al final de este maravilloso programa, finalmente \nIngrese una palabra, y si es palíndroma, que es lo mismo derecho y al revés, felicidades, si no, bueno, no pasa nada\nIngrese la palabra: ")

palindolito = palindromotalevez[len(palindromotalevez) : 0 : -1] + palindromotalevez[0];
if palindromotalevez == palindolito :
	print(f"WOOHH, {palindolito} es un palíndromo, felicidades ");
else:
	print(f"la palabra {palindromotalevez} no es un palíndromo, lamentablemente, pues al revés es {palindolito}")
print("\n SE ACABÓ EL PROGRAMA \n")

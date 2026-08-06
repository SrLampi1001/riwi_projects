import re #Expresiones regulares
import os
    #validación try and except para conversión de string a float
def validate_int(number):
    """
    Ingresa un valor string, lo convierte a int
    si es inválido, pide un nuevo valor al usuario (No acepta negativos)
    """
    if number == None:
        return None
    try:
        number = int(number)
        if number < 0: #no se permiten valores negativos
            print("No se pueden ingresar números negativos")
            return validate_int(input("Ingrese otro número(entero): "))
        return number
    except:
        print("int inválido")
        return validate_int(input("Ingrese otro número(entero): "))
    #Validación try and except para conversión de string a float
def validate_float(number):
    """
    Ingresa un valor string, lo convierte a Float
    si es inválido, pide un nuevo valor al usuario (No acepta negativos)
    """
    if number == None:
        return None
    try:
        number = float(number)
        if number < 0: #no se permiten valores negativos
            print("No se pueden ingresar números negativos")
            return validate_float(input("Ingrese otro número(real): "))
        return number
    except:
        print("Float inválido")
        return validate_float(input("Ingrese otro número(real): "))
    #validacion strings vacíos
def validate_string(string):
    """
    Valida si un string está vacío, en cuyo caso, pide al usuario uno nuevo
    """
    if string==None:
        return None
    if len(string) == 0:
        return (validate_string(input("Ingrese un string no vacío: ")))
    return string
    #Validación básica de rutas básicas
def validate_csv_path(string):
    """
    Valida si el string ingresado es un tipo de ruta a archivo válido de manera simple
    """
    if string=="":
        return validate_csv_path(input("Ingrese una ruta csv válida: "))
    if string[-1:-5:-1] != "vsc." or len(string)==4:
        return validate_csv_path(input("Ingrese una ruta de csv válida (Debe terminar en .csv): "))
    pattern = r'^[A-Za-z0-9/_-]+$' if os.sep == "/" else r'^[A-Za-z0-9_\\\-]+$' #regex patern para no caracteres especiales excepto -_/ o \ dependiendo del sistema operativo (linux/mac o Windows)
    match = string[:0:-5]  #No incluir el .csv en 
    if not bool(re.match(pattern, match)):
        return validate_csv_path(input("Ingrese una ruta de csv válida (No puede contener caracteres especiales): "))
    return os.path.normpath(string) #Retorna la ruta simplificada, no soporta cosas como "/./" etc
    
    #Valida la existencia de la ruta, y donde deja de existir
def validate_only_path_existence(string):
    """
    valida si la ruta existe, solo en el nivel de directorios
    retorna True si existe, False de otro modo
    """
    string = os.path.dirname(string) #Extrae la ruta del directorio
    return bool(os.path.exists(string))

def validate_full_path_existence(string):
    """
    Valida si toda la ruta existe, no solo los directorios
    """
    return bool(os.path.exists(string))

def transform_to_float(number):
    """
    Transforma a float sin el input del usuario
    """
    try:
        return float(number)
    except:
        return float(0)
def transform_to_int(number):
    """
    Transforma a Int sin el input del usuario
    """
    try:
        return int(number)
    except:
        return 0
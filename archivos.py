import csv
import os
import input_validation
def guardar_csv(inventario, ruta):
    """
    Formato de archivo: CSV con separador coma y encabezado: nombre, precio, cantidad

    Valida que el inventario no esté vacío antes de guardar (mensaje si lo está)

    Manejo de errores con try/except
        Problema de permisos/escritura -> informar sin cerrar el programa
    Impresión de mensaje: #si todo va bien
        "Inventario guardado {ruta}"
    """

    if len(inventario)==0:
        print("El inventario que está intentando guardar está vacío")
        return
    try: 
        with open(ruta, "w", newline="") as archivo:
            fieldnames = ["Nombre", "Precio", "Cantidad"]
            writer = csv.DictWriter(archivo, fieldnames=fieldnames)
            writer.writeheader() 
            writer.writerows(inventario)
    except Exception as e:
        print(f"Ha habido un error inesperado al intentar guardar el csv: {e}")

def cargar_csv(ruta):
    """
    Retorna lista de productos con la misma estructura de inventario

    El archivo debe tener encabezado: nombre, precio, cantidad
    Cada fila debe tener exactamente 3 columnas
    Precio debe convertirse a Float, cantidad a Int, no negativos

    Si hay filas inválidas, son omitidas, se acumula un contador de errores que se informa al final
    Manejo de FileNotFoundError, UnicodeDecodeError, ValueError y errores genéricos con mensajes claros

    al cargar:
        ¿sobrescribir inventario actual? S/N:
        S - reemplaza inventario por lo cargado
        N - fuciona por nombre:
            Sí un nombre (producto) existe, sobrescribe con el precio del csv cargado, y suma la cantidad de csv cargado al inventario
        
    Al final, refresca salida/menú y muestra resumen: productos cargados, filas inválidas, acción (reemplazo, fusión)
    """
    try:              
        result = []
        ignorados = [] #Elementos del csv ignorados
        indices = {}
        with open(ruta, "r", newline="") as archivo:
            fieldnames = ["nombre", "precio","cantidad"]
            reader = csv.reader(archivo) #Reader es un iterador, no una lista
            header = next(reader)
            for column in header: #retorna la primera fila, perteneciente al header, y continua a la siguiente iteracion
                string = column.lower().replace(' ', '') #Elimina espacios y pone en minusculas
                if string in fieldnames:
                    indices[string]= int(header.index(column))
                else:
                    ignorados.append(column)
            nombre = indices["nombre"] if "nombre" in indices else -1
            precio = indices["precio"] if "precio" in indices else -1
            cantidad = indices["cantidad"] if "cantidad" in indices else -1
            for column in reader:
                result.append({"Nombre": column[nombre] if nombre != -1 else None, 
                               "Precio": input_validation.transform_to_float(column[precio]) if precio != -1 else None, 
                               "Cantidad": input_validation.transform_to_int(column[cantidad]) if cantidad != -1 else None})
                
        print(f"\nCargado con exito!, se han cargado {len(indices)} columnas compatibles exitosamente y se han ignorado {len(ignorados)} columnas:\n")
        print(ignorados)
        print("El inventario cargado es el siguiente: ")
        for producto in result:
            print(f"Nombre: {producto["Nombre"]}    |   Precio: {producto["Precio"]}    |   Cantidad: {producto["Cantidad"]}")
        return result
    except Exception as e:
        print(f"Hubo un error al intentar cargar el csv: {e}")
        return None

def crear_ruta(ruta_final):
    """
        Crea la ruta seleccionada por el usuario para crear el archivo .csv
        usa os.makedirs()
    """
    ruta_directorio = os.path.dirname(ruta_final) #Extrae el directorio de una ruta -> si termina en inventario.csv, lo quita
    try:
        os.makedirs(ruta_directorio, exist_ok=True) #Crea los directorios
        print("Ruta creada con éxito.")
    except Exception as e:
        print(f"Error al crear la ruta: {e}")

    
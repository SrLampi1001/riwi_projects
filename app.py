import archivos 
import servicios
import input_validation
inventario = [] #variable temporal, carga csv
def menu():
    """
    Invoca todas las operaciones:
        Agregar
        Mostrar
        Buscar
        Actualizar
        Eliminar
        Estadísticas
        Guardar CSV
        Cargar CSV
        Salir

    Validación de entrada:
        opción númerica valida
        precio y cantidad números y no negativos
    Usa bucle while manteniendo programa activo hasta "Salir"
    
    Ningún error cierra el programa (captura y mensaje, volver a menú)
    """
    global inventario #Evitar que se cree una variable local inventario -> opcion 8 la crea y produce error
    print("""
                            MENU 
Bienvenido!, por favor ingrese una de las siguientes opciones (1-9):
    Ingrese el número de la opción o el nombre de la opcion

1-> Agregar un producto
2-> Mostrar los productos
3-> Buscar un producto
4-> Actualizar un producto
5-> Eliminar un producto
6-> Estadísticas del inventario
7-> Guardar inventario en CSV
8-> Cargar un CSV
9-> Salir
        
""")
    
    seleccion = input_validation.validate_string(input("Ingrese una de las opciones: "))
    if seleccion == "1" or seleccion == "Agregar un producto":
        while True:
            nombre = input_validation.validate_string(input("Ingrese un nombre para el producto: "))
            precio = input_validation.validate_float(input("Ingrese un precio para el producto: "))
            cantidad = input_validation.validate_int(input("Ingrese una cantidad para el producto: "))
            servicios.agregar_producto(inventario, nombre, precio, cantidad)
            if input_validation.validate_string(input("ingresar otro producto? (s/n): ")) != "s":
                break


    elif seleccion == "2" or seleccion == "Mostrar los productos":
        servicios.mostrar_inventario(inventario)

    elif seleccion == "3" or seleccion == "Buscar un producto":
        nombre = input_validation.validate_string(input("Ingrese el nombre del producto que está buscando: "))
        producto = servicios.buscar_producto(inventario, nombre)
        if producto == None:
            return menu()
        print(f"Nombre: {producto["Nombre"]}    |   Precio: {producto["Precio"]}    |   Cantidad: {producto["Cantidad"]}")

    elif seleccion == "4" or seleccion == "Actualizar un producto":
        nombre = input_validation.validate_string(input("Ingrese el nombre del producto a actualizar: "))
        if servicios.buscar_producto(inventario, nombre) == None:
            return menu()
        vacio = lambda p: None if p=="" else p
        nuevo_nombre = input("Ingrese un nuevo nombre para el producto: "); nuevo_nombre = input_validation.validate_string(vacio(nuevo_nombre))
        nuevo_precio = input("Ingrese un nuevo precio para el producto: "); nuevo_precio = input_validation.validate_float(vacio(nuevo_precio))
        nueva_cantidad = input("Ingrese una nueva cantidad: "); nueva_cantidad = input_validation.validate_int(vacio(nueva_cantidad))
        servicios.actualizar_producto(inventario, nombre, nuevo_nombre, nuevo_precio, nueva_cantidad)
    
    elif seleccion == "5" or seleccion == "Eliminar un producto":
        nombre = input_validation.validate_string(input("Ingrese el nombre del producto a eliminar: "))
        servicios.eliminar_producto(inventario, nombre, False)
    
    elif seleccion == "6" or seleccion == "Estadísticas del inventario":
        unidades_totales, valor_total, producto_mas_caro, producto_mayor_stock = servicios.calcular_estadisticas(inventario)
        if unidades_totales == None:
            return menu()
        print(f"""______________________________________________________________________________
              
La cantidad de unidades totales en el inventario es de: {unidades_totales}

El valor total de los productos es de: {valor_total}

El/los producto(s) más caro(s) es/son: {producto_mas_caro}

El/los producto(s) con mayor cantidad de unidades es/son: {producto_mayor_stock}
___________________________________________________________________________________
            """)
    elif seleccion=="7" or seleccion=="Guardar inventario en CSV":
        ruta = input_validation.validate_csv_path(input("Ingrese la ruta del csv a guardar: "))
        if input_validation.validate_only_path_existence(ruta):
            archivos.guardar_csv(inventario, ruta)
            return menu()
        crearuta = input_validation.validate_string(input("La ruta que ha elegido para el archivo no existe, desea crearla? (s/n): "))
        if crearuta == "s":
            archivos.crear_ruta(ruta)
            archivos.guardar_csv(inventario, ruta)

    elif seleccion=="8" or seleccion=="Cargar un CSV":
        ruta = input_validation.validate_csv_path(input("Ingrese la ruta del csv guardado: "))
        if not input_validation.validate_full_path_existence(ruta):
            print("El archivo al que está intentando acceder no existe")
            return menu()
        nuevo_inventario = archivos.cargar_csv(ruta)
        if nuevo_inventario == None:
            print("El inventario no se ha podido cargar o se encuentra vacio")
            return menu()
        print("\nDesea sobrescribir el inventario actual? (s/n)\nSi selecciona no, se adicionara el cargado al actual?")
        sel = input_validation.validate_string(input())
        while sel != 'n' and sel != 's':
            print('Por favor ingrese s o n, para si o no respectivamente, cualquier otra entrada no es permitida')
            sel = input_validation.validate_string(input())
        if sel == 's':
            inventario = nuevo_inventario #Evitar que cree una variable local inventario
            print("El inventario se ha sobrescrito con exito")
        else:
            nombre = [] #Lista de nombres en el inventario
            nombre_nuevo = [] #Lista de nombres en el nuevo inventario
            for i in range(len(inventario) if len(inventario)>= len(nuevo_inventario) else len(nuevo_inventario)): #Iterar sobre el que tenga mayor cantidad de elementos
                if i < len(nuevo_inventario):
                    nombre_nuevo.append(nuevo_inventario[i]["Nombre"].lower().replace(' ', ''))  #Ingresar sin espacios ni mayusculas para comparacion mas acertada
                if i < len(inventario):
                    nombre.append(inventario[i]["Nombre"].lower().replace(' ', ''))  #Ingresar sin espacios ni mayusculas para comparacion mas acertada
            for i in range(len(nombre_nuevo)): #Iterar sobre el que tenga mayor numero de elementos
                if nombre_nuevo[i] in nombre:
                    indice_en_inventario = int(nombre.index(nombre_nuevo[i]))
                    inventario[indice_en_inventario]["Precio"] = nuevo_inventario[i]["Precio"]
                    inventario[indice_en_inventario]["Cantidad"] += nuevo_inventario[i]["Cantidad"]
                else:
                    inventario.append(nuevo_inventario[i])
            print("El inventario cargado ha sido fusionado con el actual con exito")

    elif seleccion=="9" or seleccion=="Salir":
        print("Gracias por usar el programa")
        return
    else:
        print("Por favor ingrese una opción válida")
        return menu()
    
    return menu() #Siempre retornar el menu nuevamente



menu()
//Clase productos
class Productos{
    static id = 0;
    constructor(nombre, precio, id = null){
        this.id = id || Productos.id;
        if(id ===null) Productos.id++;
        this.nombre = nombre;
        this.precio = precio;
    }
}
//for in para propiedades de un objeto
const producto1 = new Productos("banana", 0.2)
console.log("Recorriendo las propiedades del objeto producto1 con for...in:")
for (const propiedad in producto1) {
    console.log(`${propiedad}: ${producto1[propiedad]}`)
}

//Ejemplo de uso de Set y Map
console.log("\n---Ejemplo de uso de Set y Map---")
const arrayExample = [1, 2, 3, 4, 5, 5, 6, 6, 6, 7, 8, 8, 9, 10]
//Uso de SET
const setExample = new Set(arrayExample)
console.log("\nArreglo original: ", arrayExample.join(", ")) //Muestra como se ve el arreglo original
console.log("\nSet creado a partir del arreglo: ", Array.from(setExample).join(", ")) // Muestra como se han eliminado los elementos repetidos del array original

setExample.add("noleperaconlapapaya") //se añade un elemento nuevo al set
console.log("Nuevo elemento inexistente añadido: ", Array.from(setExample).join(", ")) // Muestra el set con el nuevo elemento
setExample.add(1) //se añade un elemento que ya existia en el set
console.log("\nNuevo elemento existente añadido: ", Array.from(setExample).join(", "))
console.log("\nset.has(1): ", setExample.has(1)) //Muestra el resultado de preguntar por un elemento existente
console.log('\nset.has("no"\): ', setExample.has("no"))//Muestra el resultado de preguntar por un elemento inexistente

console.log("Deleting element 1: set.delete(1): ", setExample.delete(1), "\n", Array.from(setExample).join(", "))
//Recorriendo con For...of
console.log("\nRecorriendo el set con for...of:")
for (const item of setExample) {
    console.log(item)
}
//Uso de MAP
//Crear un mpaa que relacione la categoria del producto con su nombre
const mapExample = new Map()
mapExample.set("fruit", new Productos("apple", 0.5))
mapExample.set("vegetable", new Productos("carrot", 0.3))
mapExample.set("dairy", new Productos("milk", 1.2))
console.log("\nMap creado: ")
for (const [key, value] of mapExample) {
    console.log(`Category: ${key} \n Product: {id:${value.id}, nombre:${value.nombre}, precio:${value.precio}}`)
}
console.log("\nmap.get('fruit'): ", mapExample.get("fruit")) //Muestra el producto asociado a la categoria fruit
console.log("\nmap.has('meat'): ", mapExample.has("meat")) //Muestra si existe la categoria meat en el map
mapExample.delete("dairy") //Elimina la categoria dairy del map
console.log("\nMap despues de eliminar la categoria dairy: ")
mapExample.forEach((value, key) => {
    console.log(`Category: ${key} \n Product: {id:${value.id}, nombre:${value.nombre}, precio:${value.precio}}`)
})
//object properties Object.keys() , Object.values() , Object.entries()
console.log("\n---Object properties: Object.keys(), Object.values(), Object.entries()---")
const producto2 = new Productos("orange", 0.4)
console.log("\nProducto2: ", producto2)
console.log("\nObject.keys(producto2): ", Object.keys(producto2)) //Muestra las propiedades del objeto producto2
console.log("\nObject.values(producto2): ", Object.values(producto2)) //Muestra los valores de las propiedades del objeto producto2
console.log("\nObject.entries(producto2): ", Object.entries(producto2)) //Muestra un arreglo de arreglos con las propiedades y valores del objeto producto2
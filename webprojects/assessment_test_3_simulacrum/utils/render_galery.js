import Product from "../models/Product.js";
const getHtml = (product)=>{
    console.log(product)
    let htmlElement = document.createElement("div"); htmlElement.classList.add("card", "col-lg-4", "p-0");
    htmlElement.innerHTML = `
        <img src="${product?.image}" alt="${product?.name}" title="${product?.name}" class="card-img w-100">
            <div class="card-body">
                <h4 class="card-title">${product?.name}</h4>
                        <p class="card-subtitle text-success">$${product?.price}</p>
                        <p class="card-text">${product?.description}</p>
                        <a data-id-product="${product?.id}" href="#" class="d-inline-flex align-items-center btn border rounded-3 bg-black bg-opacity-10 w-100">
                        <i class="cart_icon"></i> 
                        Add to order</a>
                    </div>
    `
    return htmlElement;
}
document.addEventListener("DOMContentLoaded", async e=>{
    await Product.fetchAllProducts();
    const fragment = new DocumentFragment();
    for(const product of Product.products){
        fragment.append(getHtml(product[1]))
    }
    document.querySelector(".container").append(fragment)
})

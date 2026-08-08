def add_product(inventory, title, author, category, price, stock_amount):
    """
    Adds a product to the inventory
    """
    product = {
        "Title": title,
        "Author": author if author != None else "Unknown", #Predetermined value of Unknown author 
        "Category": category if category != None else "Undefined", #Predetermined value of Undefined category
        "Price":price if price != None else float(50000), #Pretermined value of 500 for price
        "Stock": stock_amount if stock_amount != None else 0 #Pretermined value of 0 for stock
    }
    inventory.append(product)

def get_inventory(inventory, title = None):
    """
    Return all inventory if not title parameter fullfiled
    If title is string, search's inventory for match results, if none, returns None
    """
    if len(inventory)== 0:
        print("\nThe inventory is empty-------------------------------------------")
        return None
    if title == None:
        return inventory
    simple_string = title.lower().replace(" ", "") #Lower case everything and delete spaces for accurate title searching
    for book in inventory:
        simple_title = book["Title"].lower().replace(" ", "")
        if simple_title == simple_string:
            return book
    print("Does not exists")
    return None

def update_product(inventory, title, new_title, new_category, new_price, stock_amount):
    """
    Updates the product's title, title, category, price and/or stock_amount
    The stock_amount is added to the Stock in the selected product
    if succesful Update returns True, else False
    """
    product = get_inventory(inventory, title)
    if product == None:
        return False
    product["Title"] = new_title if new_title != None else product["Title"]
    product["Price"] = new_price if new_price != None else product["Price"]
    product["Category"] = new_category if new_category != None else product["Category"]
    product["Stock"] += stock_amount if stock_amount != None else 0
    return True

def delete_product(inventory, title):
    """
    Deletes a product from the inventory
    Returns True if deleted, else returns False 
    """
    product = get_inventory(inventory, title)
    if product == None:
        return False
    inventory.remove(product)
    print("Product Deleted\n")
    return True

#Module for functions Register, consult, update and delete products 
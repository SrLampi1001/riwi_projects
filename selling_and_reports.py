#Module for selling products and client administration
import register as rg
import input_validation as i_v
def sell_product(inventory, registry, clients, title, amount, client, date):
    """
    Reduces the stock number of product in the inventory by the amount given
    Creates a register on the registry provided
    Returns False if not book found, True if selled succesfully
    """
    book = rg.get_inventory(inventory, title)
    client_name = client #Store name provided
    client = get_client(clients, client) #re-declare client with dictionary corresponding to client

    if book == None: #contidionals for exceptional cases
        print("No product found")
        return False
    elif book["Stock"]==0:
        print("There are no more of the selected product on stock")
        return False
    elif client == None and client_name != None:
        print("No such client found, do you wish to register it? (y/n): ")
        option = i_v.validate_y_n(input())
        if option == "n":
            print("please insert a valid client name or do not insert anything for annonymus sell: ")
            return sell_product(inventory, registry, clients, title, amount, i_v.validate_user_string(input()),date)
        register_client(clients, client_name, i_v.validate_user_int(input("Insert ID of the client: ")))
        return sell_product(inventory, registry, clients, title, amount, client_name,date)
    elif book["Stock"] < amount:
        print(f"it's not possible to sell {amount} of the product selected, as only {book["Stock"]} remain")
        print("Please select another amount to sell: ")
        return sell_product(inventory, registry, clients, title, i_v.validate_user_int(input()), client_name, date)
    
    #Normal sell_product behaviour
    discount = determine_discount(client)
    book["Stock"] += -amount
    calc_total = lambda x,y,z :(1-(x/100))*(y*z)
    register = { 
        "Sold": book["Title"],
        "Author": book["Author"],
        "Amount": amount,
        "Client": client["Name"],
        "Discount": discount,
        "Date": date,
        "Total": calc_total(discount, amount, book["Price"]),
        "Total_no_discount": book["Price"]*amount
    }
    client["Money_spent"] += calc_total(discount, amount, book["Price"])
    registry.append(register)
    print("Product sold!")
    return True

def register_client(clients, name, ID):
    """
    Registers a new client
    returns True if succesfully created, else False
    """
    if name==None or ID==None:
        print("Could not create client since name or ID were invalid")
        return False
    client = {
        "Name": name,
        "id": ID,
        "Money_spent": 0
    }
    clients.append(client)
    return True

def get_client(clients, name):
    """
    Returns the client
    None if client does not exists
    """
    if name == None:
        return clients[0] #clients 0, first position, refers to an unregistered client or Annonimus client
    simple_string = name.lower().replace(" ", "")
    for client in clients:
        client_simple = client["Name"].lower().replace(" ", "")
        if client_simple == simple_string:
            return client
    print("No client found")
    return None

def determine_discount(client):
    """
    Uses user input to determine discount
    does not accept a discount greater than 80
    """
    spens = client["Money_spent"]
    print(f"The client {client["Name"]} has spend {spens} COP in total, do you wish to make a discount?: (s/n)")
    response = i_v.validate_y_n(input())
    if response == "n":
        return 0
    print("The maximun amount for a discount allowed is 80%, please insert a float lesser than 80 for the discount: ")
    discount = i_v.validate_user_float(input())
    while discount == None or discount > 80:
        print("Please insert a valid number for discount: ")
        discount = i_v.validate_user_float(input())
    return discount

def best_sellers(registry):
    """
    Recives registry and sorts in a list from greater to lesser Total
    Creates built in sales_list by book
    returns multilayered list with sales order
    """
    if len(registry)==0:
        print("There are no sales yet")
        return []
    sales_list = {}
    for register in registry:
        if register["Sold"] not in sales_list:
            sales_list[register["Sold"]] = {"Amount": register["Amount"], "Total": register["Total"]}
        else:
            sales_list[register["Sold"]]["Amount"] += register["Amount"]
            sales_list[register["Sold"]]["Total"] += register["Total"]
    places = []
    for book, sale in sales_list.items():
        if len(places)==0:
            places.append([book, sale])
        for i in range(len(places)):
            if sale["Total"] > places[i][1]["Total"]:
                places.insert(i, [book, sale])
                break
    return places

def show_clients(clients):
    """
    returns all the clients
    """
    if len(clients)==1:
        print("No clients but Annonymus")
        return clients
    return clients
    
def calculate_profit(registry):
    """
    Calculates total profit with Total and Total_no_discount from registry
    returns tuple with total_profit, total_profict_no_discount
    """
    if len(registry)==0:
        print("There are no sales yet")
        return 0, 0
    total_profit = 0
    total_profit_no_discount = 0
    for register in registry:
        total_profit += register["Total"]
        total_profit_no_discount += register["Total_no_discount"]
    return total_profit, total_profit_no_discount

def generate_sales_report(registry):
    """
    Generates a sales report dictionary
    if no sales, returns empy dictionary
    """
    if len(registry)==0:
        print("Nothing has been sold yet")
        return {}
    sales_report = {}
    for register in registry:
        Author = register["Author"]
        if Author in sales_report:
            sales_report[Author]["Product"] += " | "+ register["Sold"]
            sales_report[Author]["Amount"] += register["Amount"]
            sales_report[Author]["Total"] +=  register["Total"]
            sales_report[Author]["Total_no_discounts"] += register["Total_no_discount"]
        else:
            sales_report[Author] = {"Product": register["Sold"], "Amount": register["Amount"], "Total": register["Total"], "Total_no_discounts":register["Total_no_discount"]}
    return sales_report


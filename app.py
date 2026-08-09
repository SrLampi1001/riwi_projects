#Application module, this module is for the execution of the application
import selling_and_reports as s_r
import input_validation as i_v
import register as rg

inventory = [   #Creates variable inventory
    {
        "Title": "The cause of the Big-bang",
        "Author": "Thomas F.Washingtong",
        "Category": "Cience", 
        "Price":float(55000),
        "Stock": 20 
    },
    {
        "Title": "Causes of rage and self-doubt",
        "Author": "Martha L.Harrison",
        "Category":"Pshycology", 
        "Price":float(78000),
        "Stock": 15 
    },
    {
        "Title": "Darkest minds",
        "Author": "Martha L.Harrison",
        "Category":"Pshycology", 
        "Price":float(37000),
        "Stock": 5 
    },
    {
        "Title": "The bunny and the bear",
        "Author": "Hammington",
        "Category":"Literature", 
        "Price":float(10000),
        "Stock": 45 
    },
    {
        "Title": "The laws: United States 1995",
        "Author": "Thomas F.Washingtong",
        "Category":"Law", 
        "Price":float(152000),
        "Stock": 0 
    }
] 
clients = [ #Creates variable clients
    {
        "Name": "Annonymus",
        "id": 0,
        "Money_spent": 0
    }
] 
registry = [] #Creates variable registry

def main_menu():
    """
    Main function, calls all other functions on the application
    """
    print("""
                Menu library
Welcome again to the Menu!, please select one of the following options
        1- Add product to the inventory
        2- Delete product from the inventory
        3- Update product from the inventory
        4- Search product from the inventory
        5- Sell product
        6- Show 3 best seller products
        7- Generate sales report
        8- Calculate profit and brute profit
        9- Show all Sales
        10- Register a new client
        11- Show clients
        12- exit
""")
    option = i_v.validate_user_int(input("Insert the option number: (1-12): "))
    while option not in range(1, 13):
        option = i_v.validate_user_int(input("Please insert a valid option (1-12): "))
    
    if option == 1:
        menu_add_product()
    elif option ==2:
        menu_delete_product()
    elif option == 3:
        menu_update_product()
    elif option == 4:
        print_search_product()
    elif option == 5:
        menu_sell_product()
    elif option == 6:
        print_3_best_seller()
    elif option == 7:
        print_sales_report()
    elif option == 8:
        print_profit_and_brute()
    elif option == 9:
        print_all_sales()
    elif option == 10:
        menu_register_client()
    elif option ==11:
        print_clients()
    else:
        return

def menu_add_product():
    global inventory
    print("\n")
    title = i_v.validate_user_string(input("Insert the name of the product(book) (press Enter to return to Main menu): \n"))
    if title == None:
        return main_menu()
    author = i_v.validate_user_string(input("Insert the product's (book's) Author (press Enter if Unknown): \n"))
    category = i_v.validate_user_string(input("Insert the product's (book's) category (press Enter if Undefined): \n"))
    price = i_v.validate_user_float(input("Insert the product's (book's) price (press Enter if 50000 COP): \n"))
    stock = i_v.validate_user_int(input("Insert the product's (book's) amount in stock (Press Enter if 0): \n"))
    rg.add_product(inventory, title, author, category, price, stock)
    print("Product succesfull added! \n")
    return menu_add_product()

def menu_delete_product():
    global inventory
    title = i_v.validate_user_string(input("Insert the name of the product(book) to delete (press Enter to return to Main menu): \n"))
    if title == None:
        return main_menu()
    rg.delete_product(inventory, title)
    return menu_delete_product()

def menu_update_product():
    global inventory
    title = i_v.validate_user_string(input("Insert the product's (book's) title (press Enter to return to Main menu): \n"))
    if title == None:
        return main_menu()
    print("Do you wish to update only the product's (book's) stock? (y/n)")
    opt = i_v.validate_y_n(input("Insert y/n: "))
    if opt == "y":
        stock_amount = i_v.validate_user_int(input("Insert the product's (book's) stock to add: \n"))
        if rg.update_product(inventory, title, None, None, None, stock_amount):
            print("Product succesfully updated!\n")
        else:
            print("There was an error and the product wasn't updated\n")
        return menu_update_product()
    new_title = i_v.validate_user_string(input("Insert the new product's (book's) title (press Enter to no update): \n"))
    new_category = i_v.validate_user_string(input("Insert the new product's (book's) category (press Enter to no update): \n"))
    new_price = i_v.validate_user_float(input("Insert the new product's (book's) price (press Enter to no update): \n"))
    stock_amount = i_v.validate_user_int(input("Insert the product's (book's) stock to add (press Enter no no update): \n"))
    if rg.update_product(inventory, title, new_title, new_category, new_price, stock_amount):
        print("Product succesfully updated!\n")
    else:
        print("There was an error and the product wasn't updated\n")
    return menu_update_product()

def print_search_product():
    global inventory
    print("Insert the product's (book's) title to search it or press Enter to see all inventory: ")
    name = i_v.validate_user_string(input("Insert title: "))
    result = rg.get_inventory(inventory, name)
    if name == None:
        if result== None:
            i_v.wait() #Wait to enter to present Main menu, important for user to not lose the result printed on console in the main_menu welcome message
            return main_menu()
        for item in result:
            print(f"""
            Title: {item["Title"]}     |Price: {item["Price"]}            
            Author: {item["Author"]}   | Category: {item["Category"]}  |Stock: {item["Stock"]}
        -------------------------------------------------------------------------------------------------------------
            """)
        i_v.wait()
        return main_menu()
    if result == None:
        print(f"No product (book) found with name {name}")
        i_v.wait()
        return main_menu()
    print(f"""
            Title:{result["Title"]}     |Price:     {result["Price"]}            
            Author:{result["Author"]}   | Category: {result["Category"]}  |Stock:{result["Stock"]}
            """)
    i_v.wait()
    return main_menu()

def menu_sell_product():
    global inventory; global registry; global clients
    title = i_v.validate_user_string(input("Insert the product's (book's) title to sell it or press Enter to return to Main menu: "))
    if title == None:
        return main_menu()
    amount = i_v.validate_user_int(input("Insert the product's (book's) amount that are being sold: "))
    client = i_v.validate_user_string(input("Insert the client's name (press Enter for Anonymus client): "))
    date = i_v.validate_date(input("Insert the date (dd/mm/yy): "))
    s_r.sell_product(inventory, registry, clients, title, amount, client, date)
    return menu_sell_product()

def print_3_best_seller():
    global registry
    result = s_r.best_sellers(registry)
    if len(result)==0:
        i_v.wait()
        return main_menu()
    for i in range(len(result) if len(result)<=3 else 3):
        print("Only one product (book) has been sold: ") if len(result)==1 else None
        print(f"""---------------------------
            {i}: 
              product: {result[i][0]} 
              Amount: {result[i][1]["Amount"]}, 
              Total: {result[i][1]["Total"]}
            -----------------------------------------""")
    i_v.wait()
    return main_menu()
        
def print_sales_report():
    global registry
    sales_report = s_r.generate_sales_report(registry)
    if len(sales_report)==0:
        i_v.wait()
        return main_menu()
    for Author, report in sales_report.items():
        print(f"""
        Author: {Author}
        ---------------------------------------------------------------
        product(s): {report["Product"]} |   Total Amount sold: {report["Amount"]}   |   Total money: {report["Total"]}  | "Total money brute: {report["Total_no_discounts"]}
        ------------------------------------------------------------------------------------------------------
        """)
    i_v.wait()
    return main_menu()

def print_profit_and_brute():
    global registry
    profit, brute_profit = s_r.calculate_profit(registry)
    print(f"total profit: {profit}  |   total brute profit: {brute_profit}")
    i_v.wait()
    return main_menu()

def print_all_sales():
    global registry
    if len(registry)== 0:
        print("There has been no sales yet")
        i_v.wait()
        return main_menu()
    for sale in registry:
        print(f"""
        Product sold: {sale["Sold"]}    |   Product Author: {sale["Author"]}    |   Amount sold: {sale["Amount"]}
        Client: {sale["Client"]}    |   Discount: {sale["Discount"]}    |   Date: {sale["Date"]}
        Total: {sale["Total"]}  |   Total_brute: {sale["Total_no_discount"]}
        """)
    i_v.wait()
    return main_menu()

def menu_register_client():
    global clients
    name = i_v.validate_user_string(input("Insert the client's name (or press Enter to go back to Main menu): \n"))
    if name == None:
        return main_menu()
    ID = i_v.validate_user_int(input("Insert the clients ID: "))
    s_r.register_client(clients, name, ID)
    return menu_register_client()

def print_clients():
    global clients
    s_r.show_clients(clients)
    for client in clients:
        print(f"name: {client["Name"]}  |   ID: {client["ID"]}  |   Money_spent: {client["Money_spent"]}")
    i_v.wait()
    return main_menu()

main_menu() #Execute main menu
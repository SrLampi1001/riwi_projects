# Files using POO instead of functions, are made in the future ignoring the constraints of knowledge, they are only for testing Python functions and reforcing knowledge, they are not the most efficent/clean code.
# User cart, unique user
_USER_CART = [ ]

class product: # Product class 
    global _USER_CART
    def __init__(self, name:str, price:float, stock:int):
        self.name:str = name;
        self.price:str = price;
        self.stock:int = stock;
        self.CART_ID:bool|int = False
    
    def add_to_cart(self, amount:int) -> bool:
        if self.stock < amount or amount == 0:
            print(f"You can't buy that amount, you tried to buy {amount} and there are {self.stock} available")
            return False
        _USER_CART.append({"product_name":self.name,"amount": amount})
        if not self.CART_ID: 
            self.CART_ID = len(_USER_CART) - 1
        else:
            total_amount:int = _USER_CART[self.CART_ID].amount + amount
            if  total_amount > self.stock:
                print(f"You can't buy that much more, only {self.stock} available, you tried to buy {total_amount}")
                return False
            _USER_CART[self.CART_ID].amount += amount
        return True
    
    def remove_from_cart(self, amount:int|str) -> bool:
        if not self.CART_ID: return False # Return if doesn't exist in cart
        if amount > _USER_CART[self.CART_ID]["amount"]: 
            print("You are trying to delete more than you added to the cart")
            return False
        if amount == str and str == 'all':
            _USER_CART[self.CART_ID] = None # Assign none, since removing it will change the ID for all elements.
        else:
            print("Invalid amount inserted")
            return False
        return True

    def buy(self, amount:int) -> bool:
        self.stock -= amount
        return True

    def __str__(self)->str:
        return f"""
Produt Name — {self.name}
Product Price — {self.price} COP
Product in stock — {self.stock}
-----------------------------------
""";

def buyItemsFromCart()->bool:
    global _USER_CART
    if len(_USER_CART) == 0:
        print("You don't have anything to buy")
        return False

# Main menu
print(product("arepa", 122.44, 90))

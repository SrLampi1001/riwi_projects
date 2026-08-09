def validate_user_float(number):
    """
    Transforms string or int into float type, no negative values allowed
    If error, asks user's input until valid float is given
    If number is an empty string, returns None
    """
    if number == "":
        return None 
    try:
        number = float(number)
        if number < 0:
            print("No negative values are allowed, please insert a valid float value: ")
            return validate_user_float(input())
        return number
    except:
        print("The number given is not valid, please insert a valid float number: ")
        return validate_user_float(input())

def validate_user_int(number):
    """
    Transforms string or float into int type, no negative values allowed
    If error, asks user's input until valid int is given
    If number is an empty string, returns None
    """
    if number == "":
        return None 
    try:
        number = int(number)
        if number < 0:
            print("No negative values are allowed, please insert a valid int value: ")
            return validate_user_int(input())
        return number
    except:
        print("The number given is no valid, please insert a valid Int number: ")
        return validate_user_int(input())
    
def validate_user_string(string):
    """
    Validates if user string is not empy
    if it is, returns None
    """
    if string =="":
        return None
    return string

def validate_y_n(string):
    """
    Validates if the string is "y" or "n"
    if not, makes a callback of itself until allowed entry provided
    """
    string = string.lower()
    if string != "y" and string != "n":
        print("Please select (y/n): ")
        return validate_y_n(input())
    return string

def validate_date(string):
    """
    Validates the correct format for date
    (dd/mm/yy)
    """
    if string == "":
        print("Date can't be None, please insert a valid date (dd/mm/yy): ")
        return validate_date(input())
    splitted = string.split("/")
    if len(splitted) != 3:
        print("Invalid date, please insert a valid date (dd/mm/yy)")
        return validate_date(input())
    try:
        day = int(splitted[0])
        month = int(splitted[1])
        year = int(splitted[2])
        if day > 31 or day < 1:
            print("The day cannot be greater than 31 or less than 1")
            return validate_date(input())
        elif month > 12 or month < 1:
            print("The month can't be greater than 12 or less than 1")
            return validate_date(input())
        elif year < 1900:
            print("The year can't be less than 1900")
            return validate_date(input())
    except:
        print("At least one value of the date is not valid (not a number)")
        print("please insert a valid date (dd/mm/yy)")
        return validate_date(input())
    return string

def wait():
    """
    Waits for input user to continue with the main program
    does not return anything
    """
    input("Press Enter to return to main menu")
    return

#Module for validation for all types of user inputs
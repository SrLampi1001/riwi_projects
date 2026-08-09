import csv
import os
import re
class Equipment:
    __max_id:int = 0
    __equipment_path = os.path.normpath("csv_archives"+os.path.pathsep+"equipments.csv")
    __equipments = {}

    def __init__(self, id, name, category, actual_state, registration_date):
        self.name = name
        self.category = category
        self.actual_state = actual_state
        self.registration_date= registration_date
        self.id = id 

    @classmethod
    def create(cls, name, category, actual_state = "available", registration_date = None, id = None):
        date_pattern = re.compile(r"^(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[0-2])/\d{4}$")
        if id == None:
            id = cls.__max_id
        if name == "":
            print("El nombre no puede estar vacio")
            return None
        elif category == "":
            print("Debe ingresar una categoria")
            return None
        elif actual_state not in ["available", "borrowed", "damaged", "in-repair"]:
            print("The state is invalid, only available, borrowed, damaged, in-repair")
            return None
        elif registration_date != None and not re.match(date_pattern,registration_date):
            print("The registration date must be None or a string following the pattern: dd/mm/yyyy")
            return None
        else:
            cls.__max_id == id+1
            new_equipment = cls(id, name, category, actual_state, registration_date)
            cls.__equipments[new_equipment.id] = new_equipment
            return new_equipment
    
    @classmethod
    def create_directory(cls):
        """
        Creates the equipments.csv arhive and csv_archives if they don't exist
        returns True if created, else False 
        """
        if not os.path.exists(os.path.dirname(cls.__equipment_path)):
            dir  = os.path.dirname(cls.__equipment_path)
            try:
                os.mkdir(dir)
            except Exception as exp:
                print(f"An Exception has occured while trying to create the directory: {exp}")
                return False
        if os.path.exists(cls.__equipment_path):
            return True
        try:             
            with open(cls.__equipment_path, "w", newline="") as archive:
                writer = csv.writer(archive)
                writer.writerow(["id", "name", "category", "actual_state", "registration_date"])
        except Exception as ex:
            print(f"The csv couldn't be created, exception: {ex}")
            return False
        return True
    
    @classmethod
    def save_equipment(cls)->True:
        if not os.path.exists(cls.__equipment_path):
            if not cls.create_directory():
                print("The csv archive wasn't created, the equipment cannot be saved")
                return False
        try:
            with open(cls.__equipment_path, "w", newline="") as a:
                writer = csv.writer(a)
                writer.writerow(["id", "name", "category", "actual_state", "registration_date"])
                for equipment in cls.__equipments.values():
                    writer.writerow([equipment.id, equipment.name, equipment.category, equipment.actual_state, equipment.registration_date])
        except Exception as exp:
            print(f"An exception has ocurred while trying to save the equipment on the csv: {exp}")
            return False
        return True
    
    @classmethod
    def get_equipment_w_id(cls, id):
        if id in cls.__equipments:
            return cls.__equipments[id]
        print(f"No equipment with id {id}")
        return None
    
    @classmethod
    def load_equipment(cls)->bool:
        if not os.path.exists(cls.__equipment_path):
            print("There is no csv archive to load from")
            return False
        try:
            with open(cls.__equipment_path, "r", newline="") as a:
                reader = csv.reader(a)
                next(reader)
                for equipment in reader:
                    cls.create(equipment[1],equipment[2], equipment[3], equipment[4], equipment[0])
        except Exception as exp:
            print(f"There has been an Exception while trying to read the csv archive {exp}")
            return False
        return True

    def lend_equipment(self)->bool:
        """
        Changes the state of the Equipment object to "borrowed" and returns True
        If the state is diferent than "available", return False
        """
        if self.actual_state == "available":
            self.actual_state = "borrowed"
            return True
        else:
            print(f"The equipment can't be lend, since is {self.actual_state}")
            return False
        
    def return_equipment(self, state)->bool:
        """
        Receives the equipment state
        Returns True if the return is succesfull
        else returns False
        """
        if self.actual_state == "borrowed":
            self.actual_state = state
            if state == "damaged":
                return True
            else:
                self.user_in_posesion = None
                return True
        return False
    
    def get_equipment(self):
        """
        Returns the object attributes inside a list
        the order is [id, name, category, actual_state, registration_date]
        """
        return [self.id, self.name, self.category, self.actual_state, self.registration_date]
    

    def repair_equipment(self, date_return):
        pass

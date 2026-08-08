import csv
import os
import re
from usuarios import User; from equipos import Equipment;
class Borrow:
    __max_id = 0
    __borrow_record = {}
    __borrow_requests = {}
    __borrow_path = os.path.normpath("csv_archives"+os.path.pathsep+"borrows.csv")
    equipment : Equipment
    user : User

    #prestamo_id, equipo_id, nombre_equipo, usuario_prestatario, tipo_usuario, fechas, días, retraso, estado, mes, anio
    def __init__(self, id, equipment_id, equipment_name, borrowing_username, user_type, state, petition_date, aproved_date, returned_date):
        self.id = id
        self.equipment_id = equipment_id
        self.equipment_name = equipment_name
        self.borrowing_username = borrowing_username
        self.user_type = user_type
        self.state = state
        self.petition_date = petition_date
        self.aproved_date = aproved_date
        self.returned_date = returned_date

    @classmethod
    def create(cls, equipment_id, equipment_name, borrowing_username, user_type, state, petition_date, aproved_date = None, returned_date = None, id = None):
        date_pattern = re.compile(r"^(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[0-2])/\d{4}$")
        if id == None:
            id = cls.__max_id
        if state not in ["pending", "going", "done"]:
            print("The state for a borrow given is not valid, only \"pending\", \"going\" and \"done\"")
            return None
        elif user_type not in ["student", "Instructor", "administrator"]:
            print(f"The user type given ({user_type}) is not valid")
            return None
        elif petition_date != None or not re.match(date_pattern, petition_date):
            print("The petition date format is inválid: format must be dd/mm/yyyy (all integer numbers)")
            return None
        elif aproved_date != None or not re.match(date_pattern, aproved_date):
            print("The aproved date format is inválid: format must be dd/mm/yyyy (all integer numbers)")
            return None
        elif returned_date != None or not re.match(date_pattern, returned_date):
            print("The returned date format is inválid: format must be dd/mm/yyyy (all integer numbers)")
            return None        
        cls.__max_id = id+1

        new_borrow = cls(id, equipment_name, borrowing_username, user_type, state, petition_date, aproved_date, returned_date, id)
        if returned_date != None:            
            cls.__borrow_record[id] = new_borrow
            return new_borrow   #Do not create attributes equipment and user on borrow
        
        equipment = Equipment.get_equipment_w_id(equipment_id)
        user = User.get_user_w_username(borrowing_username)
        
        if equipment == None or user == None:
            print("the equipment id does not exists")
            return None #Since the equipment and user_id don't exist, it means the values given are false for the program, ergo, return none
        
        new_borrow.equipment = equipment
        new_borrow.user = user

        if new_borrow.aproved_date == None:
            cls.__borrow_requests[id] = new_borrow
            return new_borrow
        
        cls.__borrow_record[id] = new_borrow
        return new_borrow

    @classmethod
    def save_borrows(cls)->bool:
        if not cls.create_borrow_csv():
            print("Can not save the borrows")
            return False
        try:
            with open(cls.__borrow_path, "w", newline="") as arch:
                writer = csv.writer(arch)
                writer.writerow(["id", "equipment_id", "equipment_name", "borrowing_username", "user_type", "state", "petition_date", "aproved_date", "returned_date"])
                for borrow in cls.__borrow_record.values():
                    writer.writerow([borrow.id, borrow.equipment_id, borrow.equipment_name, borrow.borrowing_username, borrow.user_type, borrow.state, borrow.petition_date, borrow.aproved_date, borrow.returned_date])
        except Exception as exp:
            print(f"An exception has ocurred while trying to save the borrows: {exp}")
            return False
        return True
    
    @classmethod
    def create_directory(cls)->bool:
        if not os.path.exists(os.path.dirname(cls.__borrow_path)):
            try:
                dir = os.path.dirname(cls.__borrow_path)
                os.mkdir(dir)
            except Exception as exp:
                print(f"An exception has occured trying to create de directory: {exp}")
                return False
        if not os.path.exists(cls.__borrow_path):
            try:
                with open(cls.__borrow_path, "w", newline="") as archive:
                    writer = csv.writer(archive)
                    writer.writerow(["id", "equipment_id", "equipment_name", "borrowing_username", "user_type", "state", "petition_date", "aproved_date", "returned_date"])
            except Exception as exp:
                print(f"An exception has occured while trying to create the csv element: {exp}")
                return False
        return True

    @classmethod
    def load_borrows(cls)->bool:
        if not os.path.exists(cls.__borrow_path):
            print("There is no archive to upload")
            return False
        try:
            with open(cls.__borrow_path, "r", newline="") as a:
                reader = csv.reader(a)
                next(reader)
                for borrow in reader:
                    cls.create(borrow[1], borrow[2], borrow[3], borrow[4],  borrow[5],  borrow[6],  borrow[7],  borrow[8],  borrow[0])
        except Exception as exp:
            print(f"There has been an Exception while trying to read the csv archive: {exp}")
            return False
        return True
    @classmethod
    def get_all_borrows(cls):
        return cls.__borrow_record
    @classmethod
    def get_pending_borrows(cls):
        return cls.__borrow_requests
    @classmethod
    def get_active_borrows(cls):
        active = {}
        for borrow_id, borrow in cls.__borrow_record.items():
            if borrow.returned_date == None:
                active[borrow_id] = borrow
        return active
    @classmethod
    def get_borrow_w_id(cls, id):
        if id not in cls.__borrow_record:
            return None
        return cls.__borrow_record[id]
    
    def calculateBorrowedTime(self):
        date = self.aproved_date.split("/");
        date[0] = int(date[0]); date[1] = int(date[1]); date[2] = int(date[2]); #Convert to INT all dates
        returned_date = self.returned_date.split("/")
        returned_date[0] = int(returned_date[0]); returned_date[1] = int(returned_date[1]); returned_date[2] = int(returned_date[2]); #Convert to INT all dates
    
    def aprove(self, time)->bool:
        if self.state != "pending":
            print(f"imposible to aprove, as the borrow state is {self.state}")
            return False
        self.state = "going"
        self.aproved_date = time
        del Borrow.__borrow_requests[self.id]
        Borrow.__borrow_record[self.id] = self

    def delete_request(self):
        pass
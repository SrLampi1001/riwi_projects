# Program in progress  

The program will use POO to create a enviroment for a simulated system of borrowing in a Tech Company, in a very simplistic way.  
The interfaz for admin will allow to navegate all of the users and see all the borrowed equipment, the program works with time. (Time can be accelerated and stopped but no returned)  
Exist 3 types of user (excluding admin): administrarive, student and instructor. This user type can't access to the other user's information, but can see all the avaible equipment, borrow it and return it, the student can borrow for 3 days, the instructor for 7 days and administrative for 10 days.  
The admin user can allow for request to borrow equipment, solicite repairment and accept returning.  
The admin can create reports on the month and year  

## How to use the program (expectatives)  

It can only be used on console, and a simulator, so only one user on a computer will be connected to the program.  
The program will ask for a time to start, inside, insert a date and time, this will allow the program to have a start point (start point is stored outside memory, the archive type is not decided yet).  
The user MUST create a admin user account first, if it doesn't exist already (The respective csv archives with the accounts, including the admin one, should be in this repository when it's finished, along with the passwords without encriptation)  
As an admin, if no equipment on the csv archives, needs to create the equipment  
The admin CANNOT borrow equipment, to borrow, the user must log out and create a new account, be it in role student, instructor or administrative, when created, a new menu should appear, in which borrow request can be made.  
If a borrow request is made, the user need's to log out and access in the admin account, select the option to see pending request, select the request you want and decide if accept it or don't  
When loggin in an account, if the user does not insert the correct password in 3 oportunities, the program will close  

## Implementations at future vs current state  

- Only one admin user can exists on the program, the verifications for this are not implemented yet.  
- The user and equipment classes are used inside each one, to mark the reference from the user in posesion of the equipment and viceversa (Realistically, only one is necesary, and is going to simplify the process for csv saving)  
- For the csv storing is necesary to use ID, it's only obligatory for the equipment to have an ID, the user class either has ID or unique user name (Probably unique user name is going to make easer manage the logins)  
- The time is planned to be inserted manually on the console menu when making a borrow, instead, should create a time enviroment variable and set timeout and promises to solve at the adecuate time  
- If the time is to be inside the program, since the program can not be running on background, there should be a first input inside a program that sets the start execution time, and based on that, should make the pertaining calcules for the late returning and pending aprovations  
- If the function for repairing is created, it should be a simple request with a set timeout until the equipment is to be available again.  
- Currently the program does not await for aprovation via the admin user, it needs to be done, the information of the pending aprovations for borrowing should be saved on the csv archives pertaining the users (new state for pending), there's the need to create inside the main a function to initialize and create the objects with the data on the csv  
 
### Day 2 plan implementations:  
- Create class Borrow, user can create a borrow object and pass on the atribute itself and the equipment borrowing
- Equipment MUST be an independent class, it should not store the user that borrowed an Equipment iteration, as it would be the first to be charged from the csv
- To initialize an alredy with information program, is necesary to first charge equipment, then users and finally borrows.
- The program time must be initialized manually if not csv archives present, if not, then use the latest date and time present on borrow csv archives. 
- The program must initialize the objects on start and store them inside Memory on the main.  

### Day 3 plan implementations:  
- Borrow class must have states: "Pending", "going", "done"  
    - Each state has his own particularities, the done ones are only for storing purporse and need no to be charged on memory from the csv archive  
    - The pending state must exist in a separated list only visible to administrator, they are to be approved or rejected, rejected is not a state, it only deletes the borrow object from both the csv and program, does not need to leave a record, as it does not affect the monthly or yearly report  
    - The going state should always be charged on memory and be present for the users that made the borrow, it should let them change the state to done when returning the equipment  
- Equipments and users should be able to be deleted, cannot be deleted if they are being borrowed or borrowed something and still has not returned it.
- Equipments deleted should not pose a problem for the csv charge of borrow objects, deleted equipment does not exist within the program, only on the csv borrow in state done  

### Day 4 plan implementations:  
- Separated time and reports inside reportes.py, modularrizing the functionalities for simulated time and reports  
- Reports class make use of iterations. the iterations:  
    - Report object is a short lived object in the program, the methods inside are for showing the amount of equipment borrowed, returned and pending in a given amount of time
    - Each method should return an CSV file with the pertaining information
    - The minimum iformation required on a report: organizing by equipment, it should show 
        - The amount of users that borrowed said equipment on the time frame given (Usefull for identifying the most used category of equipment), the amount of time used, and both the delay between the time of petition and aproved and aproved and returning
        - The amount of times the equipment was damaged (and by whom) in the time frame given (Usefull for identifyng potential equipment issues or problematic users)
    - attributes on the report object should be, "List most used equipment", "List Most used equipment category", "List Most demanding user", "List Most damaged equipment", "List most delayed to approve", "List most delayed to return", "List Users with most delayment". This attributes should be enough for fullfiling the minimun information
    - A report can only live within the program, a report can export csv archives, but those are not to be received again by the program when re launched. 
    - A specific folder exists for the csv archives to be exported
    - A naming convention for the reports will be used: reports can have timeframes : 3 days, 7 days, 10 days, 1 month, 3 months, 6 months, 1 year, 5 years. The normal calcule for the starting date is from the actual date - time frame selected, but a different starting date can be selected.  
    - Additionally, those reports must be only available for the admin user, any other type of user should be able to acces the reports:
        - Equipment borrowed on a given timeframe
        - Borrowing request pending for authotization
        - Borrows going (Resalt delayed ones)
        - Borrows returned on a given timeframe
        - Equipment damaged  

- Time will be changed from a class with static methods, to a unique object to insert it's reference inside the objects that need a time to calculate things (Like user)
- to the admin user, there will be available an option to change the flow of time (accelerating it up or slowing it down), also stopping it.  
- It SHOULD BE possible for the users (no admin) to see all available equipment and no-available equipment, and make borrow request to both of them, the admin then should obly be capable of aproving the available equipment ones, and wait for the unavailable equipment to be returned to accept.
- users should be able to cancel a borrow request  

### day 5 plan implementations:  
- All the methods related with search shoul return Bool values, this will be for the main process to receive and process, deciding the flux of the program based on the return values.
- Implementing the functions for organizing and catgorizing the diferent borrows, the results right now are inneficient and imposible to scalate to larger amounts. 
- The application is not fit to scalating to a real project, too many n^2 and n^3 loops

# Assessment Test 1 simulacrum

> Python CLI program with simulated time using asyncio for a equipment borrowing system.

## Requirements

- 4 types of users: Admin, Administrative, Instructor and Student
  - **Admin**: Can't borrow equipment. In charge of creating new equipment and accepting/rejecting borrowing requests.
  - **Administrative**, **Instructor** and **Student**: Can borrow equipment with different time limits:
    - Student: 3 days maximum borrow time
    - Instructor: 7 days maximum borrow time
    - Administrative: 10 days maximum borrow time

## How to use

1. **Initial Setup**: Locate the `usuarios.csv` file in the project directory. This file contains the user credentials. On first run, create an admin account using the registration option.

2. **Starting as Admin**: Log in with the admin credentials to access the admin menu. From here you can:
   - Create new equipment entries
   - View and manage borrowing requests (approve/reject)
   - Accept equipment returns
   - Generate reports

3. **Creating Other Users**: Log out from admin and register new accounts with roles (Administrative, Instructor, or Student).

4. **Borrowing Equipment**: Log in as a non-admin user to:
   - View available and unavailable equipment
   - Submit borrowing requests
   - Return equipment when done

5. **Approving Borrows**: Log back into the admin account to view pending requests and approve or reject them.

6. **Password Attempts**: If the wrong password is entered 3 times consecutively, the program will close.

### Owner
Santiago Sanchez Ruiz

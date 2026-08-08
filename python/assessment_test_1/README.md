# Application Register for Library
This is a console application. It does NOT have a database or any type of memory persistence. It starts with 5 registered products in the inventory variable and allows the user to add more.

## Functions
### Add Product
-> Asks the user for title (required), author (optional), amount in stock (optional), and price (optional). Adds the book to memory.
### Delete Product
-> Asks the user for title (required) and deletes the book with that title from memory.
### Update Product
-> Asks the user for title (required), then asks if they want to update only the stock or make a general update. If stock is selected, only asks for a number to add to the current stock. If general is selected, allows the user to enter new_title (optional), new_price (optional), new_author (optional), and new_stock (optional). The fields with valid data provided are updated in memory.
### Search Product
-> Asks the user for a title (optional). If a title is provided, shows the book with a matching title. If no title is provided, prints all books in memory to the console.
### Sell Product
-> Asks the user for the title of the book to sell. If nothing is provided, does nothing. Then asks for the amount to sell, which can be 0 but not negative. Also asks for the client's name (optional). If provided and the client does not exist, asks if the user wishes to create a new client with that name. If not, it does an anonymous sell or asks for a valid name. Finally, asks for the date, which must be in the dd/mm/yy format. It also shows the amount the client has spent at the library and asks if the user wishes to make a discount of up to 80%.
### Show 3 Best Sellers
-> Simply prints the 3 most sold books in the program. If no sales have been made, it says so and returns to the main menu.
### Generate Sales Report
-> Simply prints a sales report ordered by author. The same book name may appear multiple times if it has been sold more than once.
### Calculate Profit and Gross Profit
-> Prints the profit made by the sales and the profit if no discounts had been applied.
### Show All Sales
-> Simply prints all sales. A sale contains the book, the author of the book (in case the book is deleted from the inventory, the author is kept in the sales list to avoid errors when trying to access a deleted book from inventory when creating a sales report. Instead, all relevant information for a sale report is stored in the sales list), the client to whom it was sold, the amount sold of said book, the discount applied to the sale, the total with the discount, and the total without the discount.
### Register a New Client
-> Asks the user for the client's name and ID, which MUST be an integer. It can be 0 but not negative. It CAN have a repeated ID from another user. There is no validation with user's ID. The clients are stored in the clients list in the program.
### Show Clients
-> Prints all clients, including name, ID, and amount of money spent.
### Exit
-> Allows the user to exit the program.

## Observations
There may be grammatical errors in the program. Also, it is impossible (unless the terminal process is interrupted by the user) to exit the program without using the menu option. There are no errors that interrupt the program execution. When selecting a print option from the menu, after the printing, it does not show the main menu again until the user presses Enter (anything the user may insert before pressing Enter will not have an effect).
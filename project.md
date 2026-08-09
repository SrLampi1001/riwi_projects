# Project Implementation Plan

## Day 2 - Core Structure Refactor

### Borrow Class
- Create a `Borrow` class where users can pass themselves and the equipment they want to borrow as attributes.

### Equipment Class Independence
- `Equipment` must be an independent class with no reference to the user borrowing it. This simplifies CSV storage and avoids circular dependencies.

### Initialization Order
- When loading an existing program state from CSV files, load in this order:
  1. Equipment (first, since borrows reference equipment)
  2. Users
  3. Borrows

### Program Time Initialization
- If no CSV files exist, prompt the user to manually set the start time.
- If CSV files exist, use the latest date/time from the borrow records as the start point.

### Object Lifecycle
- All objects (equipment, users, borrows) must be initialized at program start and held in memory within the main module.

---

## Day 3 - Borrow States & Data Management

### Borrow States
The `Borrow` class must have three states:

| State | Description | Visibility | Storage |
|-------|-------------|------------|---------|
| **Pending** | Awaiting admin approval | Admin only (to approve/reject); User can see their own pending | Stored in memory and CSV |
| **Going** | Approved and currently borrowed | Admin sees all; User sees only their own | Stored in memory and CSV |
| **Done** | Equipment returned (completed cycle) | Admin only (for reports) | CSV only, not in memory |
| **Cancelled** | User cancelled before approval | Admin only (for reports) | Stored in memory and CSV |

### Rejection Logic
- Rejecting a borrow does not store a "Rejected" state. Instead, the borrow object is simply deleted from both memory and CSV. It leaves no record since it doesn't affect reports.

### Equipment Deletion
- Equipment can be deleted, but only if:
  - It is not currently borrowed (Going state)
  - No user has it reserved
- Deleted equipment remains in the program but is flagged as "deleted" or "inexistent" so it cannot be borrowed.
- Deleted equipment still appears in reports to maintain historical data.
- Borrow records (Done or Cancelled) referencing deleted equipment must remain valid.

### User Deletion
- Users cannot be deleted if they have any borrows in Pending or Going states.

---

## Day 4 - Reports & Time Simulation

### Reports Module (`reportes.py`)
- Move all time-related and report functionalities to a separate `reportes.py` module for modularization.

### Time Object
- Transform the time system from static methods into a single `Time` object instance.
- This object is passed by reference to other objects (like `User`) that need to perform time-based calculations.

### Admin Time Controls
- The admin can manipulate the simulated time:
  - **Accelerate**: Move time forward faster than real time
  - **Slow down**: Move time slower than real time
  - **Stop**: Pause the simulated time

### Report Object Behavior
- Reports are short-lived objects created on-demand to generate statistics.
- Reports can export to CSV files but these files are **not** re-imported when the program restarts.
- A dedicated folder exists for exported report CSV files.

### Report Naming Convention
Reports can cover these timeframes:
- 3 days, 7 days, 10 days, 1 month, 3 months, 6 months, 1 year, 5 years

Default calculation: start date = current date - selected timeframe. A custom start date can also be chosen.

### Report Content - Admin View
The report object must provide:

| Attribute | Description |
|-----------|-------------|
| Most used equipment | Equipment with highest borrow count |
| Most used equipment category | Category with highest borrow count |
| Most demanding user | User with most borrows |
| Most damaged equipment | Equipment with most damage records |
| Most delayed to approve | Borrows with longest pending time before approval |
| Most delayed to return | Borrows returned after their due date |
| Users with most delays | Users who frequently return late |

Minimum report information per equipment:
- Number of users who borrowed it (helps identify popular categories)
- Total time borrowed
- Delay between request and approval
- Delay between approval and return
- Number of times damaged and by whom

### Report Content - Non-Admin (User) View
Users can access reports only for **their own** borrows:
- Equipment borrowed on a given timeframe
- Their pending requests awaiting approval
- Their currently borrowed equipment (Going, with delayed ones highlighted)
- Equipment returned on a given timeframe

### Reservation System
- Users can request to borrow equipment that is currently unavailable (borrowed by someone else).
- This creates a **reservation**: the user queues for the equipment.
- Only **one** reservation queue per equipment is allowed (first-come, first-served).
- The queue must have a defined limit to prevent abuse.
- Once equipment becomes available (returned and not damaged), it automatically goes to the first user in the reservation queue.
- Reserved equipment cannot be borrowed by other users.
- Users can cancel their own reservations.

### New Borrow States (Expanded)
| State | Description |
|-------|-------------|
| **Pending** | Awaiting admin approval |
| **Reserved** | Queued for unavailable equipment |
| **Going** | Approved and currently borrowed |
| **Done** | Equipment returned (completed) |
| **Cancelled** | User cancelled before approval |

---

## Day 5 - Code Quality & Architecture

### Search Method Returns
- All search-related methods must return `bool` values.
- This allows the main process to evaluate return values and make decisions based on success/failure, controlling the program flow more predictably.

### Data Organization
- Current implementation uses inefficient loops (O(n²) and O(n³)) that won't scale.
- Implement proper data structures and algorithms for organizing and categorizing borrows.
- Consider using dictionaries, sets, or other appropriate structures to replace nested iterations.

### Scalability
- The current application architecture is not suitable for scaling to a real project.
- Refactor to support larger datasets and more users without performance degradation.

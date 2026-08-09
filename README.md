# Grades management Workshop
Riwi Assignment. 
Workshop to test the use of functions, loops and conditionals. 

## Requirements

- The system must accept N number of grades
- Show the average at the end, flag if the user grades are excelent, good or doesn't aprove

### Observations
The system validation: 
```python
    validation = False if nota not in [x*0.1 for x in range(1,51)] else True 
```
Has floating point aproximation errors, and doesn't accept grades such as 2.3, 2.5, 3.3, etc.

## Owner
Santiago Sanchez Ruiz
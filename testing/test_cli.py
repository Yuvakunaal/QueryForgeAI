from db_connection import conn, curr
from ollama_model import ollama_call
from mysql_handling import get_tables, get_schema, get_full_table, get_query_based_table
from pprint import pprint

def available_tables():
    tables = get_tables()
    tables_list = [table[0] for table in tables]
    return tables_list

def print_table_schema(table):
    schema = get_schema(table)
    for col in schema:
        print(col)

def chat():
    while True:
        print("-"*40)
        choices = {1 : "View Table", 2 : "View Schema", 3 : "View Table Data", 4 : "Run Query", 5 : "NL to SQL",6 : "Exit"}
        pprint(choices,indent=2)
        choice = input("What's your choice : ").strip()
        if choice.isdigit():
            choice = int(choice)
            print(f"\nChoosed : {choices[choice]}\n")
        else:
            choice = 0
        
        if choice == 1:
            tables = available_tables()
            print(f"Available Tables :-\n{tables}")
            
        elif choice == 2:
            tables = get_tables()
            tables_list = [table[0] for table in tables]
            print(f"Available Tables :-\n{tables_list}")
            while True:
                table = input("Choose a table : ").strip()
                if table not in tables_list:
                    print("Invalid Table, Choose again...")
                else:
                    break
            
            print_table_schema(table)
                
        elif choice == 3:
            tables = get_tables()
            tables_list = [table[0] for table in tables]
            print(f"Available Tables :-\n{tables_list}")
            
            table = input("Choose a table : ").strip()
            rows, cols = get_full_table(table)
            print("Table Data :-")
            print(cols)
            for row in rows:
                print(row)
                
        elif choice == 4:
            print(f"Available Tables :-\n{available_tables()}")
            while True:
                table = input("Choose a table to view schema or type 'exit' : ").strip()
                if table == "exit":
                    break
                elif table not in tables_list:
                    print("Invalid Table, Choose again...")
                else:
                    print_table_schema(table)
            
            query = input("Enter Query : ").strip()
            rows, cols = get_query_based_table(query)
            
            print("Table Data :-")
            print(cols)
            for row in rows:
                print(row)
        
        elif choice == 5:
            
            tables = get_tables()
            tables_list = [table[0] for table in tables]
            print(f"Available Tables :-\n{tables_list}")
            
            while True:
                table = input("Choose a table to view schema: ").strip()
                if table in tables_list:
                    print_table_schema(table)
                    break
                else:
                    print("Invalid Table, Choose again...")

            schema = get_schema(table)
            
            nl_input = input("Enter NL Query : ").strip()
            result = ollama_call(nl_input, table, schema)
            print(result)
            
            rows, cols = get_query_based_table(result)
            
            print("Table Data :-")
            print(cols)
            for row in rows:
                print(row)
            
        elif choice == 6:
            print("Exiting...")
            break
        
        else:
            print("Invalid Choice or wrong typed, Choose again...")

if __name__ == "__main__":
    chat()
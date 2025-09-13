from db_connection import conn, curr

def get_tables():
    curr.execute("SHOW TABLES")
    tables = curr.fetchall()
    return tables

def get_schema(table):
    curr.execute(f"DESCRIBE {table}")
    cols = curr.fetchall()
    return cols
        
def get_full_table(table):
    curr.execute(f"SELECT * FROM {table}")
    columns = curr.column_names
    rows = curr.fetchall()
    return rows, columns

def get_query_based_table(query):
    curr.execute(f"{query}")
    columns = curr.column_names
    rows = curr.fetchall()
    return rows, columns
    
# print_query_based_table("customers", "SELECT * FROM customers")
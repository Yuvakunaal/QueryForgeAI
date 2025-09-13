from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import mysql.connector
from ollama_model import ollama_call
from typing import Optional
import os

app = FastAPI(title="NL To SQL API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/templates", StaticFiles(directory="templates"), name="templates")

class DBSettings(BaseModel):
    host: str = "localhost"
    user: str = "root"
    password: str = ""
    database: str = ""

class NLQuery(BaseModel):
    nl_input: str
    table: str
    host: str = "localhost"
    user: str = "root"
    password: str = ""
    database: str = ""

class SQLQuery(BaseModel):
    query: str
    host: str = "localhost"
    user: str = "root"
    password: str = ""
    database: str = ""

class SchemaRequest(BaseModel):
    host: str = "localhost"
    user: str = "root"
    password: str = ""
    database: str = ""

class TableRequest(BaseModel):
    host: str = "localhost"
    user: str = "root"
    password: str = ""
    database: str = ""
    
class ExplainRequest(BaseModel):
    query: str
    nl_input: Optional[str] = None
    host: str = "localhost"
    user: str = "root"
    password: str = ""
    database: str = ""

# Helper function to create database connection
def create_connection(host, user, password, database):
    return mysql.connector.connect(
        host=host,
        user=user,
        password=password,
        database=database
    )

# Helper functions that use dynamic connection
def get_tables(conn):
    curr = conn.cursor()
    curr.execute("SHOW TABLES")
    tables = curr.fetchall()
    curr.close()
    return tables

def get_schema(conn, table):
    curr = conn.cursor()
    curr.execute(f"DESCRIBE {table}")
    cols = curr.fetchall()
    curr.close()
    return cols

def get_full_table(conn, table):
    curr = conn.cursor()
    curr.execute(f"SELECT * FROM {table}")
    columns = curr.column_names
    rows = curr.fetchall()
    curr.close()
    return rows, columns

def get_query_based_table(conn, query):
    curr = conn.cursor()
    curr.execute(f"{query}")
    columns = curr.column_names
    rows = curr.fetchall()
    curr.close()
    return rows, columns

@app.get("/")
async def serve_frontend():
    return FileResponse("templates/index.html")

@app.get("/about")
async def serve_about():
    return FileResponse("templates/about.html")

@app.post("/api/check-connection")
async def check_connection(settings: DBSettings):
    try:
        test_conn = create_connection(settings.host, settings.user, settings.password, settings.database)
        test_conn.close()
        return {"status": "success", "message": "Connection successful"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Connection failed: {str(e)}")

@app.post("/api/tables")
async def get_available_tables(settings: DBSettings):
    try:
        conn = create_connection(settings.host, settings.user, settings.password, settings.database)
        tables = get_tables(conn)
        tables_list = [table[0] for table in tables]
        conn.close()
        return {"tables": tables_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching tables: {str(e)}")

@app.post("/api/schema/{table}")
async def get_table_schema(table: str, request: SchemaRequest):
    try:
        conn = create_connection(request.host, request.user, request.password, request.database)
        schema = get_schema(conn, table)
        conn.close()
        return {"schema": schema}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching schema: {str(e)}")

@app.post("/api/table/{table}")
async def get_table_data(table: str, request: TableRequest):
    try:
        conn = create_connection(request.host, request.user, request.password, request.database)
        rows, cols = get_full_table(conn, table)
        conn.close()
        return {"columns": cols, "rows": rows}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching table data: {str(e)}")

@app.post("/api/run-query")
async def run_query(request: SQLQuery):
    try:
        conn = create_connection(request.host, request.user, request.password, request.database)
        rows, cols = get_query_based_table(conn, request.query)
        conn.close()
        return {"columns": cols, "rows": rows}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error running query: {str(e)}")

@app.post("/api/nl-to-sql")
async def nl_to_sql(request: NLQuery):
    try:
        conn = create_connection(request.host, request.user, request.password, request.database)
        schema = get_schema(conn, request.table)
        result = ollama_call(request.nl_input, request.table, schema)
        
        rows, cols = get_query_based_table(conn, result)
        conn.close()
        
        return {
            "generated_sql": result,
            "columns": cols,
            "rows": rows
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing NL Query: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
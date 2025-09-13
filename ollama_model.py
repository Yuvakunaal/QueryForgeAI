import ollama

def ollama_call(nl_input, table, schema):
    prompt = f"""
You are an expert SQL generator. Based on the database schema and table structure provided, convert the natural language query into a correct SQL statement.

Natural Language Query:
{nl_input}

Schema:
{schema}

Table:
{table}

Important Instructions:
1. Write only the SQL query.
2. Do not include explanations, notes, or formatting.
3. Ensure the query is syntactically correct and applicable to the given schema.
4. Handle **dates intelligently**:
    - If a month/year is mentioned (e.g., "January 2025"), select the **whole month**.
    - If a year is mentioned, select the **whole year**.
    - If a specific day is mentioned, select that exact date.
    - If relative dates are mentioned (e.g., "last 7 days"), use `CURRENT_DATE()` and intervals.
5. Handle **aggregations**: `SUM`, `AVG`, `MAX`, `MIN`, `COUNT` as requested.
6. Handle **filters**: `WHERE`, `IN`, `LIKE`, `IS NULL`, `IS NOT NULL`.
7. Handle **grouping and ordering**: `GROUP BY`, `ORDER BY`.
8. Handle **limits**: `LIMIT`, `TOP`.
9. Handle **text searches** properly, respecting case-insensitive matching.
10. Ensure the query is **safe**: avoid impossible conditions or logic errors (like `WHERE x < MIN(x)`).
11. Always validate column names with the schema provided.
12. Do not insert semicolons in the middle of the query (only at the end, even if you didnt keep semicolon - no worries).
13. Write only one valid SQL statement per query.

SQL Query:
"""

    try:
        response = ollama.chat(model='mistral:instruct', messages=[
            {
                'role': 'user',
                'content': prompt
            }
        ])
        
        return response['message']['content']
        
    except Exception as e:
        return "Error: " + str(e)
    
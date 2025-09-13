# SQL Playground with NL to SQL Converter
![AI-Powered](https://img.shields.io/badge/AI-Powered-blue?style=for-the-badge&logo=ai) ![FastAPI](https://img.shields.io/badge/FastAPI-0.68.0-green?style=for-the-badge&logo=fastapi) ![Ollama](https://img.shields.io/badge/Ollama-Mistral-informational?style=for-the-badge)


SQL Playground is a powerful web application designed to help users, developers, and analysts interact with MySQL databases using natural language queries. It makes SQL accessible to non-technical users while providing advanced features for developers by leveraging AI-powered NL to SQL conversion with the Mistral model.

## 🚀 Features

- 📂 **Database Explorer**: Browse and explore all tables in your MySQL database with ease
- 📊 **Schema Inspector**: Examine detailed schema information for each table
- 🔍 **Data Preview**: View actual table data in a scrollable grid format
- 🖥 **Query Runner**: Write and execute custom SQL queries using an integrated editor
- 🤖 **AI-Powered NL to SQL**: Convert natural language questions into accurate SQL queries using the Mistral model via Ollama
- ⚙ **Connection Management**: Configure and manage database connections seamlessly
- 📅 **Intelligent Date Handling**: Automatically handle date ranges, months, and years in queries
- 📱 **Responsive Design**: Use the application smoothly on both desktop and mobile devices

## 🛠️ Technology Stack

- **Backend**: FastAPI (Python)
- **AI Processing**: Ollama with Mistral model
- **Database**: MySQL
- **Frontend**: HTML5, CSS3, JavaScript
- **Deployment**: Uvicorn ASGI server

## 🛠️ How to Use

Follow these steps to set up and run SQL Playground:

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Yuvakunaal/QueryForgeAI.git
   cd QueryForgeAI
   ```

2. **Install Python Dependencies**
   ```bash
   pip install fastapi uvicorn mysql-connector-python ollama pydantic
   ```

3. **Download Ollama**

   - Visit the [Ollama website](https://ollama.ai) and download the application.
   - Open your terminal and run:
     ```bash
     ollama pull mistral:instruct
     ```
   - The Ollama model is now downloaded on your system.

4. **Run the Application**

   ```bash
   uvicorn app:app --reload
   ```
   - Optionally : Test via running those testing folder files, to work with CLI

5. **Open Browser** : Navigate to http://127.0.0.1:8000/
6. Start using SQL Playground to query your database with natural language!

## 🎯 How It Works

- **Connect to Database**: Enter your MySQL credentials in the settings
- **Browse Data**: Explore tables and view their schemas and records
- **Write Queries**: Create and run custom SQL queries in the editor
- **Ask Questions**: Type your queries in natural language
- **Get Results**: AI converts your questions into SQL and fetches results instantly

## 🔮 Usage Example

Ask questions like:

- "Show all customers from California ordered by last name"
- "Find products priced above $100 in electronics"
- "Display total sales by month for 2024"
- "List customers with purchases in the last 30 days"

The application will generate SQL queries such as:

```sql
SELECT * FROM customers WHERE state = 'California' ORDER BY last_name;

SELECT * FROM products WHERE price > 100 AND category = 'electronics';

SELECT MONTH(sale_date) AS month, SUM(amount) AS total_sales 
FROM sales WHERE YEAR(sale_date) = 2024 GROUP BY MONTH(sale_date);

SELECT DISTINCT customers.* FROM customers 
JOIN orders ON customers.id = orders.customer_id 
WHERE orders.order_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY);
```

## 🌟 Advanced Features

- 🤖 **NL to SQL Conversion**: AI understands user intent and generates SQL accordingly
- 📚 **Context Awareness**: Helps users build accurate queries by suggesting table names and fields
- 📈 **Scalable Architecture**: Designed for enterprise-grade applications
- 📱 **Cross-Device Support**: Fully responsive interface across desktops and smartphones

## 👨‍💻 Developer

**Kunaal** – GenAI, AI, Python Enthusiast

## 🙏 Acknowledgments

- Ollama for enabling local AI model integration
- FastAPI for providing a high-performance backend framework
- The open-source community for the libraries and tools used

> ⭐ If you like this project, please support by starring the repository!

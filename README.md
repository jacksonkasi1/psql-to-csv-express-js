# PostgreSQL to CSV Exporter

This is a simple Express.js application that allows you to export PostgreSQL database tables to CSV files. You can also retrieve the list of available tables in the database.

## Prerequisites

- Node.js (>=12.0.0)
- PostgreSQL database

## Installation

1. Clone this repository:

```bash
git clone https://github.com/jacksonkasi1/psql-to-csv-express.git
cd psql-to-csv-express
```

1. Install the dependencies:

```bash
npm install
```

1. Set Up Environment Variables

Create a .env file in the root directory and add your PostgreSQL connection URL:


```
DB_CONNECTION_URL=your_connection_url_here
PORT=5001 # Optional, specify the desired port
```
Replace your_connection_url_here with your actual PostgreSQL connection URL.

## Usage

1. Start the server:
```bash
npm start
```

Access the following endpoints using your web browser or a tool like Postman:

To export a table as CSV:
    - GET `/download-CSV?tbl_name=your_table_name&header_only=true&limit=100`

EX:
```
http://localhost:5001/download-CSV?tbl_name=your_table_name&header_only=true&limit=100
```

To get a list of all available tables:
    - GET `/get-table-list`

EX:
```
http://localhost:5001/get-table-list
```

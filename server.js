const express = require("express");
const app = express();
require("dotenv").config();

const { Client } = require("pg");
const url = require("url");
const csv = require("fast-csv");

const PORT = process.env.PORT || 5001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Connection URL for your PostgreSQL database
const connectionString = process.env.DB_CONNECTION_URL;

// Parse the connection URL to extract necessary information
const parsedUrl = url.parse(connectionString);
const dbConfig = {
  user: parsedUrl.auth.split(":")[0],
  password: parsedUrl.auth.split(":")[1],
  host: parsedUrl.hostname,
  port: parsedUrl.port,
  database: parsedUrl.pathname.split("/")[1],
};

app.get("/download-CSV", async (req, res) => {
  const tableName = req.query.tbl_name || "default_table";
  const headerOnly = req.query.header_only === "true";
  const limit = parseInt(req.query.limit) || 0;

  const client = new Client(dbConfig);

  try {
    await client.connect();

    // check the table exists
    const tableExists = await client.query(
      `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '${tableName}')`
    );

    if (!tableExists.rows[0].exists) {
      res.status(404).send({
        success: false,
        message: "Table not found",
      });
      return;
    }

    let query = `SELECT * FROM ${tableName}`;
    if (limit > 0) {
      query += ` LIMIT ${limit}`;
    }

    const result = await client.query(query);

    if (headerOnly) {
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${tableName}_header.csv`
      );
      res.setHeader("Content-Type", "text/csv");
      res.status(200);

      const csvStream = csv.format({ headers: true });

      csvStream.pipe(res);

      if (result.rows.length > 0) {
        const headers = Object.keys(result.rows[0]);
        csvStream.write(headers);
      } else {
        // Extract headers directly from the fields object
        const headers = result.fields.map((field) => field.name);
        csvStream.write(headers);
      }

      csvStream.end();
    } else if (result.rows.length > 0) {
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${tableName}.csv`
      );
      res.setHeader("Content-Type", "text/csv");
      res.status(200);

      const csvStream = csv.format({ headers: true });

      csvStream.pipe(res);

      result.rows.forEach((row) => {
        csvStream.write(row);
      });

      csvStream.end();
    } else {
      res.status(200).send({
        success: true,
        message: "No data available",
      });
    }
  } catch (error) {
    console.error("Error exporting table to CSV:", error);
    res.status(500).send("Internal Server Error");
  } finally {
    await client.end();
  }
});

// get all table name list
app.get("/get-table-list", async (req, res) => {
  const client = new Client(dbConfig);
  try {
    await client.connect();
    const result = await client.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'`
    );
    res.status(200).send({
      success: true,
      message: "Table list fetched successfully",
      data: result.rows,
    });
  } catch (error) {
    console.error("Error getting table list:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

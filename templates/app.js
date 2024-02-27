const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const app = express();
const http = require('https');
const port = 5000;
const path = require('path')

// Create MySQL connection pool
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'mydb.cpfhyihfawjm.us-east-2.rds.amazonaws.com',
    user: 'dbuser',
    password: 'dbpassword',
    database: 'devprojdb',
    charset: 'utf8mb4'
});

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Serve static files from the public directory the css style
//app.use(express.static('images')); 
app.use(express.static(path.join(__dirname, '/css')));


// Function to serve all static files
// inside public directory.
app.use(express.static('public'));
app.use('/images', express.static('images'));


app.use('/js', express.static(path.join(__dirname, 'js')));


// Route for health check
app.get('/health', (req, res) => {
    res.send('Up & Running');
});

// Route to create table
app.get('/create_table', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err;
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS example_table (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL
            )
        `;
        connection.query(createTableQuery, (error, results) => {
            connection.release();
            if (error) throw error;
            res.send('Table created successfully');
        });
    });
});

// Route to insert record
app.post('/insert_record', (req, res) => {
    const name = req.body.name;
    pool.getConnection((err, connection) => {
        if (err) throw err;
        const insertQuery = 'INSERT INTO example_table (name) VALUES (?)';
        connection.query(insertQuery, [name], (error, results) => {
            connection.release();
            if (error) throw error;
            res.send('Record inserted successfully');
        });
    });
});

// Route to fetch data
app.get('/data', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err;
        connection.query('SELECT * FROM example_table', (error, results) => {
            connection.release();
            if (error) throw error;
            res.json(results);
        });
    });
});

// Serve static files from the current directory
app.use(express.static(__dirname));

// UI route // this working without js file
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/home.html');
});


// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
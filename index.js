const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const app = express();
const morgan = require("morgan");
const dotenv = require('dotenv');
dotenv.config();
app.use(bodyParser.json());
const cors = require('cors');
app.use(cors());

// MySQL connection
const db = mysql.createConnection({
  host: 'database-1.cloiem2u4tuh.eu-north-1.rds.amazonaws.com',
  port : 3306,
  user: 'admin',
  password: '25347869',
  database: 'my_db',
}); 

db.connect(err => {
  if (err) {
    console.log('Error connecting to DB:', err);
  } else {
    console.log('Connected to DB');
  }
});

app.get('/', (req, res) => { 
  res.send('Hello World!');
});

// Handle POST request from frontend
app.post('/submit', (req, res) => {
    const { name, email, message } = req.body; // Get email from request body
    console.log(req.body);
    if (!name || !email || !message) {  // Check if email is provided
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }
  
    const query = 'INSERT INTO messages (name, email, message) VALUES (?, ?, ?)'; // Insert email into DB
    db.query(query, [name, email, message], (err, result) => {
      if (err) {
        console.error('Error inserting data into database:', err);
        return res.status(500).json({ error: 'Database error' });
      }
  
      res.status(201).json({ message: 'Data submitted successfully', id: result.insertId });
    });
});

// Admin panel route (to prompt for password and fetch messages)
app.get('/admin', (req, res) => {
  // Password prompt in the browser
  res.send(`
    <script>
      const password = prompt("Please enter the admin password:");
      if (password !== "yourAdminPassword") {
        alert("Incorrect password!");
        window.location.href = "/";
      } else {
        fetch("/admin/data")
          .then(response => response.json())
          .then(data => {
            let output = "<h1>Messages Table Data</h1><table border='1'><tr><th>ID</th><th>Name</th><th>Email</th><th>Message</th></tr>";
            data.forEach(row => {
              output += "<tr><td>" + row.id + "</td><td>" + row.name + "</td><td>" + row.email + "</td><td>" + row.message + "</td></tr>";
            });
            output += "</table>";
            document.body.innerHTML = output;
          })
          .catch(error => {
            alert("Error fetching data.");
            console.error(error);
          });
      }
    </script>
  `);
});

// Route to fetch data from the messages table (with email)
app.get('/admin/data', (req, res) => {
  const query = 'SELECT * FROM messages';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data from the database:', err);
      res.status(500).json({ error: 'Failed to fetch data' });
    } else {
      res.json(results);
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server is running on port 3000');
});

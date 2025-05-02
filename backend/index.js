


const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const cors = require('cors');
const mysql = require('mysql2'); // Use mysql2 (better than mysql)

const app = express();
const PORT = 3000;

// Enable CORS
app.use(cors());

// Serve static files (optional frontend)
const publicPath = path.join(__dirname, '..', 'face_recognition_using_Opencv', 'public');
app.use(express.static(publicPath));

// MySQL Database Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // <-- your DB password if any
    database: 'attendance'
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
    } else {
        console.log(' Connected to MySQL database.');
    }
});

// API: Run Python Script
app.get('/capture', (req, res) => {
    const scriptPath = path.join(__dirname, '..', 'face_recognition_using_Opencv', 'main.py');

    exec(`python "${scriptPath}"`, (error, stdout, stderr) => {
        if (error) {
            console.error('❌ Error executing Python script:', error.message);
            return res.status(500).json({ message: `Error running script: ${error.message}` });
        }

        if (stderr) {
            console.warn('⚠️ Python stderr:', stderr);
        }

        console.log('✅ Python script output:', stdout);
        res.json( 'attendance completed!' );
        
       
    });
});

// API: Fetch all student data (excluding face_encoding)
// app.get('/students', (req, res) => {
//     const query = `
//         SELECT 
//             student_id, 
//             full_name, 
//             date_of_birth, 
//             photo, 
//             present_day, 
//             \`2025_04_28\`
//         FROM students
//     `;

//     db.query(query, (err, results) => {
//         if (err) {
//             console.error('❌ Error fetching students:', err.message);
//             return res.status(500).json({ message: 'Database error', error: err.message });
//         }

//         res.json(results);
//     });
// });





app.get('/students', (req, res) => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const dd = String(today.getDate()).padStart(2, '0');
    const todayColumn = `\`${yyyy}_${mm}_${dd}\``; // Example: `2025_04_29`

    const query = `
        SELECT 
            student_id, 
            full_name, 
            date_of_birth, 
            photo, 
            present_day, 
            ${todayColumn}
        FROM students
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('❌ Error fetching students:', err.message);
            return res.status(500).json({ message: 'Database error', error: err.message });
        }

        res.json(results);
    });
});





// Health Check
app.get('/status', (req, res) => {
    res.json({ status: 'Server is running!' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server started on: http://localhost:${PORT}`);
});

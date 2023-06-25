const express = require('express');
const cors = require('cors');

// Define your API endpoints here
// ...

const mysql = require('mysql2');
const bodyParser = require('body-parser');
const XLSX = require('xlsx');

// Read the Excel file
const workbook = XLSX.readFile("C://Users/Sonit Maddineni/Documents/ProjectPy/studentGenuis/Report.xlsx");



const app = express();
app.use(cors());
app.use(bodyParser.json()); // Parse JSON request body
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded request body

// Create a MySQL connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Sonit@2006',
    database: 'nchs',
});

// Define an API endpoint for fetching data
app.get('/data', (req, res) => {
    // Acquire a connection from the pool
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        // Execute a MySQL query
        connection.query('SELECT * FROM nchs.track', (err, results) => {
            connection.release(); // Release the connection back to the pool

            if (err) {
                console.error('Error executing query:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            // Return the query results as JSON
            res.json(results);
        });
    });
});

app.get('/getOtherColumns', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        const value = req.query.value;

        // Query the database to select other columns of the same row
        const query = "SELECT ID, Name, Grade, Points FROM nchs.track WHERE Name = ?";
        connection.query(query, [value], (error, results) => {
            connection.release();
            if (error) {
                console.error('Error executing the query:', error);
                res.status(500).send('Internal Server Error');
                return;
            }
            res.json(results);
        });
    });
});

app.get('/getCredentials', (req, res) => {
    pool.getConnection((err, connection) => {

        if (err) {
            console.error('Error getting connection from pool:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        const value = req.query.value;

        // Query the database to select other columns of the same row
        const query = "SELECT Name, password FROM nchs.track WHERE ID = ?";
        connection.query(query, [value], (error, results) => {
            connection.release();
            if (error) {
                console.error('Error executing the query:', error);
                res.status(500).send('Internal Server Error');
                return;
            }
            res.json(results);
        });
    });
});

app.get('/getTeacherCreds', (req, res) => {
    pool.getConnection((err, connection) => {

        if (err) {
            console.error('Error getting connection from pool:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        const value = req.query.value;

        // Query the database to select other columns of the same row
        const query = "SELECT password FROM nchs.teacher WHERE user = ?";
        connection.query(query, [value], (error, results) => {
            connection.release();
            if (error) {
                console.error('Error executing the query:', error);
                res.status(500).send('Internal Server Error');
                return;
            }
            res.json(results);
        });
    });
});

app.get('/getWinners', (req, res) => {
    var winResults = [];
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        // const value = req.query.value;

        const queries = ["SELECT  Name, Grade, winners FROM track t1 WHERE winners = (SELECT MAX(winners) FROM track t)", "SELECT Name, Grade, winners FROM nchs.track WHERE Grade = 9 AND winners = (SELECT MAX(winners) FROM nchs.track WHERE Grade = 9)", "SELECT Name, Grade, winners FROM nchs.track WHERE Grade = 10 AND winners = (SELECT MAX(winners) FROM nchs.track WHERE Grade = 10)", "SELECT Name, Grade, winners FROM nchs.track WHERE Grade = 11 AND winners = (SELECT MAX(winners) FROM nchs.track WHERE Grade = 11)", "SELECT Name, Grade, winners FROM nchs.track WHERE Grade = 12 AND winners = (SELECT MAX(winners) FROM nchs.track WHERE Grade = 12)"];
        // Query the database to select other columns of the same row
        for (let i = 0; i < queries.length; i++) {
            connection.query(queries[i], (error, results) => {
                connection.release();
                if (error) {
                    console.error('Error executing the query:', queries[i]);
                    res.status(500).send('Internal Server Error');
                    return;
                }
                winResults.push(results);

                if (i === queries.length - 1) {
                    // Send the response with the populated winResults array
                    res.send(winResults);
                }
            });
        }
    });
});

app.get('/getPrizes', async (req, res) => {
    try {
        const connection = await getConnectionFromPool();
        const results = await executeQuery(connection, 'SELECT Name FROM nchs.data');
        res.json(results);
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Acquire a connection from the pool asynchronously
function getConnectionFromPool() {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                reject(err);
            } else {
                resolve(connection);
            }
        });
    });
}

// Execute a MySQL query asynchronously
function executeQuery(connection, query) {
    return new Promise((resolve, reject) => {
        connection.query(query, (err, results) => {
            connection.release(); // Release the connection back to the pool
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

app.get('/getRandWins', (req, res) => {
    var randWinnerInfo = [];
    let randWinners;
    fetch('http://localhost:3000/getPrizes')
        .then(response => response.json())
        .then(data => {
            const prizes = data.map(row => row.Name);
            randWinners = prizes.slice(0, 4);
            getInfo();
            // return getInfo();
            // console.log(randWinners.length);

        });

    //calling getotherColumns api to get other info about the random winners
    function getInfo() {
        for (let i = 0; i < randWinners.length; i++) {
            // console.log(randWinners);
            fetch('http://localhost:3000/getOtherColumns?value=' + encodeURIComponent(randWinners[i].slice(1, randWinners[i].length)))
                .then(response => response.json())
                .then(data => {
                    randWinnerInfo.push(data);
                    if (i === randWinners.length - 1) {
                        // Send the response with the populated randWinnerInfo array
                        res.send(randWinnerInfo);
                    }
                });
        }
    }
});

app.post('/updatePoints', (req, res) => {
    pool.getConnection((err, connection) => {

        if (err) {
            console.error('Error getting connection from pool:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        // Query the database to select other columns of the same row
        console.log([req.body.points, req.body.id]);
        const query = "UPDATE nchs.track SET Points = (Points + ?) WHERE (ID = ?)";
        connection.query(query, [req.body.points, req.body.id], (error, results) => {
            connection.release();
            if (error) {
                console.error('Error executing the query:', error);
                res.status(500).send('Internal Server Error');
                return;
            }
        });

        for (let i = 0; i < req.body.activity.length; i++) {
            connection.query("INSERT INTO nchs.date (studentID, date, activity) VALUES (?,?,?)", [req.body.id, req.body.date, req.body.activity[i]], (error, results) => {
                connection.release();
                if (error) {
                    console.error('Error executing the query:', error);
                    res.status(500).send('Internal Server Error');
                    return;
                }
            });
        }
    });

});

app.get('/getRank', (req, res) => {
    pool.getConnection((err, connection) => {

        if (err) {
            console.error('Error getting connection from pool:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        // Query the database to select other columns of the same row
        const query = "SELECT ID, Points FROM nchs.track ORDER BY Points DESC";
        connection.query(query, (error, results) => {
            connection.release();
            if (error) {
                console.error('Error executing the query:', error);
                res.status(500).send('Internal Server Error');
                return;
            }
            res.json(results);
        });
    });
});

app.get('/getActivity', (req, res) => {
    pool.getConnection((err, connection) => {

        if (err) {
            console.error('Error getting connection from pool:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        value = req.query.value;
        // Query the database to select other columns of the same row
        const query = "SELECT date, activity FROM nchs.date WHERE studentID = ? ORDER BY date DESC";
        connection.query(query, [value], (error, results) => {
            connection.release();
            if (error) {
                console.error('Error executing the query:', error);
                res.status(500).send('Internal Server Error');
                return;
            }
            res.json(results);
        });
    });
});

app.get('/getReportData', (req, res) => {
    // Get the first worksheet from the workbook
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    var values = [];

    const cellRange = 'A10:E13';

    // Retrieve the values of the cells in the range
    const rangeValues = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    console.log(rangeValues);

    res.send(rangeValues);

});

app.post('/createStudent', (req, res) => {
    pool.getConnection((err, connection) => {

        if (err) {
            console.error('Error getting connection from pool:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        const query = "INSERT INTO nchs.track (ID, Name, Grade, Points, winners, password, email) VALUES (?,?,?,?,?,?,?)";
        connection.query(query, [req.body.id, req.body.name, req.body.grade, 0, 0, req.body.pwd, req.body.email], (error, results) => {
            connection.release();
            if (error) {
                console.error('Error executing the query:', error);
                res.status(500).send('Internal Server Error');
            }
            else {
                res.json({"ok":"200"});
              }
        });
        
    });
    
});

app.post('/createTeacher', (req, res) => {
    pool.getConnection((err, connection) => {

        if (err) {
            console.error('Error getting connection from pool:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        const query = "INSERT INTO nchs.teacher (user, password, email) VALUES (?,?,?)";
        connection.query(query, [req.body.name, req.body.pwd, req.body.email], (error, results) => {
            connection.release();
            if (error) {
                console.error('Error executing the query:', error);
                res.status(500).send('Internal Server Error');
            }
            else {
                res.json({"ok":"200"});
              }
        });
    });

});

app.post('/changeStudentPassword', (req, res) => {
    pool.getConnection((err, connection) => {

        if (err) {
            console.error('Error getting connection from pool:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        const query = "UPDATE nchs.track SET password = ? WHERE (ID = ?)";
        connection.query(query, [req.body.pwd, req.body.id], (error, results) => {
            connection.release();
            if (error) {
                console.error('Error executing the query:', error);
                res.status(500).send('Internal Server Error');
                return;
            }
            res.json(results)
        });
    });

});

app.post('/changeTeacherPassword', (req, res) => {
    pool.getConnection((err, connection) => {

        if (err) {
            console.error('Error getting connection from pool:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        const query = "UPDATE nchs.teacher SET password = ? WHERE (user = ?)";
        connection.query(query, [req.body.pwd, req.body.user], (error, results) => {
            connection.release();
            if (error) {
                console.error('Error executing the query:', error);
                res.status(500).send('Internal Server Error');
                return;
            }
        res.json(results);
        });
    });

});

app.get('/getStudentEmail', (req, res) => {
    pool.getConnection((err, connection) => {

        if (err) {
            console.error('Error getting connection from pool:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        const query = "SELECT email FROM nchs.track WHERE (ID = ?)";
        connection.query(query, [req.query.value], (error, results) => {
            connection.release();
            if (error) {
                console.error('Error executing the query:', error);
                res.status(500).send('Internal Server Error');
                return;
            }
        });
    });

});

app.get('/getTeacherEmail', (req, res) => {
    pool.getConnection((err, connection) => {

        if (err) {
            console.error('Error getting connection from pool:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        const query = "SELECT email FROM nchs.teacher WHERE (user = ?)";
        connection.query(query, [req.query.value], (error, results) => {
            connection.release();
            if (error) {
                console.error('Error executing the query:', error);
                res.status(500).send('Internal Server Error');
                return;
            }
        });
    });

});
// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

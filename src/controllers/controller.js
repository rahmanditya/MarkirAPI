const mysql2 = require('mysql2');
const config = require('../configs/database.js');

const pool = mysql2.createPool(config);

pool.on('error', (err) => {
    console.error(err);
});

module.exports = {
    addSlot(req,res) {
        const parking_slot = {
            left: req.body.left,
            top: req.body.top,
            width: req.body.width,
            height: req.body.height,
            row: req.body.row,
            column: req.body.column,
        };
        pool.getConnection((err, connection) => {
            if (err) throw err;
            connection.query(
            `
                INSERT INTO parking_slot SET ?;
            `,
            [parking_slot],
            (error) => {
                if (error) throw error;
                res.send({
                  success: true,
                  message: 'Berhasil tambah data!',
                });
              },
            );
            connection.release();
        });
    },

    getParkSlot(req, res) {
        pool.getConnection((err, connection) => {
            if (err) throw err;
            connection.query(
                'SELECT id, `left`, `top`, `width`, `height` FROM parking_slot', 
                (error, results) => {
                connection.release();
                if (error) throw error;
    
                const data = results.reduce((acc, row) => {
                    acc[row.id] = {
                        left: row.left,
                        top: row.top,
                        width: row.width,
                        height: row.height
                    };
                    return acc;
                }, {});
    
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(data));
            });
        });
    },

    updateSlot(req,res) {
        const updates = req.body; 

        const updateQueries = Object.keys(updates).map(id => {
            return new Promise((resolve, reject) => {
                const occupied = updates[id];
                pool.getConnection((err, connection) => {
                    if (err) return reject(err);
                    connection.query('UPDATE parking_slot SET occupied = ? WHERE id = ?', 
                        [occupied, id], 
                        (error, results) => {
                        connection.release();
                        if (error) return reject(error);
                        resolve(results);
                    });
                });
            });
        });
    
        Promise.all(updateQueries)
            .then(() => res.send('Update successful'))
            .catch(error => {
                console.error(error);
                res.status(500).send('Update failed');
            });
        },
    
    parkStatus(req,res){
        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting database connection:', err);
                return res.status(500).send('Internal Server Error');
            }
    
            const query = `
                SELECT
                    SUM(CASE WHEN occupied = 1 THEN 1 ELSE 0 END) AS occupied,
                    SUM(CASE WHEN occupied = 0 THEN 1 ELSE 0 END) AS unoccupied
                FROM parking_slot;
            `;
    
            connection.query(query, (error, results) => {
                connection.release();
    
                if (error) {
                    console.error('Error executing query:', error);
                    return res.status(500).send('Internal Server Error');
                }
    
                const status = {
                    occupied: results[0].occupied,
                    unoccupied: results[0].unoccupied
                };
    
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(status));
            });
        });
    },

    
    getLayout(req, res) {
        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting database connection:', err);
                return res.status(500).send('Internal Server Error');
            }
    
            const query = 'SELECT id, num, `column`, `row`, occupied, floor FROM parking_slot';
    
            connection.query(query, (error, results) => {
                connection.release();
    
                if (error) {
                    console.error('Error executing query:', error);
                    return res.status(500).send('Internal Server Error');
                }
    
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(results));
            });
        });
    },

    getAll(req,res){
        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting database connection:', err);
                return res.status(500).send('Internal Server Error');
            }
    
            const query = 'SELECT * FROM parking_slot';
    
            connection.query(query, (error, results) => {
                connection.release();
    
                if (error) {
                    console.error('Error executing query:', error);
                    return res.status(500).send('Internal Server Error');
                }
    
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(results));
            });
        });
    }
};
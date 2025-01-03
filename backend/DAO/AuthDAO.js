const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

class AuthDAO {
    constructor(dbPath) {
        this.db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.log(`Failed to connect to database: ${err.message}`);
            } else {
                console.log('Connected to the database.');
            }
        });
    }

    register(email, name, surname, password, callback) {
        if (password.length < 10) {
            return callback(new Error('Password must be at least 10 characters long'));
        }
    
        const checkUserSql = `SELECT * FROM user WHERE email = ?`;
        this.db.get(checkUserSql, [email], (err, row) => {
            if (err) {
                return callback(err);
            }
            if (row) {
                return callback(new Error('User with this email is already registered'));
            }
    
            const hashedPassword = bcrypt.hashSync(password, 10);
            const insertUserSql = `INSERT INTO user (email, name, surname, password) VALUES (?, ?, ?, ?)`;
            this.db.run(insertUserSql, [email, name, surname, hashedPassword], function(err) {
                if (err) {
                    return callback(err);
                }
                callback(null, { user_id: this.lastID });
            });
        });
    }

    login(email, password, callback) {
        const sql = `SELECT * FROM user WHERE email = ?`;
        this.db.get(sql, [email], (err, row) => {
            if (err) {
                return callback(err);
            }
            if (!row) {
                return callback(new Error('Invalid email'));
            }
            if (!bcrypt.compareSync(password, row.password)) {
                return callback(new Error('Invalid password'));
            }
            callback(null, row);
        });
    }
}

module.exports = AuthDAO;
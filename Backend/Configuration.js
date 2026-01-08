import mysql from 'mysql2';

// Create connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'timesheet',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Create connection function
export const createConnection = () => {
  return pool.promise();
};

// Query function (automatically handles connection release)
export const query = (sql, params) => {
  return pool.promise().query(sql, params);
};

// Your pool query function using execute
export const execute = (sql, params) => {
  return pool.promise().execute(sql, params);
};


// Close pool (only when shutting down server)
export const closeConnection = () => {
  return new Promise((resolve, reject) => {
    pool.end((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

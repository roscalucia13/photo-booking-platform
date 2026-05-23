const sql = require('mssql/msnodesqlv8');

const config = {
  connectionString: 'Driver={ODBC Driver 18 for SQL Server};Server=localhost;Database=photo_booking;Trusted_Connection=Yes;Encrypt=no;',
  connectionTimeout: 30000, 
  requestTimeout: 30000,    
  options: {
    enableArithAbort: true,
    trustServerCertificate: true
  },
  pool: {
    max: 50,
    min: 0,
    idleTimeoutMillis: 60000
  }
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

module.exports = {
  sql, pool, poolConnect
};

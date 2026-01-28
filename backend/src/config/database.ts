import sql from 'mssql';
import msnodesqlv8 from 'mssql/msnodesqlv8';
import dotenv from 'dotenv';

dotenv.config();

const dbServer = process.env.DB_SERVER || 'ROEFDN812Q';
const dbDatabase = process.env.DB_DATABASE || 'POS_Investigation';
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;

const isSqlAuth = dbUser && 
                 dbUser.trim() !== '' && 
                 dbUser !== 'your_sql_username' && 
                 dbUser !== 'your_username';

let dbConfig: any;

if (isSqlAuth) {
  console.log(`Using SQL Authentication for user: ${dbUser}`);
  dbConfig = {
    server: dbServer,
    database: dbDatabase,
    user: dbUser,
    password: dbPassword,
    options: {
      encrypt: process.env.DB_ENCRYPT === 'true',
      trustServerCertificate: true,
      enableArithAbort: true,
    },
  };
} else {
  // FOR WINDOWS AUTHENTICATION (Integrated Security)
  // We explicitly use the msnodesqlv8 driver to bypass tedious driver issues
  console.log('Using Windows Authentication (Native msnodesqlv8) for SQL Server connection');
  
  dbConfig = {
    connectionString: `Driver={ODBC Driver 17 for SQL Server};Server=${dbServer};Database=${dbDatabase};Trusted_Connection=yes;TrustServerCertificate=yes;`,
    options: {
      enableArithAbort: true
    }
  };
}

let pool: sql.ConnectionPool | null = null;

export const getPool = async (): Promise<sql.ConnectionPool> => {
  if (!pool) {
    try {
      console.log(`Attempting to connect to ${dbServer} (Database: ${dbDatabase})...`);
      
      if (isSqlAuth) {
        pool = await sql.connect(dbConfig);
      } else {
        // Force the use of msnodesqlv8 for Windows Auth
        pool = await new msnodesqlv8.ConnectionPool(dbConfig).connect();
      }
      
      console.log('Connected to SQL Server database successfully');
    } catch (err: any) {
      console.error('========================================');
      console.error('DATABASE CONNECTION FAILED');
      console.error('========================================');
      console.error(`Error: ${err.message}`);
      
      if (!isSqlAuth) {
        console.error('\nWINDOWS AUTH TROUBLESHOOTING:');
        console.error('1. Ensure "ODBC Driver 17 for SQL Server" is installed.');
        console.error('2. Ensure you are running the app on Windows as MFAD\\M297376.');
        console.error('3. If this continues to fail, please create a SQL Login in SSMS and use SQL Auth.');
      }
      console.error('========================================');
      throw err;
    }
  }
  return pool;
};

export const closePool = async (): Promise<void> => {
  if (pool) {
    await pool.close();
    pool = null;
    console.log('Database connection closed');
  }
};

export default { getPool, closePool };



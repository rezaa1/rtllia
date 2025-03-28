const Sequelize = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// Create Sequelize instance
let sequelize;

// Check if DATABASE_URL is provided (Docker environment)
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: {
      // Disable SSL for local development
      ssl: false
    },
    define: {
      underscored: true, // This tells Sequelize to use snake_case in the database
      timestamps: true
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
} else {
  // Fall back to individual connection parameters
  sequelize = new Sequelize(
    process.env.PGDATABASE,
    process.env.PGUSER,
    process.env.PGPASSWORD,
    {
      host: process.env.PGHOST,
      port: process.env.PGPORT || 5432,
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      dialectOptions: {
        // Disable SSL for local development
        ssl: false
      },
      define: {
        underscored: true, // This tells Sequelize to use snake_case in the database
        timestamps: true
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
}

// Test the connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection to PostgreSQL has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the PostgreSQL database:', error);
  }
};

testConnection();

// Export both the sequelize instance directly and as a property
module.exports = sequelize;
module.exports.sequelize = sequelize;

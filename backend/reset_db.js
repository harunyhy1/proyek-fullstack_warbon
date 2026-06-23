const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const DB = process.env.DB_NAME || 'warkop_db';

async function reset() {
  // Connect without database to drop/recreate
  const conn = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: parseInt(process.env.DB_PORT || '3306'),
    multipleStatements: true
  });

  const p = conn.promise();

  console.log('Dropping database...');
  await p.query(`DROP DATABASE IF EXISTS \`${DB}\``);

  console.log('Creating database...');
  await p.query(`CREATE DATABASE \`${DB}\``);

  await p.query(`USE \`${DB}\``);

  // Execute schema
  console.log('Creating tables...');
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await p.query(schema);

  // Execute seed
  console.log('Seeding data...');
  const seed = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
  await p.query(seed);

  console.log('Done! Database reset complete.');
  process.exit(0);
}

reset().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});

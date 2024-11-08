
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const app = require('./app');  // Import app
const db = require('./models/db');
// const redisClient = require('./redisClient');  // Import Redis client

/* Test DB connection */
db.authenticate()
  .then(() => console.log('MySQL connected'))
  .catch(err => console.log('Error: ' + err));

/* Starting the server on port 4001 */
const port = process.env.PORT || 4001;
app.listen(port, () => {
  console.log(`App running on port ${port}..`);
});

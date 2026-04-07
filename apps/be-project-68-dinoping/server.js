const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); 
const cookieParser = require('cookie-parser');


dotenv.config({ path: './config/config.env' });

connectDB();

const hospital  = require('./routes/hospitals');
const auth = require('./routes/auth');
const appointments =require('./routes/appointments');
const app = express();


app.use(express.json());
app.set('query parser','extended');

app.use(cookieParser());
app.use('/api/v1/hospitals',hospital);
app.use('/api/v1/auth',auth);
app.use('/api/v1/appointments',appointments);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    'Server running in',
    process.env.NODE_ENV,
    'mode on port',
    PORT
  );
});

process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);

  // Close server & exit process
  server.close(() => process.exit(1));
});

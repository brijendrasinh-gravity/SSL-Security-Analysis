const express = require('express');
const app = express();
const cors = require("cors");
const sequelize = require('./config/db')

require('./model/sslReportModel');
require('./model/userModel');


app.use(cors())
app.use(express.json());


const sslRoutes = require('./routes/sslCertiRoutes');
app.use('/sslanalysis', sslRoutes);


sequelize.authenticate()
  .then(() => {
    console.log('Database connected');
    return sequelize.sync(); 
  })  
  .catch(err => console.error('Database connection error:', err));

app.get('/', (req, res) => res.send('SSL web server is live'));  

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});  




const express = require('express');
const app = express();
const cors = require("cors");
const sequelize = require('./config/db')

require('./model/sslReportModel');
require('./model/userModel');
require('./model/moduleModel');
require('./model/permissionModel');
require('./model/rolePermissionModel');
require('./model/rolesModel');
require('./model/blockedipModel');


app.use(cors())
app.use(express.json());

const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "middleware/uploads")));

const sslRoutes = require('./routes/SSL_AuthRoutes/sslCertiRoutes');
app.use('/sslanalysis', sslRoutes);

const roleRoutes = require('./routes/role_permission module/roleRoutes');
app.use('/roles', roleRoutes);

const userModuleRoutes = require('./routes/user module/userModuleRoutes');
app.use('/users', userModuleRoutes);

const blockedIPRoutes = require('./routes/Blocked module/blockedIPRoutes');
app.use('/blocked-ips', blockedIPRoutes);


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


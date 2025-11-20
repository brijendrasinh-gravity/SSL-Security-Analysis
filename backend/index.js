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
require('./model/generalSettingModel');
require('./model/virusTotalModel');
require('./model/virusTotalModel');

app.use(cors())
app.use(express.json());

const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "middleware/uploads")));

//limited IP access module middleware(only allowed ip can visit site)
const limitedAccessMiddleware = require('./middleware/limitedAccessMiddleware');
app.use(limitedAccessMiddleware);

const sslRoutes = require('./routes/SSL_AuthRoutes/sslCertiRoutes');
app.use('/sslanalysis', sslRoutes);

const roleRoutes = require('./routes/role_permission module/roleRoutes');
app.use('/roles', roleRoutes);

const userModuleRoutes = require('./routes/user module/userModuleRoutes');
app.use('/users', userModuleRoutes);

const blockedIPRoutes = require('./routes/Blocked module/blockedIPRoutes');
app.use('/blocked-ips', blockedIPRoutes);

const generalSettingRoutes = require('./routes/GeneralSetting/generalSettingRoutes');
app.use('/settings', generalSettingRoutes);

const virusTotalRoutes = require('./routes/Virus Module/virusTotalRoutes');
app.use('/virus', virusTotalRoutes);

const dashboardRoutes = require('./routes/dashboard Routes/dashboardRoutes');
app.use('/dashboard', dashboardRoutes);

sequelize.authenticate()
  .then(() => {
    console.log('Database connected');
    // return sequelize.sync();
  })  
  .catch(err => console.error('Database connection error:', err));

app.get('/', (req, res) => res.send('SSL web server is live'));  

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
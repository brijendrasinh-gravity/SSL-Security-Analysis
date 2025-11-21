const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./userModel');

const Dashboard = sequelize.define('dashboard',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true 
    },
    user_id:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    layout:{
        type:DataTypes.JSON,
        allowNull:true,
    },
    cb_deleted:{
        type:DataTypes.BOOLEAN,
        defaultValue:false,
    }
},{
    tableName:'dashboards',
    timestamps:true,
    paranoid:true
})

User.hasOne(Dashboard,{foreignKey:'user_id'});
Dashboard.belongsTo(User, {foreignKey:'user_id'});


module.exports = Dashboard;
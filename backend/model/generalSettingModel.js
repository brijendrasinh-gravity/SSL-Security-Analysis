const { DataTypes } = require("sequelize");
const sequelize = require('../config/db');

const GeneralSetting = sequelize.define("general_setting",{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    field_name:{
        type:DataTypes.STRING
    },
    field_value:{
        type:DataTypes.STRING,
        allowNull:true
    },
    cb_deleted:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    }
},{
    timestamps:true,
    paranoid:true,
    tableName:'general_settings'
})

module.exports = GeneralSetting;
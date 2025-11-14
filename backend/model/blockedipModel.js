const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Blocked_IP = sequelize.define("blocked_ips",{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    ip_address:{
        type:DataTypes.STRING,
        allowNull:false 
    },
    browser_info:{
        type:DataTypes.TEXT,
        allowNull:true
    },
    blocked_type:{
        type:DataTypes.ENUM("Login","Manual"),
        allowNull:false,
        defaultValue:"Manual"
    },
    cb_deleted:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    },
    login_access:{
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
},{
    timestamps:true,
    tableName:"blocked_ips",
    paranoid:true 
}
);

module.exports = Blocked_IP;
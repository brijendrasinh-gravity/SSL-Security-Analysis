const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const RolePermission = sequelize.define(
  "role_permission",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    role_id: {
      type: DataTypes.INTEGER,
    },
    module_name: {
      type: DataTypes.STRING,
    },
    cb_deleted:{
      type:DataTypes.BOOLEAN,
      defaultValue:false 
    },
    canList: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    canCreate: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    canModify: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    canDelete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
   
  },
  {
    timestamps: true,
    tableName: "role_permissions",
    paranoid:true
  }
);

module.exports = RolePermission;

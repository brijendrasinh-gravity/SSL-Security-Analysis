const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Permission = sequelize.define(
  "permission",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    module_code: {
      type: DataTypes.STRING,
      
    },
    name: {
      type: DataTypes.STRING,
    // ex: "canCreate", "canList"
    },
  },
  {
    timestamps: true,
    tableName: "permissions",
    paranoid:true
  }
);

module.exports = Permission;
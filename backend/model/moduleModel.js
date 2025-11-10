const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Permission = require("./permissionModel");

const Module = sequelize.define(
  "module",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
    },
    module_name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, 
    },
    permissions: {
      type: DataTypes.STRING,
      //  ["canList", "canCreate", "canModify", "canDelete"]
    },
  },
  {
    timestamps: true,
    tableName: "modules",
    paranoid: true,
  }
);

//  Associations
Module.hasMany(Permission, {
  as: "permissions_list",       //  clear alias name
  foreignKey: "module_code",    // column in Permission table
  sourceKey: "module_name",     // reference column in Module table
});

Permission.belongsTo(Module, {
  as: "module_info",            // alias for reverse relation
  foreignKey: "module_code",    // same FK
  targetKey: "module_name",     // same target
});

module.exports = Module;


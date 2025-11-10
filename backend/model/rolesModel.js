const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./userModel");
const RolePermission = require("./rolePermissionModel");

const Role = sequelize.define(
  "role",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
    },
    is_Admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    cb_deleted:{
      type:DataTypes.BOOLEAN,
      defaultValue:false
    }
  },
  {
    timestamps: true,
    tableName: "roles",
    paranoid:true
  }
);

//  Associations
Role.hasMany(User, { foreignKey: "role_id" });
User.belongsTo(Role, { foreignKey: "role_id" });

Role.hasMany(RolePermission, { foreignKey: "role_id" });
RolePermission.belongsTo(Role, { foreignKey: "role_id" });




module.exports = Role;

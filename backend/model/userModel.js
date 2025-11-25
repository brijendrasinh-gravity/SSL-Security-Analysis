const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Role = require("./rolesModel");

const User = sequelize.define(
  "user",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    user_name: {
      type: DataTypes.STRING,
    },
    password: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
    },
    profile_image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password_changed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    is_first_time: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cb_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
    resettoken: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    resettokenExpire: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    otp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    otpExpirationTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    canReset: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    last_password_reminder: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    api_limit_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    daily_limit: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    api_used_today: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    api_last_used_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    paranoid: true,
    tableName: "users",
  }
);

Role.hasMany(User, { foreignKey: "role_id" });
User.belongsTo(Role, { foreignKey: "role_id" });

module.exports = User;

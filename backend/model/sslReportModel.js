const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Sslreports = sequelize.define(
  "ssl_reports",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    domain: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ssllabs: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    certificateTransparency: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    by_Date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    isDeleted: {
      type: DataTypes.ENUM("Yes", "No"),
      defaultValue: "No",
    },
  },
  {
    timestamps: true,
    tableName: "ssl_reports",
    paranoid: true,
    // deletedAt:false
  }
);

module.exports = Sslreports;

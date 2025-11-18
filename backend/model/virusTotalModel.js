const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./userModel");

const Virus = sequelize.define(
  "virus_total",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    scanned_url: {
      type: DataTypes.STRING(2048),
    },
    last_analysis_date: {
      type: DataTypes.DATE,
    },
    scan_results: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
    },
    analysis_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cb_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    tableName: "virus",
    paranoid: false,
  }
);

Virus.belongsTo(User, {
  foreignKey: "user_id",
});
User.hasMany(Virus, { foreignKey: "user_id" });

module.exports = Virus;

"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("customer_meters", "account_id", {
      type: Sequelize.INTEGER,
      autoIncreament: true,
      unique: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("customer_meters", "account_id");
  },
};

"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("customers", "customer_number", {
      type: Sequelize.INTEGER,
      autoIncreament: true,
      unique: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("customers", "customer_number");
  },
};

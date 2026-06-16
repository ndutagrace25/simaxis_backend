"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("customer_meters", "categories", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "Domestic",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("customer_meters", "categories");
  },
};
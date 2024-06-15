"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("customers", "building_name", {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn("customers", "county", {
      type: Sequelize.STRING,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("customers", "building_name");
    await queryInterface.removeColumn("customers", "county");
  },
};

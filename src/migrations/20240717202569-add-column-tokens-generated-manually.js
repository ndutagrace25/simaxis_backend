"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("meter_tokens", "generated_manually", {
      type: Sequelize.BOOLEAN,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("meter_tokens", "generated_manually");
  },
};

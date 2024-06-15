"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("customer_meters", "tenant_id", {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: "tenants",
        key: "id",
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("customer_meters", "tenant_id");
  },
};

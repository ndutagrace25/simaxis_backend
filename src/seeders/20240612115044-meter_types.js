"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.bulkInsert(
      "meter_types",
      [
        {
          id: "730d03c3-adda-48e6-8595-bc8e005c0fa1",
          name: "Energy Meter",
          description: "Electricity meter",
          created_at: "2024-06-10 11:42:33.424 +0300",
          updated_at: "2024-06-10 11:42:33.424 +0300",
          type: 0
        },
        {
          id: "730d03c3-adda-48e6-8595-bc8e005c0fa2",
          name: "Water Meter",
          description: "Water meter",
          created_at: "2024-06-10 11:42:33.424 +0300",
          updated_at: "2024-06-10 11:42:33.424 +0300",
          type: 1
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {

    await queryInterface.bulkDelete("meter_types", null, {});
  },
};

"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("users", {
      fields: ["phone"],
      type: "unique",
      name: "unique_phone",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("users", "unique_phone");
  },
};

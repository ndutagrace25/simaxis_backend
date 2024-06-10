'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('meter_tokens', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        type: Sequelize.UUID,
        allowNull: false,

      },
      token: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      meter_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "meters",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      issue_date: {
        type: Sequelize.DATE
      },
      amount: {
        type: Sequelize.FLOAT
      },
      token_type: {
        type: Sequelize.STRING
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('meter_tokens');
  }
};
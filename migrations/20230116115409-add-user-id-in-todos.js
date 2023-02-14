<<<<<<< HEAD
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Todos", "userId", {
      type: Sequelize.DataTypes.INTEGER,
    });

    await queryInterface.addConstrain("Todos", {
      fields: ["userId"],
      type: "foreign key",
      refrences: {
        table: "Users",
        field: "id",
      },
    });
=======
'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("Todos","userId",{
      type:Sequelize.DataTypes.INTEGER,
    })

    await queryInterface.addConstrain("Todos",{
      fields:["userId"],
      type:"foreign key",
      refrences:{
        table:"Users",
        field:"id",
      }
    })
>>>>>>> 9a2e8d135357aa45d441ac3ac3f212b32e238270
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

<<<<<<< HEAD
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Todos", "userId");
=======
  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("Todos","userId")
>>>>>>> 9a2e8d135357aa45d441ac3ac3f212b32e238270
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
<<<<<<< HEAD
  },
=======
  }
>>>>>>> 9a2e8d135357aa45d441ac3ac3f212b32e238270
};

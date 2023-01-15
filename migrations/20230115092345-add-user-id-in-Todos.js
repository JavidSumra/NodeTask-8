'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("Todos","userId",
    {
      type:Sequelize.DataTypes.INTEGER,
    }
  )

  queryInterface.addConstant("Todos",{
    fields:["userId"],
    type:"foreign key",
    references:{
      table:"UserDetail",
      field:"id"
    }
  })
},

async down (queryInterface, Sequelize) {
  await queryInterface.removeColumn("Todos","userId")
  /**
   * Add reverting commands here.
   *
   * Example:
   * await queryInterface.dropTable('users');
   */
}
};

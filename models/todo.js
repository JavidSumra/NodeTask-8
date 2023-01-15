"use strict";
const { Model,Op} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Todo.belongsTo(models.UserDetail,{
        foreignKey:"userId",
      })
    }

    static addTodo({ title, dueDate, userId}) {
      return this.create({ title: title, dueDate: dueDate, completed: false ,userId});
    }

    static gettodos(){
      return this.findAll({order:[["id","ASC"]]});
    }
    static Overdue(userId){
      return this.findAll({
        where:{
          dueDate:{
            [Op.lt]:new Date().toISOString()
          },
          completed:false,
          userId,
        },
        order:[["id","ASC"]]
      })
    }
    static duelater(userId){
      return this.findAll({
        where:{
          dueDate:{
            [Op.gt]:new Date().toISOString()
          },
          completed:false,
          userId,
        },
        order:[["id","ASC"]]
      })
    }
    static duetoday(userId){
      return this.findAll({
        where:{
          dueDate:{
            [Op.eq]:new Date().toISOString()
          },
          completed:false,
          userId,
        },
        order:[["id","ASC"]]
      })
    }
    static completetodo(userId){
      return this.findAll({
        where:{
          completed:true,
          userId,
        },
        order:[["id","ASC"]],
      })
    }
     setCompletionStatus(status) {
      return this.update({ completed: status });
    }

    static DestroyTodo(userId){
      this.destroy({
        where:{
          id,
          userId,
        },
      });
    }
  }
  Todo.init(
    {
      title: DataTypes.STRING,
      dueDate: DataTypes.DATEONLY,
      completed: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Todo",
    }
  );
  return Todo;
};

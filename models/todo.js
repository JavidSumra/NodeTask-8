"use strict";
const { Model, Op } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Todo.belongsTo(models.User, {
        foreignKey: "userId",
      });
    }

    static addTodo({ title, dueDate, userId }) {
      return this.create({
        title: title,
        dueDate: dueDate,
        completed: false,
        userId,
      });
    }

    static gettodos() {
      return this.findAll({ order: [["id", "ASC"]] });
    }
    static Overdue(userId) {
      return this.findAll({
        where: {
          dueDate: {
            [Op.lt]: new Date().toISOString(),
          },
          completed: false,
          userId,
        },
        order: [["id", "ASC"]],
      });
    }
    static duelater(userId) {
      return this.findAll({
        where: {
          dueDate: {
            [Op.gt]: new Date().toISOString(),
          },
          completed: false,
          userId,
        },
        order: [["id", "ASC"]],
      });
    }
    static duetoday(userId) {
      return this.findAll({
        where: {
          dueDate: {
            [Op.eq]: new Date().toISOString(),
          },
          completed: false,
          userId,
        },
        order: [["id", "ASC"]],
      });
    }
    static completetodo(userId) {
      return this.findAll({
        where: {
          completed: true,
          userId,
        },
        order: [["id", "ASC"]],
      });
    }
    static inCompletedTodos(dueDate) {
      return this.findAll({
        where: {
          dueDate,
          completed: false,
        },
      });
    }
    static incompleteTodosByUser(dueDate, userId) {
      return this.findAll({
        where: {
          userId,
          dueDate,
          completed: false,
        },
      });
    }
    setCompletionStatus(status) {
      return this.update({ completed: status });
    }

    static DestroyTodo(id, userId) {
      return this.destroy({
        where: {
          id,
          userId,
        },
      });
    }
  }
  Todo.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: true,
          len: 5,
        },
      },
      dueDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
          notNull: true,
        },
      },
      completed: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Todo",
    }
  );
  return Todo;
};

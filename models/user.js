'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.Todo, {
        foreignKey: "userId",
      });
    }
  }
  User.init({
    FirstName: {
      type:DataTypes.STRING,
<<<<<<< HEAD
      // allowNull:false
    },
    LastName:{
      type:DataTypes.STRING,
      // allowNull:false
=======
    },
    LastName:{
      type:DataTypes.STRING,
>>>>>>> 9a2e8d135357aa45d441ac3ac3f212b32e238270
    },
    password:{
      type:DataTypes.STRING,
      allowNull:false
    },
    email:{
      type:DataTypes.STRING,
      allowNull:false,
      unique:true
    }
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
<<<<<<< HEAD
};
=======
};
>>>>>>> 9a2e8d135357aa45d441ac3ac3f212b32e238270

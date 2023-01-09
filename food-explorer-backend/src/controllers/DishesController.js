const { response } = require("express");
const knex = require("../database/knex");

class DishesController{
  async create(req, res){
    const { title, description, category, price, ingredients} = req.body;

    const dish_id  = await  knex("dishes").insert({
      title,
      description,
      category,
      price
    });

    const ingredientsInsert = ingredients.map( ingredient =>{
      return{
        name:ingredient,
        dish_id
      }
    });

    await knex("ingredients").insert(ingredientsInsert);
    res.json();
  }
}

module.exports = DishesController;
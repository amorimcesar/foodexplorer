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
  async show(req, res) {
    const { id } = req.params;

    const dish = await knex("dishes").where({ id }).first();
    const ingredients = await knex("ingredients").where({ dish_id: id }).orderBy("name");

    return res.status(201).json({
        ...dish,
        ingredients
    });
  }
  async delete(req, res) {
    // Capturing ID Parameters
    const { id } = req.params;

    // Deleting dish through the informed ID
    await knex("dishes").where({ id }).delete();

    return res.status(202).json();
  }
  async index(req, res) {

    const { title, ingredients } = req.query;
    console.log(title, ingredients)

    let dishes;

    if (ingredients) {
        const filterIngredients = ingredients.split(',').map(ingredient => ingredient.trim());
        dishes = await knex("ingredients")
            .select([
                "dishes.id",
                "dishes.title",
                "dishes.description",
                "dishes.category",
                "dishes.price",
                "dishes.image",
            ])
            .whereLike("name", `%${filterIngredients}%`)
            .innerJoin("dishes", "dishes.id", "ingredients.dish_id")
            .groupBy("dishes.id")
            .orderBy("dishes.title");

    } else {
        dishes = await knex("dishes")
            .whereLike("title", `%${title}%`)
            .orderBy("title");
    }
        
    const dishesIngredients = await knex("ingredients") 
    const dishesWithIngredients = dishes.map(dish => {
        const dishIngredient = dishesIngredients.filter(ingredient => ingredient.dish_id === dish.id);

        return {
            ...dish,
            ingredients: dishIngredient
        }
    })
    
    return res.status(200).json(dishesWithIngredients);
}
}

module.exports = DishesController;
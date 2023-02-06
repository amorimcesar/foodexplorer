const knex = require("../database/knex");
const AppError = require('../utils/AppError');
const DiskStorage = require("../providers/DiskStorage")

class DishesController {
    async create(request, response) {
        const { title, description, category, price, ingredients } = request.body;

        const checkDishAlreadyExists = await knex("dishes").where({title}).first();
    
        if(checkDishAlreadyExists){
            throw new AppError("Este prato já existe no cardápio.")
        }

        const imageFileName = request.file.filename;

        const diskStorage = new DiskStorage()

        const filename = await diskStorage.saveFile(imageFileName);

        const dish_id = await knex("dishes").insert({
            image: filename,
            title,
            description,
            price,
            category,
        });

        const hasOnlyOneIngredient = typeof(ingredients) === "string";

        let ingredientsInsert

        if (hasOnlyOneIngredient) {
            ingredientsInsert = {
                name: ingredients,
                dish_id
            }

        } else if (ingredients.length > 1) {
            ingredientsInsert = ingredients.map(name => {
                return {
                    name,
                    dish_id
                }
            });
        }

        await knex("ingredients").insert(ingredientsInsert);

        return response.status(201).json(); 
    }

    async update(request, response) {
        const { title, description, category, price, ingredients, image } = request.body;
        const { id } = request.params;

        const imageFileName = request.file.filename;
    
        const diskStorage = new DiskStorage();

        const dish = await knex("dishes").where({ id }).first();
    
        if (dish.image) {
          await diskStorage.deleteFile(dish.image);
        }
    
        const filename = await diskStorage.saveFile(imageFileName);
    
        dish.image = image ?? filename;
        dish.title = title ?? dish.title;
        dish.description = description ?? dish.description;
        dish.category = category ?? dish.category;
        dish.price = price ?? dish.price;

        await knex("dishes").where({ id }).update(dish);
    
        const hasOnlyOneIngredient = typeof(ingredients) === "string";

        let ingredientsInsert

        if (hasOnlyOneIngredient) {
            ingredientsInsert = {
                name: ingredients,
                dish_id: dish.id,
            }
        
        } else if (ingredients.length > 1) {
            ingredientsInsert = ingredients.map(ingredient => {
                return {
                dish_id: dish.id,
                name : ingredient
                }
            });
        }
          
        await knex("ingredients").where({ dish_id: id}).delete()
        await knex("ingredients").where({ dish_id: id}).insert(ingredientsInsert)

        return response.status(201).json('Prato atualizado com sucesso')
    }

    async show(request, response) {
        const { id } = request.params;

        const dish = await knex("dishes").where({ id }).first();
        const ingredients = await knex("ingredients").where({ dish_id: id }).orderBy("name");

        return response.status(201).json({
            ...dish,
            ingredients
        });
    }

    async delete(request, response) {
        const { id } = request.params;

        await knex("dishes").where({ id }).delete();

        return response.status(202).json();
    }

    async index(request, response) {
        const { search } = request.query;
        let dishesWithIngredients;
    
        dishesWithIngredients = await knex
            .select("dishes.*", "ingredients.*")
            .from("dishes")
            .innerJoin("ingredients", "dishes.id", "ingredients.dish_id")
            .where("dishes.title", "like", `%${search}%`)
            .orWhere("ingredients.name", "like", `%${search}%`)
            .orderBy("dishes.title")
            .groupBy("title");
    
        return response.status(200).json(dishesWithIngredients);
    }
    

}

module.exports = DishesController;
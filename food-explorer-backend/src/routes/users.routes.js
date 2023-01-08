// Router, Multer and uploadConfig Import
const { Router } = require("express");
const userRoutes = Router();

//Controller import and initialization
const UsersController = require("../controllers/UsersController");
const usersController = new UsersController();

//Users Routes
userRoutes.post("/", usersController.create);
userRoutes.put("/:id", usersController.update)

module.exports = userRoutes;
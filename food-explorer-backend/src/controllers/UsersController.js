// Hash, App Error and SQLite Connection Import
const { hash, compare } = require("bcryptjs");
const AppError = require("../utils/AppError");
const sqliteConnection = require("../databse/sqlite")

class UsersController {
    async create(req, res){

      // Capturing Body Parameters
      const {name, email, password} = req.body;

      // Connection with Database
      const database = await sqliteConnection();
      //Verifications
      const checkUserExists = await database.get("SELECT * FROM users WHERE email = (?)", [email]
      );

      if(checkUserExists){
        throw new AppError("Este e-mail já esta em uso.");
      }

      if(name.length < 3) {
        throw new AppError('Erro: Digite um nome válido!');
      }

      if(!email.includes("@", ".") || !email.includes(".")) {
        throw new AppError('Erro: Digite um email válido!');
      }

      if(password.length < 6) {
        throw new AppError('Erro: A senha deve ter pelo menos 6 dígitos!');
      } 

      // Password Cryptography
      const hashedPassword =await hash(password, 8);

      // Inserting user into the database
      await database.run("INSERT INTO users (name, email, password) VALUES (?,?,?)",
      [name, email, hashedPassword]
      );

      return res.status(201).json();
    }
    async update(req, res) {
      // Capturing Body Parameters and ID Parameters
      const {name, email, password, old_password } = req.body;
      const {id} = req.params;

      // Connection with Database
      const database = await sqliteConnection();
      const user = await database.get("SELECT * FROM users WHERE id = (?)", [id]);

      // Verifications
      if (!user) {
          throw new AppError("Usuário não encontrado");
      }

      const userWithUpdatedEmail = await database.get("SELECT * FROM users WHERE email = (?)", [email]);

      if(userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) {
          throw new AppError("Este e-mail já está em uso.");
      }

      user.name = name ?? user.name;
      user.email = email ?? user.email;

      if (password && !old_password) {
          throw new AppError("Você precisa informar a senha antiga para definir uma nova senha");
      }

      if (password && old_password) {
          const checkOldPassword = await compare(old_password, user.password);

          if (!checkOldPassword) {
              throw new AppError("A senha antiga não confere.");
          }

          user.password = await hash(password, 8);
      }

      // Inserting the infos into the database
      await database.run(`
          UPDATE users SET
          name = ?,
          email = ?,
          password = ?,
          updated_at = DATETIME("now")
          WHERE id = ?`,
          [user.name, user.email, user.password, id]
      );

      return res.json();
  }
}

module.exports = UsersController;
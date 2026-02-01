import { User } from '../models.js';

class UserController {
  GetAll = async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: ['id', 'username', 'email'],
      });
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  };

  GetById = async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);

      if (!user) {
        res.status(400).json({ message: 'User not found' });
      }

      res.json(user);
    } catch {
      res.status(500).json({ error: 'Server error' });
    }
  };
}

export default new UserController();

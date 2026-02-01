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
}

import 'dotenv/config';

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sequelize, User, Post, Comment } from './models.js';
import userController from './controllers/user.js';

const app = express();
app.use(express.json());

User.hasMany(Post, { foreignKey: 'userId' });
User.hasMany(Comment, { foreignKey: 'userId' });
Post.belongsTo(User, { foreignKey: 'userId' });
Post.hasMany(Comment, { foreignKey: 'postId' });
Comment.belongsTo(User, { foreignKey: 'userId' });
Comment.belongsTo(Post, { foreignKey: 'postId' });

app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400).json({ message: 'Enter all fields' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });
    res.status(201).json({
      id: user.id,
      username,
      email,
    });
  } catch (err) {
    res.status(400).json({ error: 'User already exists' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'Enter all fields' });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Incorrect data' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(401).json({ error: 'Incorrect data' });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token: token, message: 'Successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token not found' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Incorrect token' });
    req.user = user;
    next();
  });
};

app.get('/api/users', userController.GetAll);
app.get('/api/users/:id', userController.GetById);

app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.findAll();
    if (posts) {
      res.status(200).json(posts);
    }
  } catch (err) {
    res.status(500).json({ err });
  }
});

app.post('/api/posts', async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    res.status(400).json({ message: 'Enter all fields' });
  }

  try {
    const post = await Post.create({
      title,
      content,
    });

    res.status(201).json({ message: 'Post created successfully' });
  } catch (err) {
    res.status(500).json({ err });
  }
});

app.post('/api/comments', async (req, res) => {
  const { content, userId, postId } = req.body;

  if (!content || !userId || !postId) {
    res.status(400).json({ message: 'Enter all fields' });
  }

  try {
    const comment = await Comment.create({
      content,
      userId,
      postId,
    });

    res.status(201).json({ message: 'Comment created successfully' });
  } catch (err) {
    res.status(500).json({ err });
  }
});

app.put('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Enter all fields' });
  }

  try {
    const post = await Post.findOne({
      where: {
        id: parseInt(id),
      },
    });

    if (!post) {
      return res
        .status(404)
        .json({ message: 'Post not found or you have no permission' });
    }

    await post.update({ title, content });
    res.status(200).json({ message: 'Post updated successfully', post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/posts/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const post = await Post.findOne({
      where: {
        id: parseInt(id),
      },
    });

    if (!post) {
      return res
        .status(404)
        .json({ message: 'Post not found or you have no permission' });
    }

    await post.destroy();
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/profile', authenticateToken, async (req, res) => {
  const email = req.user.email;
  const user = await User.findOne({ where: { email } });
  console.log(user.username);
  res.json({ message: `Welcome, ${user.username}` });
});

const PORT = process.env.PORT || 8080;
sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
  });
});

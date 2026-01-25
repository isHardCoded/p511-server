import 'dotenv/config'

import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { sequelize, User } from './models.js'

const app = express()
app.use(express.json())

app.post('/api/auth/register', async (req, res) => {
	const { username, email, password } = req.body

	if (!username || !email || !password) {
		res.status(400).json({ message: 'Enter all fields' })
	}

	try {
		const hashedPassword = await bcrypt.hash(password, 10)
		const user = await User.create({
			username,
			email,
			password: hashedPassword,
		})
		res.status(201).json({ message: 'User created successfully' })
	} catch (err) {
		res.status(400).json({ error: 'User already exists' })
	}
})

app.post('/api/auth/login', async (req, res) => {
	const { email, password } = req.body

	if (!email || !password) {
		res.status(400).json({ message: 'Enter all fields' })
	}

	try {
		const user = await User.findOne({ where: { email } })
		if (!user) return res.status(401).json({ error: 'Incorrect data' })

		const validPassword = await bcrypt.compare(password, user.password)
		if (!validPassword) return res.status(401).json({ error: 'Incorrect data' })

		const token = jwt.sign(
			{ id: user.id, email: user.email },
			process.env.JWT_SECRET,
			{ expiresIn: '1h' }
		)

		res.json({ token: token, message: 'Successfully' })
	} catch (err) {
		res.status(500).json({ error: 'Server error' })
	}
})

const authenticateToken = (req, res, next) => {
	const authHeader = req.headers['authorization']
	const token = authHeader && authHeader.split(' ')[1]
	if (!token) return res.status(401).json({ error: 'Token not found' })

	jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
		if (err) return res.status(403).json({ error: 'Incorrect token' })
		req.user = user
		next()
	})
}

app.get('/api/users', async (req, res) => {
	try {
		const users = await User.findAll({
			attributes: ['id', 'username', 'email'],
		})
		res.json(users)
	} catch (err) {
		res.status(500).json({ error: 'Server error' })
	}
})

app.get('/profile', authenticateToken, async (req, res) => {
	const email = req.user.email
	const user = await User.findOne({ where: { email } })
	console.log(user.username)
	res.json({ message: `Welcome, ${user.username}` })
})

const PORT = process.env.PORT || 8080
sequelize.sync().then(() => {
	app.listen(PORT, () => {
		console.log(`Сервер запущен на порту ${PORT}`)
	})
})

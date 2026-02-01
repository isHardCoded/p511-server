import { Sequelize, DataTypes } from 'sequelize'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const sequelize = new Sequelize({
	dialect: 'sqlite',
	storage: path.join(__dirname, 'database.sqlite'),
})

export const User = sequelize.define('User', {
	username: {
		type: DataTypes.STRING,
		unique: true,
		allowNull: false,
	},
	email: {
		type: DataTypes.STRING,
		unique: true,
		allowNull: false,
	},
	password: {
		type: DataTypes.STRING,
		allowNull: false,
	},
})

export const Post = sequelize.define('Post', {
	title: {
		type: DataTypes.STRING,
		allowNull: false
	},
	content: {
		type: DataTypes.STRING,
		allowNull: false
	}
})

export const Comment = sequelize.define('Comment', {
	content: {
		type: DataTypes.STRING,
		allowNull: false
	},
	userId: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
	postId: {
		type: DataTypes.INTEGER,
		allowNull: false
	}
})
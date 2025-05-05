import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db = null;

async function initializeDatabase() {
    try {
        db = await open({
            filename: './database.db',
            driver: sqlite3.Database
        });

        await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        login TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        password TEXT NOT NULL
      )
    `);

        await db.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        message TEXT NOT NULL,
        destination_id INTEGER NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (destination_id) REFERENCES users(id)
      )
    `);

        console.log('Database initialized successfully');
        return db;
    } catch (error) {
        console.error('Database initialization error:', error.message);
        throw error;
    }
}

async function createUser(login, name, password) {
    try {
        const existingUser = await db.get('SELECT * FROM users WHERE login = ?', [login]);
        if (existingUser) {
            throw new Error('User already exists');
        }
        return await db.run(
            'INSERT INTO users (login, name, password) VALUES (?, ?, ?)',
            [login, name, password]
        );
    } catch (error) {
        console.error('Error creating user:', error.message);
        throw error;
    }
}

async function getUserByLogin(login) {
    try {
        return await db.get('SELECT * FROM users WHERE login = ?', [login]);
    } catch (error) {
        console.error('Error getting user by login:', error.message);
        throw error;
    }
}

async function loginUser(login, password) {
    try {
        const user = await db.get('SELECT * FROM users WHERE login = ? AND password = ?', [login, password]);
        if (!user) {
            throw new Error('Invalid login or password');
        }
        return user;
    } catch (error) {
        console.error('Error logging in:', error.message);
        throw error;
    }
}

async function getUserById(id) {
    try {
        return await db.get('SELECT * FROM users WHERE id = ?', [id]);
    } catch (error) {
        console.error('Error getting user by id:', error.message);
        throw error;
    }
}

// Message operations
async function saveMessage(userId, message, destinationId) {
    try {
        return await db.run(
            'INSERT INTO messages (user_id, message, destination_id) VALUES (?, ?, ?)',
            [userId, message, destinationId]
        );
    } catch (error) {
        console.error('Error saving message:', error.message);
        throw error;
    }
}

async function getMessagesBetweenUsers(userId, destinationId) {
    try {
        return await db.all(
            `SELECT * FROM messages 
       WHERE (user_id = ? AND destination_id = ?) 
       OR (user_id = ? AND destination_id = ?)
       ORDER BY timestamp ASC`,
            [userId, destinationId, destinationId, userId]
        );
    } catch (error) {
        console.error('Error getting messages between users:', error.message);
        throw error;
    }
}

async function getChatsFromAUser(userId) {
    try {
        return await db.all(
            `SELECT DISTINCT destination_id FROM messages WHERE user_id = ?`,
            [userId]
        );
    } catch (error) {
        console.error('Error getting chats from a user:', error.message);
        throw error;
    }
}

async function getAllUsers() {
    try {
        return await db.all('SELECT * FROM users');
    } catch (error) {
        console.error('Error getting all users:', error.message);
        throw error;
    }
}


// Initialize the database on module import
const initialize = initializeDatabase();

export {
    initialize,
    createUser,
    loginUser,
    getUserByLogin,
    getUserById,
    saveMessage,
    getMessagesBetweenUsers,
    getChatsFromAUser,
    getAllUsers
};
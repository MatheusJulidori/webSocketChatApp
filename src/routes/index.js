import { Router } from "express";

import { getChatsFromAUser, getMessagesBetweenUsers, createUser, loginUser, getUserById, getAllUsers } from "../database/database.js";

const router = Router();

router.get("/chats", (req, res) => {
    const userId = req.user.id;
    getChatsFromAUser(userId)
        .then(chats => res.json(chats))
        .catch(error => res.status(500).json({ error: error.message }));
});

router.get("/chats/:id", (req, res) => {
    const userId = req.user.id;
    const destinationId = req.params.id;
    getMessagesBetweenUsers(userId, destinationId)
        .then(messages => res.json(messages))
        .catch(error => res.status(500).json({ error: error.message }));
}
);

router.get("/users/:id", (req, res) => {
    const userId = req.params.id;
    getUserById(userId)
        .then(user => res.json(user))
        .catch(error => res.status(500).json({ error: error.message }));
}
);

router.post("/users", (req, res) => {
    const { login, name, password } = req.body;
    createUser(login, name, password)
        .then(user => res.status(201).json(user))
        .catch(error => res.status(500).json({ error: error.message }));
});

router.post("/login", (req, res) => {
    const { login, password } = req.body;
    loginUser(login, password)
        .then(user => res.status(200).json(user))
        .catch(error => res.status(401).json({ error: error.message }));
});

router.get("/users", async (req, res) => {
    try {
        console.log("API: Fetching all users");
        const users = await getAllUsers();
        console.log("API: Users fetched successfully:", users);
        res.json(users);
    } catch (error) {
        console.error("API: Error fetching users:", error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
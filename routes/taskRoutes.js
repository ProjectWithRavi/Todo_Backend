const express = require("express");
const { check } = require("express-validator");
const taskController = require("../controllers/taskController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Create Task (User must be logged in)
router.post(
  "/",
  authMiddleware, // Ensure the user is logged in
  [
    check("title", "Title is required").not().isEmpty(),
    check("description", "Description is required").not().isEmpty(),
  ],
  taskController.createTask
);

// Route to update a task's completion status
router.put("/updateTodo/:taskId", authMiddleware, taskController.updateTask);

// Route to delete a task
router.delete("/deleteTodo/:taskId", authMiddleware, taskController.deleteTask);

// Get All Tasks for the logged-in user
router.get("/", authMiddleware, taskController.getTasks);

// Update Task Completion Status
router.put("/:taskId", authMiddleware, taskController.updateCompleteStatus);

module.exports = router;

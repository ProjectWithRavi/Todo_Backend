const Task = require("../models/Task");

// Create a new task
exports.createTask = async (req, res) => {
  const { title, description } = req.body;

  try {
    const newTask = new Task({
      title,
      description,
      user: req.user, // Link the task to the logged-in user
    });

    await newTask.save();
    res.status(201).json(newTask);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Get all tasks for the logged-in user
exports.getTasks = async (req, res) => {
  try {
    const { search } = req.query; // Get search query from request
    let query = { user: req.user }; // Filter tasks for the logged-in user

    if (search) {
      const searchQuery = {
        $or: [
          { title: { $regex: search, $options: "i" } }, // Case-insensitive search in title
          { description: { $regex: search, $options: "i" } }, // Case-insensitive search in description
        ],
      };

      query = { ...query, ...searchQuery }; // Merge search criteria into the existing query object
    }
    
    const tasks = await Task.find(query); // Fetch tasks for the current user
    // const tasks = await Task.find({ user: req.user }); // Fetch tasks for the current user
    console.log(tasks)
    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Update task title and description
exports.updateTask = async (req, res) => {
  const { taskId } = req.params;
  const { title, description } = req.body; // Get title and description from the request body

  try {
    // Find the task by ID and ensure it belongs to the logged-in user
    const task = await Task.findOne({ _id: taskId, user: req.user });

    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }

    // Update the title and description of the task
    if (title) task.title = title; // Update the title if provided
    if (description) task.description = description; // Update the description if provided

    // Save the updated task
    await task.save();

    // Return the updated task as the response
    res.status(201).json(task);
    // res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
};

// Update task completion status
exports.updateCompleteStatus = async (req, res) => {
  const { taskId } = req.params;
  const { complete } = req.body;

  try {
    const task = await Task.findOne({ _id: taskId, user: req.user }); // Find task by ID and user

    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }

    task.complete = complete; // Update the completion status
    await task.save();

    res.json(task);
    // Return the updated task
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  const { taskId } = req.params;

  try {
    // Find the task by its ID and ensure it belongs to the logged-in user
    const task = await Task.findOneAndDelete({ _id: taskId, user: req.user });

    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }

    res.json({ msg: "Task deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

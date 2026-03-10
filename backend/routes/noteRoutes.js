const express = require("express");
const Note = require("../models/Note");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// CREATE NOTE
router.post("/", authMiddleware, async (req, res) => {

  try {

    const note = new Note({
      title: req.body.title,
      content: req.body.content,
      owner: req.user.id
    });

    await note.save();

    res.json(note);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }

});


// GET ALL NOTES
router.get("/", authMiddleware, async (req, res) => {

  try {

    const notes = await Note.find({
      $or: [
        { owner: req.user.id },
        { collaborators: req.user.id }
      ]
    });

    res.json(notes);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }

});


// UPDATE NOTE
router.put("/:id", authMiddleware, async (req, res) => {

  try {

    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    if (note.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    note.title = req.body.title || note.title;
    note.content = req.body.content || note.content;

    await note.save();

    res.json(note);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }

});


// DELETE NOTE
router.delete("/:id", authMiddleware, async (req, res) => {

  try {

    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    if (note.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await note.deleteOne();

    res.json({ message: "Note deleted successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }

});


module.exports = router;
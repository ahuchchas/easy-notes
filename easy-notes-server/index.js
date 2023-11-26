const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

const app = express();
dotenv.config();
//middleware
app.use(express.json());
app.use(cors());

app.get("/", async (req, res) => {
  res.send("easy notes server is running");
});

const client = new MongoClient(process.env.MONGODBURL);
async function run() {
  try {
    const database = client.db("easy-notes");
    const notes = database.collection("notes");

    //get notes
    app.get("/api/notes", async (req, res) => {
      try {
        const cursor = notes.find();
        const allnotes = await cursor.toArray();
        res.json(allnotes);
      } catch (error) {
        res.status(500).send("something is wrong! can't get notes");
      }
    });

    //add note
    app.post("/api/notes", async (req, res) => {
      const note = req.body;

      if (!note.noteTitle || !note.noteContent) {
        return res.status(400).send("title and content is required");
      }

      try {
        const result = await notes.insertOne(note);
        res.json(result);
      } catch (error) {
        res.status(500).send("something is wrong! can't create note");
      }
    });

    //update note
    app.put("/api/notes/:id", async (req, res) => {
      const note = req.body;
      const id = req.params.id;

      if (!id) {
        return res.status(400).send("id is required!");
      }
      try {
        const filter = { _id: new ObjectId(id) };
        const options = { upsert: true };
        const updatedDoc = {
          $set: {
            noteTitle: note.noteTitle,
            noteContent: note.noteContent,
          },
        };
        const result = await notes.updateOne(filter, updatedDoc, options);
        res.json(result);
      } catch (error) {
        res.status(500).send("something is wrong! can't update note");
      }
    });

    //delete a note
    app.delete("/api/notes/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      try {
        const result = await notes.deleteOne(query);
        res.json(result);
      } catch (error) {
        res.status(500).send("something is wrong! can't delete note");
      }
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`easy notes running on port: ${port}`);
});

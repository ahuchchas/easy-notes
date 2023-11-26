import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [notes, setNotes] = useState([]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [selectedNote, setSelectedNote] = useState(null);
  // const serverBaseUrl = "http://localhost:5000";
  const serverBaseUrl = "https://easy-notes-server.vercel.app";

  async function fetchNotes() {
    try {
      const response = await fetch(`${serverBaseUrl}/api/notes`);
      const notelist = await response.json();

      setNotes(notelist);
    } catch (error) {
      alert("can't fetch note from server");
      console.log(error.message);
    }
  }
  useEffect(() => {
    fetchNotes();
  }, []);

  //add note
  const handleAddNote = async (event) => {
    event.preventDefault();
    try {
      await fetch(`${serverBaseUrl}/api/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ noteTitle: title, noteContent: content }),
      });
      fetchNotes();
      setTitle("");
      setContent("");
    } catch (error) {
      console.log(error);
    }
  };
  //update note
  const handleUpdateNote = async (event) => {
    event.preventDefault();
    if (!selectedNote) {
      return;
    }

    try {
      await fetch(`${serverBaseUrl}/api/notes/${selectedNote._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ noteTitle: title, noteContent: content }),
      });
      fetchNotes();
      setTitle("");
      setContent("");
      setSelectedNote(null);
    } catch (error) {
      console.log(error);
    }
  };
  const handleNoteClick = (note) => {
    setSelectedNote(note);
    setTitle(note.noteTitle);
    setContent(note.noteContent);
  };

  const handleCancel = () => {
    setTitle("");
    setContent("");
    setSelectedNote(null);
  };

  const deleteNote = async (event, noteId) => {
    event.stopPropagation();

    try {
      await fetch(`${serverBaseUrl}/api/notes/${noteId}`, {
        method: "DELETE",
      });
      fetchNotes();
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      <div>
        <h1 className="header">Easy Notes</h1>
      </div>
      <div className="app-container">
        <form className="note-form">
          <input
            placeholder="Title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="Content"
            rows={10}
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          {selectedNote ? (
            <div className="edit-buttons">
              <button onClick={(event) => handleUpdateNote(event)}>Save</button>
              <button onClick={handleCancel}>Cancel</button>
            </div>
          ) : (
            <button type="submit" onClick={(event) => handleAddNote(event)}>
              Add Note
            </button>
          )}
        </form>
        <div className="notes-grid">
          {notes.map((note) => (
            <div
              key={note._id}
              className="note-item"
              onClick={() => handleNoteClick(note)}
            >
              <div className="notes-header">
                <button onClick={(event) => deleteNote(event, note._id)}>
                  x
                </button>
              </div>
              <h2>{note.noteTitle}</h2>
              <p>{note.noteContent}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default App;

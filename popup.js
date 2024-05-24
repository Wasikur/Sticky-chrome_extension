// Retrieve existing notes from storage or initialize empty array
chrome.storage.sync.get("notes", function (data) {
  let notes = data.notes || [];
  renderNotes(notes);
});

// Rendering notes on the popup
function renderNotes(notes) {
  const notesContainer = document.getElementById("notes-container");
  notesContainer.innerHTML = "";
  notes
    .slice()
    .reverse()
    .forEach((note, index) => {
      const noteElement = document.createElement("div");
      noteElement.classList.add("note");

      // Creating a span for the note number
      const noteNumber = document.createElement("span");
      noteNumber.classList.add("note-number");
      noteNumber.textContent = `${notes.length - index}. `;

      // Creating a span for the note text
      const noteText = document.createElement("span");
      noteText.innerHTML = note;

      // Appending the note number and note text to the note element
      noteElement.appendChild(noteNumber);
      noteElement.appendChild(noteText);

      // Creating a container for the buttons
      const buttonContainer = document.createElement("div");
      buttonContainer.classList.add("button-container");

      // Creating a delete button for each note
      const deleteButton = document.createElement("button");
      deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
      deleteButton.classList.add("delete-button");
      deleteButton.dataset.index = index;
      deleteButton.addEventListener("click", function () {
        deleteNoteAtIndex(notes.length - 1 - index);
      });

      // Creating an edit button for each note
      const editButton = document.createElement("button");
      editButton.innerHTML = '<i class="fas fa-edit"></i>'; // Using FontAwesome edit icon
      editButton.classList.add("edit-button");
      editButton.dataset.index = index;
      editButton.addEventListener("click", function () {
        editNoteAtIndex(notes.length - 1 - index);
      });

      // Appending the buttons to the button container
      buttonContainer.appendChild(editButton);
      buttonContainer.appendChild(deleteButton);

      // Appending the button container to the note element
      noteElement.appendChild(buttonContainer);

      notesContainer.appendChild(noteElement);
    });
}

// Function to delete a note at a specific index
function deleteNoteAtIndex(index) {
  chrome.storage.sync.get("notes", function (data) {
    let notes = data.notes || [];
    notes.splice(index, 1); // Removing the note at the specified index
    chrome.storage.sync.set({ notes: notes }, function () {
      renderNotes(notes); // Rendering the updated notes
    });
  });
}

// Function to edit a note at a specific index
function editNoteAtIndex(index) {
  chrome.storage.sync.get("notes", function (data) {
    let notes = data.notes || [];
    let existingNote = notes[index];

    // Converting <br> tags back to newline characters for editing
    existingNote = existingNote.replace(/<br>/g, "\n");

    // Removing any existing edit dialogs
    const existingDialog = document.querySelector(".note-edit-dialog");
    if (existingDialog) {
      document.body.removeChild(existingDialog);
    }

    const editNoteTextArea = document.createElement("textarea");
    editNoteTextArea.value = existingNote;
    editNoteTextArea.placeholder = "Edit your note...";
    editNoteTextArea.classList.add("edit-note-textarea");

    const confirmButton = document.createElement("button");
    confirmButton.textContent = "Confirm";
    confirmButton.classList.add("confirm-button");

    const cancelButton = document.createElement("button");
    cancelButton.textContent = "Cancel";
    cancelButton.classList.add("cancel-button");

    const noteEditDialog = document.createElement("div");
    noteEditDialog.classList.add("note-edit-dialog");
    noteEditDialog.appendChild(editNoteTextArea);
    noteEditDialog.appendChild(confirmButton);
    noteEditDialog.appendChild(cancelButton);
    document.body.appendChild(noteEditDialog);

    confirmButton.addEventListener("click", function () {
      let editedNote = editNoteTextArea.value.trim();
      if (editedNote !== "") {
        editedNote = editedNote.replace(/\n/g, "<br>");
        notes[index] = editedNote;
        chrome.storage.sync.set({ notes: notes }, function () {
          renderNotes(notes);
        });
      }
      document.body.removeChild(noteEditDialog);
    });

    cancelButton.addEventListener("click", function () {
      document.body.removeChild(noteEditDialog);
    });
  });
}

// Event listener for adding a new note
document.getElementById("add-note").addEventListener("click", function () {
  const newNoteTextArea = document.createElement("textarea");
  newNoteTextArea.placeholder = "Enter your note...";
  newNoteTextArea.classList.add("new-note-textarea");

  const confirmButton = document.createElement("button");
  confirmButton.textContent = "Confirm";
  confirmButton.classList.add("confirm-button");

  const cancelButton = document.createElement("button");
  cancelButton.textContent = "Cancel";
  cancelButton.classList.add("cancel-button");

  const noteEntryDialog = document.createElement("div");
  noteEntryDialog.classList.add("note-entry-dialog");
  noteEntryDialog.appendChild(newNoteTextArea);
  noteEntryDialog.appendChild(confirmButton);
  noteEntryDialog.appendChild(cancelButton);
  document.body.appendChild(noteEntryDialog);

  confirmButton.addEventListener("click", function () {
    let newNote = newNoteTextArea.value.trim();
    if (newNote !== "") {
      newNote = newNote.replace(/\n/g, "<br>");
      chrome.storage.sync.get("notes", function (data) {
        let notes = data.notes || [];
        notes.push(newNote);
        chrome.storage.sync.set({ notes: notes }, function () {
          renderNotes(notes);
        });
      });
    }
    document.body.removeChild(noteEntryDialog);
  });

  cancelButton.addEventListener("click", function () {
    document.body.removeChild(noteEntryDialog);
  });
});

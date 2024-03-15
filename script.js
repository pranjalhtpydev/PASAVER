// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD6Qk3qbmfOx-rdvV5uoKF5LQUOetqmqmU",
  authDomain: "pvtapp-2bc55.firebaseapp.com",
  databaseURL: "https://pvtapp-2bc55-default-rtdb.firebaseio.com",
  projectId: "pvtapp-2bc55",
  storageBucket: "pvtapp-2bc55.appspot.com",
  messagingSenderId: "453114866514",
  appId: "1:453114866514:web:c725175a186caec822688b",
  measurementId: "G-NV9BTR8HCG"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const firestore = firebase.firestore();
const storage = firebase.storage().ref();

// Sign in with email and password
function signInWithEmailAndPassword() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (email && password) {
    auth
      .signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        displayAuthForm(false);
        displayAppForm(true);
        displayPasswordList(true);
        fetchPasswordsFromFirestore(userCredential.user.uid);
        clearInputFields("email", "password");
        displayMessage("Sign-in successful", "success");
      })
      .catch((error) => {
        displayMessage(error.message, "error");
      });
  } else {
    displayMessage("Please enter your email and password", "error");
  }
}

// Create user with email and password
function createUserWithEmailAndPassword() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (email && password) {
    auth
      .createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        displayAuthForm(false);
        displayAppForm(true);
        displayPasswordList(true);
        fetchPasswordsFromFirestore(userCredential.user.uid);
        clearInputFields("email", "password");
        displayMessage("User created successfully", "success");
      })
      .catch((error) => {
        displayMessage(error.message, "error");
      });
  } else {
    displayMessage("Please enter your email and password", "error");
  }
}

// Save password to Firestore
function savePassword() {
  const userId = auth.currentUser.uid;
  const appName = document.getElementById("appName").value;
  const appPassword = document.getElementById("appPassword").value;

  if (appName && appPassword) {
    firestore
      .collection("users")
      .doc(userId)
      .collection("apps")
      .doc(appName)
      .set({ password: appPassword })
      .then(() => {
        fetchPasswordsFromFirestore(userId);
        clearInputFields("appName", "appPassword");
        displayMessage("Password saved to Firestore", "success");
      })
      .catch((error) => {
        displayMessage("Error saving password to Firestore: " + error.message, "error");
      });
  } else {
    displayMessage("Please enter the app name and password", "error");
  }
}

// Fetch passwords from Firestore
function fetchPasswordsFromFirestore(userId) {
  const passwordList = document.getElementById("passwordList");
  passwordList.innerHTML = "";

  firestore
    .collection("users")
    .doc(userId)
    .collection("apps")
    .get()
    .then((querySnapshot) => {
      const appPasswords = new Set(); // Use a Set to store unique app passwords
      querySnapshot.forEach((doc) => {
        const appName = doc.id;
        const password = doc.data().password;
        if (!appPasswords.has(`${appName}:${password}`)) {
          appPasswords.add(`${appName}:${password}`);
          const listItem = document.createElement("li");
          const spanElement = document.createElement("span");
          const editButton = document.createElement("button");
          const deleteButton = document.createElement("button");

          spanElement.textContent = `App Name: ${appName} | Password: ${password}`;
          editButton.innerHTML = '<i class="fas fa-edit"></i>';
          editButton.onclick = () => editPassword(appName, password);
          deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
          deleteButton.onclick = () => deletePassword(appName, password);

          listItem.appendChild(spanElement);
          listItem.appendChild(editButton);
          listItem.appendChild(deleteButton);
          passwordList.appendChild(listItem);
        }
      });
    })
    .catch((error) => {
      displayMessage("Error fetching passwords from Firestore: " + error.message, "error");
    });
}

// Edit password
function editPassword(appName, currentPassword) {
  const newPassword = prompt("Enter the new password", currentPassword);
  if (newPassword !== null) {
    const userId = auth.currentUser.uid;
    firestore
      .collection("users")
      .doc(userId)
      .collection("apps")
      .doc(appName)
      .update({ password: newPassword })
      .then(() => {
        fetchPasswordsFromFirestore(userId);
        displayMessage("Password updated successfully", "success");
      })
      .catch((error) => {
        displayMessage("Error updating password: " + error.message, "error");
      });
  }
}

// Delete password
function deletePassword(appName, password) {
  const confirmDelete = confirm(`Are you sure you want to delete the password for ${appName}?`);
  if (confirmDelete) {
    const userId = auth.currentUser.uid;
    firestore
      .collection("users")
      .doc(userId)
      .collection("apps")
      .doc(appName)
      .delete()
      .then(() => {
        fetchPasswordsFromFirestore(userId);
        displayMessage("Password deleted successfully", "success");
      })
      .catch((error) => {
        displayMessage("Error deleting password: " + error.message, "error");
      });
  }
}

// Generate password
function generatePassword() {
  const length = 12;
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+~`|}{[]:;?><,./-=";
  let password = "";

  for (let i = 0; i < length; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }

  document.getElementById("appPassword").value = password;
  document.getElementById("copyPassword").disabled = false;
}

// Copy password to clipboard
function copyPassword() {
  const passwordInput = document.getElementById("appPassword");
  passwordInput.select();
  document.execCommand("copy");
  displayMessage("Password copied to clipboard", "success");
}

// Sign out
function signOut() {
  auth.signOut().then(() => {
    displayAuthForm(true);
    displayAppForm(false);
    displayPasswordList(false);
    displayMessage("Sign-out successful", "success");
  }).catch((error) => {
    displayMessage("Error signing out: " + error.message, "error");
  });
}

// Reset password
function resetPassword() {
  const email = document.getElementById("email").value;
  if (email) {
    auth.sendPasswordResetEmail(email)
      .then(() => {
        displayMessage("Password reset email sent", "success");
      })
      .catch((error) => {
        displayMessage(error.message, "error");
      });
  } else {
    displayMessage("Please enter your email", "error");
  }
}

// Update user profile
function updateUserProfile() {
  const displayName = document.getElementById("displayName").value;
  const profilePicture = document.getElementById("profilePicture").files[0];

  const user = auth.currentUser;

  if (displayName) {
    user.updateProfile({
      displayName: displayName
    }).then(() => {
      displayMessage("Display name updated successfully", "success");
    }).catch((error) => {
      displayMessage("Error updating display name: " + error.message, "error");
    });
  }

  if (profilePicture) {
    const uploadTask = storage.child(`profile-pictures/${user.uid}`).put(profilePicture);
    uploadTask.on('state_changed',
      (snapshot) => {
        // Progress function...
      },
      (error) => {
        displayMessage("Error uploading profile picture: " + error.message, "error");
      },
      () => {
        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
          user.updateProfile({
            photoURL: downloadURL
          }).then(() => {
            displayMessage("Profile picture updated successfully", "success");
          }).catch((error) => {
            displayMessage("Error updating profile picture: " + error.message, "error");
          });
        });
      }
    );
  }

  closeSettingsModal();
}

// Clear input fields
function clearInputFields(...fieldIds) {
  fieldIds.forEach(fieldId => {
    document.getElementById(fieldId).value = "";
  });
}

// Show settings modal
function showSettingsModal() {
  const settingsModal = document.getElementById("settingsModal");
  settingsModal.style.display = "block";
}

// Close settings modal
function closeSettingsModal() {
  const settingsModal = document.getElementById("settingsModal");
  settingsModal.style.display = "none";
}

// Display or hide authentication form
function displayAuthForm(show) {
  const authForm = document.getElementById("authForm");
  authForm.style.display = show ? "block" : "none";
}

// Display or hide app form
function displayAppForm(show) {
  const appForm = document.getElementById("appForm");
  appForm.style.display = show ? "block" : "none";
}

// Display or hide password list
function displayPasswordList(show) {
  const passwordList = document.getElementById("passwordList");
  passwordList.style.display = show ? "block" : "none";
}

// Display message
function displayMessage(message, type) {
  const messageDiv = document.getElementById("message");
  messageDiv.textContent = message;
  messageDiv.classList.add(type);
  setTimeout(() => {
    messageDiv.textContent = "";
    messageDiv.classList.remove(type);
  }, 3000);
}

// Detect recent sign-in method and sign in user
auth.onAuthStateChanged((user) => {
  if (user) {
    displayAuthForm(false);
    displayAppForm(true);
    displayPasswordList(true);
    fetchPasswordsFromFirestore(user.uid);
  } else {
    displayAuthForm(true);
    displayAppForm(false);
    displayPasswordList(false);
  }
});
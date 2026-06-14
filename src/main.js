const firebaseConfig = {
  apiKey: "AIzaSyChhzqIKM9LOY_LGPZrbvUurMrH8GlZBjI",
  authDomain: "pystart-b38e2.firebaseapp.com",
  projectId: "pystart-b38e2",
  storageBucket: "pystart-b38e2.firebasestorage.app",
  messagingSenderId: "513344854145",
  appId: "1:513344854145:web:1863d16bfdbc3c50a65580"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();  

async function signUp(email, password, username) {
  const userCredential =
    await auth.createUserWithEmailAndPassword(email, password);

  const user = userCredential.user;

  await db.collection("users").doc(user.uid).set({
    uName: username,
    createdAt: Date.now()
  });

  return user;
}


async function login(email, password) {
  try {
    const userCredential =
      await auth.signInWithEmailAndPassword(email, password);

    const user = userCredential.user;

    console.log("Logged in:", user.uid);

    return user;
  } catch (err) {
    alert(err.message);
  }
}


function saveData(uid, data) {
  return db.collection("users").doc(uid).set({
    data: data
  }, { merge: true });
}


function loadData(uid) {
  return db.collection("users").doc(uid)
    .get()
    .then(doc => {
      return doc.data();
    });
}


function updateData(uid, data) {
  return db.collection("users").doc(uid)
    .set(data, { merge: true })
    .then(() => {
      console.log("Data updated");
    })
    .catch(err => {
      alert(err.message);
    });
}




function popup(message) {
  // create popup container
  const popup = document.createElement("div");
  popup.style.position = "fixed";
  popup.style.top = "50%";
  popup.style.left = "50%";
  popup.style.transform = "translate(-50%, -50%)";
  popup.style.padding = "20px";
  popup.style.background = "white";
  popup.style.border = "2px solid black";
  popup.style.zIndex = "1000";
  popup.style.boxShadow = "0 4px 10px rgba(0,0,0,0.3)";

  // message
  popup.innerHTML = `<h1>${message}</h1>`;

  // close on click
  popup.onclick = () => popup.remove();

  document.body.appendChild(popup);
}

async function loadLeaderboard() {

    const snapshot = await db.collection("users")
        .orderBy("points", "desc")
        .limit(10)
        .get();

    const leaderboard = [];

    snapshot.forEach(doc => {
        leaderboard.push(doc.data());
    });

    return leaderboard;
}

async function getUserRank(uid) {

    const snapshot = await db.collection("users")
        .orderBy("points", "desc")
        .get();

    let rank = 1;

    for (const doc of snapshot.docs) {

        if (doc.id === uid) {
            return rank;
        }

        rank++;
    }

    return null;
}

function addPoints(uid, pointsToAdd) {
    return db.collection("users").doc(uid).update({
        points: firebase.firestore.FieldValue.increment(pointsToAdd)
    });
}
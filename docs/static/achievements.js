import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {getFirestore, collection , doc, setDoc, getDoc} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import { GoogleAuthProvider , getAuth, signInWithPopup, signOut, setPersistence, browserSessionPersistence} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { appwrite_pid,firebaseConfig} from "../static/config.js";

const client = new window.Appwrite.Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(appwrite_pid);

const storage = new window.Appwrite.Storage(client);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const adminRef = doc(db, "admin", "users");
const admin = await getDoc(adminRef);
const users = admin.data();

setPersistence(auth, browserSessionPersistence)
  .then(() => {
    // Persistence set successfully
    console.log("working");
  })
  .catch((error) => {
    // Error setting persistence
    console.error("Error setting persistence:", error);
  });

auth.onAuthStateChanged((user)=>{
  if(user){
    let allowed = 0;
    for(let ukey in users){
      if(user.uid == users[ukey]){allowed = 1;}
    }
    if(!allowed){window.alert("Error 401 : unauthorized"); window.location.href='../';}
  }
  else{window.alert("Error 401 : unauthorized"); window.location.href='../';}
});


let controller = new AbortController();

const homePath = "../index.html";
const achForm = document.getElementById('ach-form');
const save = document.getElementById("ach-save");
const can = document.getElementById("ach-cancel");

save.addEventListener('click', async (event)=>{
    event.preventDefault();
    controller.abort();
    controller = new AbortController();
    const signal = controller.signal;
    
    const eventName = document.getElementById('ach-event').value;
    const title = document.getElementById('ach-title').value;
    const desc = document.getElementById('ach-desc').value;
    const date  = document.getElementById('event-date').value;
    try{
        let eve = await getEvent(eventName);
        const memberCount = Object.keys(eve).length+1;
        eve[memberCount] = {
            title : title,
            description : desc,
            date : date
        }
        await setDoc(doc(db, "achievements",eventName),eve, {signal});
        console.log("Activity submitted");
        setTimeout(()=>{
        achForm.reset();
        window.location.href =homePath;
        },700);
    }catch(e){
        console.log("Error adding member:", e);
    }
})

can.addEventListener('click', (event)=>{
    controller.abort();
    achForm.reset();
    window.location.href = homePath;
});

async function getEvent(event){
    const snap = await getDoc(doc(db, "achievements", event));
    if(snap.data()==null){
        return {};
    }
    return snap.data();
}
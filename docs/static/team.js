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
const teamForm = document.getElementById('team-form');
const save = document.getElementById("mem-save");
const can = document.getElementById("mem-cancel");

save.addEventListener('click', async (event)=>{
    event.preventDefault();
    controller.abort();
    controller = new AbortController();
    const signal = controller.signal;
    const year = document.getElementById('mem-year').value;
    const name = document.getElementById('mem-name').value;
    const dsgn = document.getElementById('mem-dsgn').value;
    const photo = document.getElementById('mem-img').files[0];
    if(!(name && dsgn && year && photo)){
        alert("Incomplete Fields");
        return;
    }
    try{
        let team = await getTeam(year);
        const memberCount = Object.keys(team).length+1;
        team[memberCount] = {
            name:name,
            designation : dsgn,
        };
        const promise = storage.createFile(
            '679d7ffd002633f04d7b',
            `team-${year}-member-${memberCount}`,
            photo
        );
        console.log("adding");
        await promise.then(function (res){
        console.log("Image added to bucket");
        }, function (error){
        console.log(promise);

            console.log(error);
        })
        await setDoc(doc(db, "team", `year-${year}`),team, {signal});
        console.log("Activity submitted");
        setTimeout(()=>{
        teamForm.reset();
        window.location.href =homePath;
        },700);
    }catch(e){
        console.log("Error adding member:", e);
    }
})

can.addEventListener('click', (event)=>{
    controller.abort();
    teamForm.reset();
    window.location.href = homePath;
});

async function getTeam(year){
    const snap = await getDoc(doc(db, "team",`year-${year}`));
    if(snap.data()==null){
        return {};
    }
    return snap.data();

}
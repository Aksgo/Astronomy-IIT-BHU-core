import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {getFirestore, collection , doc, setDoc, getDocs, getDoc} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import {getAuth,setPersistence, browserSessionPersistence} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
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
let counter = 0;

const homePath = "../index.html";
const actform = document.getElementById('act-form');
const save = document.getElementById('act-save');
const can = document.getElementById('act-cancel');

countAct();

save.addEventListener('click', async (event)=>{
    event.preventDefault();
    controller.abort();
    controller = new AbortController();
    const signal = controller.signal;

    const title = document.getElementById('act-title').value;
    const des = document.getElementById('act-des').value;
    const actImg = document.getElementById('act-img').files[0];
    if(!(title && des && actImg)){
        alert("All fields must be filled!");
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }
    try{
        const promise = storage.createFile(
            '679d7ffd002633f04d7b',
            `activity-${counter+1}`,
            actImg
        );
        console.log("adding");
        await promise.then(function (res){
        console.log("Image added to bucket");
        }, function (error){
        console.log(promise);

            console.log(error);
        })
        await setDoc(doc(db, "activities",`activity-${counter+1}`),{
        title: title,
        description: des,
        }, {signal});
        console.log("Activity submitted");
        setTimeout(()=>{
        actform.reset();
        window.location.href =homePath;
        },700);
    }
    catch(e){
        console.log("Error adding activites :", e);
    }
});

can.addEventListener('click', (event)=>{
    controller.abort();
    actform.reset();
    window.location.href=homePath;
});

async function countAct() {
    counter = 0;
    const snap =await getDocs(collection(db, "activities"));
    snap.forEach(element => {
        counter++;
    });
}
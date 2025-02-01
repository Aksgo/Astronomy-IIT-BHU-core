import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {getFirestore, collection , doc, setDoc, getDocs, getDoc} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import {getAuth,setPersistence, browserSessionPersistence} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { appwrite_pid,firebaseConfig} from "../static/config.js";
//note that nextjs project is working with fierbase sdk not cdn

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


auth.onAuthStateChanged((user)=>{
  if(user){
    let allowed = 0;
    for(let ukey in users){
      if(user.uid == users[ukey]){allowed = 1;}
    }
    if(!allowed){window.alert("Error 401 : unauthorized"); window.location.href='../index.html';}
  }
  else{window.alert("Error 401 : unauthorized"); window.location.href='../index.html';}
});

setPersistence(auth, browserSessionPersistence)
  .then(() => {
    // Persistence set successfully
    console.log("working");
  })
  .catch((error) => {
    // Error setting persistence
    console.error("Error setting persistence:", error);
  });

let controller = new AbortController();
let pcount = 0;
extractProject();

const homePath = "../index.html";
const projectForm = document.getElementById("project-form");
const psave = document.getElementById("project-save");
const pcancel = document.getElementById("project-cancel");

psave.addEventListener('click',async (event)=>{
    event.preventDefault();
    controller.abort();
    controller = new AbortController();
    const signal = controller.signal;

    const title = document.getElementById('project-title').value;
    const des = document.getElementById('project-des').value;
    const projectImg = document.getElementById('project-img').files[0];
    if(!(title && des && projectImg)){
        alert("All fields must be filled!");
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    try{
      //adding to appwrite
      const promise = storage.createFile(
        '67840116003980398e18',
        `project-${pcount+1}`,
        projectImg
      );
      promise.then(function (res){
        console.log("Image added to bucket");
      }, function (error){
          console.log(error);
      })

      //adding to firebase
        await setDoc(doc(db, "projects",`project-${pcount+1}`),{
          title: title,
          description: des,
        }, {signal});
        console.log("Project submitted");
        setTimeout(()=>{
          projectForm.reset();
          window.location.href ="../index.html";
        });
    }
    catch(e){
        console.log("Error in Database :", e);
    }

});

pcancel.addEventListener('click',(event)=>{
    controller.abort();
    projectForm.reset();
    window.location.href = homePath;
});


async function extractProject() {
  pcount = 0;
  const snap = await getDocs(collection(db, "projects"));
  snap.forEach((project) => {
    pcount++;
  });
}
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {getFirestore, collection , doc, setDoc, getDocs} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import { GoogleAuthProvider , getAuth, signInWithPopup, signOut, setPersistence, browserSessionPersistence} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
//note that nextjs project is working with fierbase sdk not cdn
const firebaseConfig = {
  apiKey: "AIzaSyB6D6or0h0tvZMrYiGQ6dIhOk4u21-EKbw",
  authDomain: "astro-iit.firebaseapp.com",
  projectId: "astro-iit",
  storageBucket: "astro-iit.firebasestorage.app",
  messagingSenderId: "156365410266",
  appId: "1:156365410266:web:02809445d3c6dd39667ae3"
};


const client = new window.Appwrite.Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('67777691001b45d492b8');

const storage = new window.Appwrite.Storage(client);

//!!important TO DO
//secure the database after testing
//add sign in
//add an empty field check

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

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
let blog_count = 0;
let addingBlog = false;

const blogForm = document.getElementById("blog-form");
const blogSave = document.getElementById("blog-save");
const blogCancel = document.getElementById('blog-cancel');
const status = document.getElementById('status');
status.style.display = "none";

auth.onAuthStateChanged((user)=>{
    if(user){console.log("authorized");}
    else{window.alert("Error 401 : unauthorized"); window.location.href='../index.html'}
});

extractBlogs();
blogSave.addEventListener("click", async function(event){
    event.preventDefault();
    controller.abort();
    controller = new AbortController();
    const signal = controller.signal;

    const content = document.getElementById("blog-content").value;
    const title = document.getElementById("blog-title").value;
    const blog_img = document.getElementById('blog-image').files[0];
    const writer_img = document.getElementById('writer-image').files[0];
    const author = document.getElementById("blog-author").value;
    const slug = document.getElementById("blog-slug").value;
    const date = document.getElementById("blog-date").value;
    const cat = document.getElementById("blog-category").value;
    const heading = document.getElementById("blog-heading").value;
    const des = document.getElementById("blog-description").value;
    if (!(content && title && blog_img && writer_img && author && slug && date && cat && heading && des)) {
        alert("All fields must be filled!");
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }    
    try{
        status.style.display='block';
        console.log("Blog count :",blog_count);
        //adding header image to appwrite storage
        const promise = storage.createFile(
          '677777dc00318c84924c',
          `blog-${blog_count+1}`,
          blog_img
        );
        promise.then(function (response) {
            console.log("check 1"); 
        }, function (error) {
            console.log(error);
        });

        //adding writer image to appwrite storage
        const pr = storage.createFile(
          '677777dc00318c84924c',
          `blog-${blog_count+1}-writer`,
          writer_img
        );
        pr.then(function (response) {
            console.log("check 2"); 
        }, function (error) {
            console.log(error);
        });
        //adding article to database
        await setDoc(doc(db, "blogs", `blog-${blog_count+1}`), {
          title : title,
          content : content,
          author: author,
          slug: slug,
          description: des,
          date: date,
          category: cat,
          heading:heading,
          content:content
        }, {signal});
        status.style.border='none';
        status.style.animation='none';
        console.log("Added");
        status.innerHTML='✅';
        status.style.display='block';
        setTimeout(() => {
          status.style.display='none';
          blogForm.reset();
          window.location.href="../index.html";
        },700);
        
    }catch(e){
        console.error(e);
    }
});

blogCancel.addEventListener('click', ()=>{
    controller.abort();
    blogForm.reset();
    console.log("upload cancelled");
    window.location.href="../index.html";
});
  



async function extractBlogs(){
  blog_count = 0;
  const sn = await getDocs(collection(db, "blogs"));
  sn.forEach((doc) => {
    blog_count++;
  });
}

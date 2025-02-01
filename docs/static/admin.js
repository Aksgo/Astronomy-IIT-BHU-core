import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {getFirestore, collection , doc, setDoc, getDocs, getDoc} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import { GoogleAuthProvider , getAuth, signInWithPopup, signOut, setPersistence, browserSessionPersistence} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { appwrite_pid,firebaseConfig} from "../static/config.js";
//note that nextjs project is working with fierbase sdk not cdn

//!!important TO DO
//secure the database after testing

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
const auth = getAuth(app);

/*
const client = new window.Appwrite.Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(appwrite_pid);
const storage = new window.Appwrite.Storage(client);
*/
let blog_count = 0;
let addingBlog = false;

const user_login = document.getElementById('user-login');
const loader = document.getElementById('loader-animation');
const active_blog = document.getElementById('active-blog');
const header = document.getElementById('header-text');
const addBlog = document.getElementById('add-blog');
const addProject = document.getElementById('add-project');
const addact = document.getElementById('add-activity');
//const testimg = document.getElementById('test-img');
const homePath = "../index.html";

setPersistence(auth, browserSessionPersistence)
  .then(() => {
    // Persistence set successfully
    console.log("session working");
  })
  .catch((error) => {
    // Error setting persistence
    console.error("Error setting persistence:", error);
  });

loadBlogs();

const adminRef = doc(db, "admin", "users");
const admin = await getDoc(adminRef);
const users = admin.data();

auth.onAuthStateChanged((user)=>{
  if(user){
    user_login.innerHTML = "Sign Out";
  }
  else{
    user_login.innerHTML="Sign In";
  }
});

user_login.addEventListener('click', userSession);


function userSession(){
  if(!auth.currentUser){
    signInWithPopup(auth, provider)
    .then(result => {
      const user = result.user;
      const curid = user.uid;
      let allowed = 0;
      for(let ukey in users){
        if(curid == users[ukey] ){
          allowed = 1 ;
        }
      }   
      if(!allowed){
        signOut(auth).then(()=>{
          window.alert("admin access only");
        })   
        console.log("non admin login attemped");
        return;
      }
      
      user_login.innerHTML="Sign Out";
      console.log("logged in succesfully");
      window.location.href=homePath;
    }).catch((error)=>{
      console.log("authorization error");
      console.log(error);
    })
  }else{
    signOut(auth).then(()=>{
      console.log("logged out successfully");
      user_login.innerHTML = "Sign In";
    })
    window.location.href= homePath;
  }
}



async function loadBlogs(){
  blog_count = 0;
  const home = document.getElementById('home');
  home.innerHTML="";
  //load blogs
  active_blog.style.display = 'block';
  loader.style.display = 'block';
  const sn = await getDocs(collection(db, "blogs"));
  sn.forEach((doc) => {
    blog_count++;
    displayBlog(doc.data(), blog_count);
  });
  loader.style.display = 'none';
}

function displayBlog(data, count){
  //display each block
  const content = data.content;
  const blogTitle = data.title;
  const blogData = content.split("\n");
  const home = document.getElementById('home');

  const blogdp = document.createElement('div');
  blogdp.id = `blog-${count}`;
  blogdp.classList.add('blog-dp');
  
  const titlediv = document.createElement('div');
  titlediv.textContent = blogTitle;
  titlediv.classList.add('title');

  const hrelement = document.createElement('hr');
  titlediv.appendChild(hrelement);

  const contentdiv = document.createElement('div');
  contentdiv.classList.add('content');

  for(let i = 0; i<blogData.length; i++){
    const para = document.createElement('p');
    para.innerHTML = blogData[i];
    contentdiv.appendChild(para);
  }

  blogdp.appendChild(titlediv);
  blogdp.append(contentdiv);
  home.appendChild(blogdp);
}

window.addEventListener('scroll',function(){
  if(!addingBlog){
    const sections = document.querySelectorAll('.blog-dp');
    let curTitle = "Welcome to Astronomy Club Blogger";
    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 50 && rect.bottom >= 0) {
          const sectionTitle = section.querySelector('.title').textContent;
          curTitle = sectionTitle;
      }
    });
    header.textContent = curTitle;
  }
});
let redirectUser;
auth.onAuthStateChanged((user)=>{
  redirectUser = (page)=>{
    if(user){
      window.location.href = page;
    }else{
      window.alert("Error 401 : Unauthorized");
    }
    return;
  }
});

addBlog.addEventListener('click',(event)=>{
  redirectUser("../post.html");
})

addProject.addEventListener('click', (event)=>{
  redirectUser("../project.html");
})
addact.addEventListener('click', (event)=>{
  redirectUser("../activities.html");
});

/*
EXTRA KNOWLEDGE : 

uploadBytes(storageRef, bytes).then((snapshot) => {
  console.log('Uploaded an array!');
  console.log('Bytes transferred:', snapshot.bytesTransferred);
  console.log('Total bytes:', snapshot.totalBytes);
  console.log('File uploaded to:', snapshot.ref.fullPath);
  console.log('Metadata:', snapshot.metadata);
});


let objURL = URL.createObjectURL(blog_img);
const head = document.getElementById('header');
head.innerHTML='';
const a = document.createElement('a');
a.href = objURL;
a.download = "uploaded-file.png"
a.innerHTML="download";
head.appendChild(a);
head.onload = () => { URL.revokeObjectURL(objURL);}


//adding image to storage
//creating reference to storage
const imgRef = ref(storage, `blog-images/welcome-blog.jpg`);
//uploading bytes
const snapshot = await uploadBytes(imgRef, blog_img);
const imgURL = await getDownloadURL(snapshot.ref);
console.log("Image URL :", imgURL);
*/
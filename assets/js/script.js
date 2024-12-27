// Firebase Modüllerini İçe Aktar
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase, ref, push, set, onValue, update, remove, get} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

// Firebase Konfigürasyonu
const firebaseConfig = {
  apiKey: "API_KEY",
  authDomain: "to-do-list-82bb0.firebaseapp.com",
  projectId: "to-do-list-82bb0",
  storageBucket: "to-do-list-82bb0.appspot.com",
  messagingSenderId: "970181206005",
  appId: "1:970181206005:web:49344f947932c3f18c4abc"
};

// Firebase Başlat
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// HTML Öğelerini Seç
const dateInput = document.getElementById('dateInput');
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskContainer = document.getElementById('taskContainer');
const showPastTasksBtn = document.getElementById('showPastTasksBtn');
const showFutureTasksBtn = document.getElementById('showFutureTasksBtn');

// Görev Ekleme Olayı
addTaskBtn.addEventListener('click', () => {
  const date = dateInput.value; // Seçilen tarih
  const taskText = taskInput.value.trim(); // Girilen görev

  if (!date || !taskText) {
    alert('Lütfen tarih ve görev girin!');
    return;
  }

  // Firebase'e görev ekle
  const taskRef = ref(db, 'tasks/' + date); // Tarihe göre grup oluştur
  const newTaskRef = push(taskRef); // Yeni görev için benzersiz ID

  set(newTaskRef, {
    text: taskText,
    completed: false // Başlangıçta tamamlanmamış
  });

  taskInput.value = ''; // Görev kutusunu temizle
});

// Firebase'den Verileri Oku
function loadTasks(showPast = false) {
  const tasksRef = ref(db, 'tasks');
  onValue(tasksRef, (snapshot) => {
    taskContainer.innerHTML = ''; // Önceki verileri temizle

    const data = snapshot.val(); // Firebase verilerini al
    if (data) {
      const today = new Date().toISOString().split('T')[0];
      const futureDates = [];
      const pastDates = [];

      Object.keys(data).forEach(date => {
        if (date >= today) futureDates.push(date);
        else pastDates.push(date);
      });

      // Tarihleri sırala
      futureDates.sort();
      pastDates.sort().reverse();

      const displayDates = showPast ? pastDates : futureDates;
      displayDates.forEach(date => {
        createTaskGroup(date);
        Object.keys(data[date]).forEach(taskId => {
          const task = data[date][taskId];
          addTaskToGroup(date, taskId, task.text, task.completed);
        });
      });
    }
  });
}

// Grup Kutusu Oluştur
function createTaskGroup(date) {
  if (!document.getElementById(`group-${date}`)) {
    const taskGroup = document.createElement('div');
    taskGroup.classList.add('task-group');
    taskGroup.id = `group-${date}`;

    const header = document.createElement('h3');
    header.textContent = date;

    // Grup Silme Butonu (X)
    const deleteGroupBtn = document.createElement('button');
    deleteGroupBtn.textContent = 'X';
    deleteGroupBtn.classList.add('delete-btn');
    deleteGroupBtn.addEventListener('click', () => {
      remove(ref(db, 'tasks/' + date)); // Grubu Firebase'den sil
    });

    header.appendChild(deleteGroupBtn); // Sağ tarafa X ekle
    header.style.display = "flex";
    header.style.justifyContent = "space-between";

    taskGroup.appendChild(header);
    taskContainer.appendChild(taskGroup);
  }
}

// Görevi Tarih Kutusuna Ekle
function addTaskToGroup(date, taskId, taskText, completed) {
  const taskGroup = document.getElementById(`group-${date}`);
  const taskItem = document.createElement('div');
  taskItem.classList.add('task-item');
  taskItem.style.display = "flex";
  taskItem.style.justifyContent = "space-between";

  const leftSection = document.createElement('div');
  leftSection.style.display = "flex";
  leftSection.style.alignItems = "center";

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = completed;

  const label = document.createElement('label');
  label.textContent = taskText;
  label.style.marginLeft = "10px";

  // Görev Silme Butonu (X)
  const deleteTaskBtn = document.createElement('button');
  deleteTaskBtn.textContent = 'X';
  deleteTaskBtn.classList.add('delete-btn');
  deleteTaskBtn.addEventListener('click', () => {
    remove(ref(db, `tasks/${date}/${taskId}`)); // Görevi Firebase'den sil
  });

  // Checkbox durumu değiştirildiğinde Firebase'i güncelle
  checkbox.addEventListener('change', () => {
    const taskRef = ref(db, `tasks/${date}/${taskId}`);
    update(taskRef, {
      completed: checkbox.checked // Durumu güncelle
    });
  });

  leftSection.appendChild(checkbox);
  leftSection.appendChild(label);
  taskItem.appendChild(leftSection);
  taskItem.appendChild(deleteTaskBtn);
  taskGroup.appendChild(taskItem);
}

// Geçmiş Tarihleri Gösterme Butonu
showPastTasksBtn.addEventListener('click', () => {
  loadTasks(true); // Geçmiş tarihleri yükle
});

// Gelecek Tarihleri Gösterme Butonu
showFutureTasksBtn.addEventListener('click', () => {
  loadTasks(false); // Gelecek tarihleri yükle
});

// Sayfa Yüklenince Bugünden Sonra Başlat
loadTasks();



document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    const userRef = ref(db, "users"); // Tüm kullanıcıların olduğu referans

    get(userRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                const users = snapshot.val(); // Firebase'den kullanıcı verilerini al

                // Kullanıcıyı ve ID'sini bul

                const user = Object.entries(users).find(([key, user]) => {
                    if (
                        user.email.toLowerCase() === email.toLowerCase() &&
                        user.password === password
                    ) {
                        return true; // Kullanıcıyı bul
                    }
                    return false; // Devam et
                });

                if (user) {
                    document.getElementById("container-loginForm").classList.add("hidden");
                    document.getElementById("toDoListCont").classList.remove("hidden");
                } else {
                    alert("Hatalı email veya şifre!");
                }
            } else {
                alert("Kayıtlı kullanıcı bulunamadı!");
            }
        })
        .catch((error) => {
            console.error("Giriş sırasında hata oluştu:", error);
        });
});


window.backButon = function(){
    document.getElementById("container-loginForm").classList.remove("hidden");
    document.getElementById("toDoListCont").classList.add("hidden");

}
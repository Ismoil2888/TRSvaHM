export const uploadTeacherPhoto = async (file) => {
    const formData = new FormData();
    formData.append("photo", file);
  
    const res = await fetch(`${process.env.REACT_APP_API_BASE}/api/teachers/upload-photo`, {
      method: "POST",
      body: formData
    });
  
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Ошибка при загрузке фото");
    }
  
    const data = await res.json();
    return data.photoUrl; // вернётся URL фото
  };
  
  export const createTeacher = async (teacherData) => {
    const res = await fetch("${process.env.REACT_APP_API_BASE}/api/teachers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(teacherData)
    });
  
    const data = await res.json();
  
    if (!res.ok) {
      throw new Error(data.error || "Ошибка при добавлении преподавателя");
    }
  
    return data.id; // возвращается ID нового преподавателя
  };
  
  export const updateTeacher = async (id, teacherData) => {
    const res = await fetch(`${process.env.REACT_APP_API_BASE}/api/teachers/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(teacherData)
    });
  
    const data = await res.json();
  
    if (!res.ok) {
      throw new Error(data.error || "Ошибка при обновлении преподавателя");
    }
  };
  
  export const deleteTeacher = async (id) => {
    const res = await fetch(`${process.env.REACT_APP_API_BASE}/api/teachers/${id}`, {
      method: "DELETE"
    });
  
    const data = await res.json();
  
    if (!res.ok) {
      throw new Error(data.error || "Ошибка при удалении преподавателя");
    }
  };
  
  export const getTeacherById = async (id) => {
    const res = await fetch(`${process.env.REACT_APP_API_BASE}/api/teachers/${id}`);
    const data = await res.json();
  
    if (!res.ok) {
      throw new Error(data.error || "Ошибка при получении преподавателя");
    }
  
    return data;
  };









// import { getDatabase, ref as dbRef, set, push, update, remove, get } from "firebase/database";
// import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
// import imageCompression from "browser-image-compression";

// const db = getDatabase();
// const storage = getStorage();

// export const compressImage = async (file) => {
//   const options = {
//     maxSizeMB: 1,
//     maxWidthOrHeight: 1920,
//     useWebWorker: true,
//   };
//   try {
//     const compressed = await imageCompression(file, options);
//     return compressed;
//   } catch (err) {
//     console.error("Image compression error:", err);
//     return file;
//   }
// };

// export const uploadTeacherPhoto = async (file) => {
//   const compressed = await compressImage(file);
//   const fileRef = storageRef(storage, `teachers/${compressed.name}`);
//   await uploadBytes(fileRef, compressed);
//   return await getDownloadURL(fileRef);
// };

// export const createTeacher = async (teacherData) => {
//   const teachersRef = dbRef(db, 'teachers');
//   const newTeacherRef = push(teachersRef);
//   await set(newTeacherRef, teacherData);
//   return newTeacherRef.key;
// };

// export const updateTeacher = async (id, teacherData) => {
//   const teacherRef = dbRef(db, `teachers/${id}`);
//   await update(teacherRef, teacherData);
// };

// export const deleteTeacher = async (id) => {
//   const teacherRef = dbRef(db, `teachers/${id}`);
//   await remove(teacherRef);
// };

// export const getTeacherById = async (id) => {
//   const teacherRef = dbRef(db, `teachers/${id}`);
//   const snapshot = await get(teacherRef);
//   return snapshot.val();
// };
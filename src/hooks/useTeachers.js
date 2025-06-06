import { useEffect, useState } from "react";
import axios from "axios";

const useTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/teachers`);
        const data = res.data;
        setTeachers(data);
        setFilteredTeachers(data);
      } catch (error) {
        console.error("Ошибка при загрузке преподавателей:", error);
        setTeachers([]);
        setFilteredTeachers([]);
      }
    };

    fetchTeachers();
  }, []);

  const search = (query) => {
    setSearchQuery(query);
    const filtered = teachers.filter((teacher) =>
      (teacher.name || "").toLowerCase().includes(query.toLowerCase())
    );
    setFilteredTeachers(filtered);
  };

  const select = (teacher) => {
    setFilteredTeachers([teacher]);
  };

  return {
    teachers,
    filteredTeachers,
    searchQuery,
    search,
    select,
  };
};

export default useTeachers;












// import { useEffect, useState } from "react";
// import { getDatabase, ref as dbRef, onValue } from "firebase/database";

// const useTeachers = () => {
//   const [teachers, setTeachers] = useState([]);
//   const [filteredTeachers, setFilteredTeachers] = useState([]);
//   const [searchQuery, setSearchQuery] = useState("");

//   useEffect(() => {
//     const db = getDatabase();
//     const teachersRef = dbRef(db, "teachers");
//     const unsubscribe = onValue(teachersRef, (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         const loaded = Object.keys(data).map(id => ({ id, ...data[id] }));
//         setTeachers(loaded);
//         setFilteredTeachers(loaded);
//       } else {
//         setTeachers([]);
//         setFilteredTeachers([]);
//       }
//     });

//     return () => unsubscribe();
//   }, []);

//   const search = (query) => {
//     setSearchQuery(query);
//     const filtered = teachers.filter(teacher =>
//       (teacher.name || "").toLowerCase().includes(query.toLowerCase())
//     );
//     setFilteredTeachers(filtered);
//   };

//   const select = (teacher) => {
//     setFilteredTeachers([teacher]);
//   };

//   return {
//     teachers,
//     filteredTeachers,
//     searchQuery,
//     search,
//     select
//   };
// };

// export default useTeachers;
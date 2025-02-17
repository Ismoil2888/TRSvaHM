import { useState, useEffect } from "react";
import { getDatabase, ref as dbRef, onValue } from "firebase/database";
import { auth } from "../firebase";
import defaultAvatar from "../default-image.png";

const useUserDetails = () => {
  const [userDetails, setUserDetails] = useState({ username: "", avatarUrl: defaultAvatar });

  useEffect(() => {
    const database = getDatabase();
    const user = auth.currentUser;

    if (user) {
      const userRef = dbRef(database, `users/${user.uid}`);
      onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setUserDetails({
            username: data.username || "User",
            avatarUrl: data.avatarUrl || defaultAvatar,
          });
        }
      });
    }
  }, []);

  return userDetails;
};

export default useUserDetails;
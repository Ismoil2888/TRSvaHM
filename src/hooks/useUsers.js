import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { getDatabase, ref as dbRef, onValue } from "firebase/database";
import { toast } from "react-toastify";

const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pwaInstallCount, setPwaInstallCount] = useState(0);

  // 1) Загрузка пользователей из вашего бэкенда
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_BASE}/api/users`
      );
      setUsers(data);
    } catch (err) {
      console.error(err);
      toast.error("Ошибка при загрузке списка пользователей");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 2) Удаление пользователя
  const deleteUser = useCallback(
    async (userId) => {
      try {
        await axios.delete(
          `${process.env.REACT_APP_API_BASE}/api/users/${userId}`
        );
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        toast.success("Пользователь удалён");
      } catch {
        toast.error("Не удалось удалить пользователя");
      }
    },
    []
  );

  // 3) Подписка на счётчик установок PWA в Realtime DB
  useEffect(() => {
    const database = getDatabase();
    const installsRef = dbRef(database, 'pwaInstalls');
    const unsubscribe = onValue(installsRef, snapshot => {
      setPwaInstallCount(snapshot.exists() ? snapshot.val() : 0);
    });
    return () => unsubscribe();
  }, []);

  // при старте — загрузить пользователей
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    isLoading,
    fetchUsers,
    deleteUser,
    pwaInstallCount,
  };
};

export default useUsers;
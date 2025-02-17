import React, { useState } from 'react';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { getDatabase, ref as databaseRef, set, ref, update, push } from "firebase/database";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../BlankForm.css';
import { motion, AnimatePresence } from 'framer-motion';

const BlankForm = () => {
  const [formData, setFormData] = useState({
      fullName: "",
      status: "",
      email: "",
      photo: null,
  });
  const [showStatusList, setShowStatusList] = useState(false);
    const [notification, setNotification] = useState(""); // Для уведомления
    const [notificationType, setNotificationType] = useState(""); 

  const statusOptions = ["Асистент", "Старший", "Доцент", "Доцент2", "Доктор наук"];

  const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
      setFormData((prev) => ({ ...prev, photo: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // Проверка корректности email
        if (!emailRegex.test(formData.email)) {
          toast.error("Введите корректный адрес электронной почты.");
          return;
      }

    // Проверка обязательных полей
    if (!formData.fullName || !formData.status || !formData.email || !formData.photo) {
        toast.error("Пожалуйста, заполните все обязательные поля и загрузите фото.");
        return;
    }

    showNotificationNeutral("Подождите немного");

    try {
        const db = getDatabase();
        const storage = getStorage();
        let photoUrl = null;

        // Загрузка фото
        if (formData.photo) {
            const photoRef = storageRef(storage, `teachersPhotos/${formData.photo.name}`);
            await uploadBytes(photoRef, formData.photo);
            photoUrl = await getDownloadURL(photoRef);
        }

        const requestsRef = ref(db, 'teachersRequest');
        const newRequestRef = push(requestsRef);
        await set(newRequestRef, {
            fullName: formData.fullName,
            email: formData.email,
            photoUrl: photoUrl,
            status: formData.status,
        });

        toast.success("Заявка успешно отправлена!");
        showNotification("В течение дня на вашу почту поступит информация о вашем личном кабинете.");
    } catch (error) {
        console.error("Ошибка отправки заявки:", error);
        toast.error("Ошибка отправки заявки.");
    }
};

 // Функция для успешных уведомлений
 const showNotification = (message) => {
  setNotificationType("success");
  setNotification(message);
  setTimeout(() => {
    setNotification("");
    setNotificationType("");
  }, 15000);
};

    // Функция для нейтральных уведомлений
    const showNotificationNeutral = (message) => {
      setNotificationType("neutral");
      setNotification(message);
      setTimeout(() => {
        setNotification("");
        setNotificationType("");
      }, 15000);
    };

// Функция для ошибочных уведомлений
const showNotificationError = (message) => {
  setNotificationType("error");
  setNotification(message);
  setTimeout(() => {
    setNotification("");
    setNotificationType("");
  }, 5000);
};

    return (
        <motion.div
            className="blank-form"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <form className="form-container">
          {notification && (
            <div className={`notification ${notificationType}`}>
              {notification}
            </div>
          )}
                <h2>Заявка на регистрацию в платформе</h2>
                <div className="form-group">
                    <label>ФИО:</label>
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Введите ФИО" />
                </div>

                <div className="form-group">
                    <label>Статус:</label>
                    <div
                        onClick={() => setShowStatusList(!showStatusList)}
                        className="dropdown-button"
                    >
                        {formData.status || "Выберите статус"}
                    </div>
                    <AnimatePresence>
                        {showStatusList && (
                            <motion.ul
                                className="dropdown-list"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                {statusOptions.map((option) => (
                                    <motion.li
                                        key={option}
                                        onClick={() => {
                                            setFormData((prev) => ({ ...prev, status: option }));
                                            setShowStatusList(false);
                                        }}
                                        whileHover={{ scale: 1.05, backgroundColor: "#f0f0f0" }}
                                        className="dropdown-item"
                                    >
                                        {option}
                                    </motion.li>
                                ))}
                            </motion.ul>
                        )}
                    </AnimatePresence>
                </div>

                <div className="form-group">
                    <label>Электронная почта:</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Введите свой email адрес:"
                    />
                </div>

                <div className="form-group">
                    <label>Загрузите свое фото:</label>
                    <input type="file" accept="image/*" onChange={handleFileChange} />
                </div>

                <button className="submit-button" onClick={handleSubmit}>
                    Отправить заявку
                </button>
            </form>
            <ToastContainer />
        </motion.div>
    );
};

export default BlankForm;
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";

const VoiceAssistant = () => {
  const [isActive, setIsActive] = useState(false);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();
  const lastCommandRef = useRef("");

  const speak = (message) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = "ru-RU";
    synth.speak(utterance);
  };

  // 🧠 Обработка фраз через wit.ai
  const processWithWitAI = async (text) => {
    try {
      const res = await fetch("https://api.wit.ai/message?v=20240328&q=" + encodeURIComponent(text), {
        headers: {
          Authorization: "Bearer TAMVCHA7WWV4VJV4P3TDD4MPBSREH3A3"
        }
      });
      const data = await res.json();
      console.log("🤖 Ответ от wit.ai:", data);

      const intent = data.intents?.[0]?.name;

      switch (intent) {
        case "go_library":
          navigate("/library");
          speak("Открываю библиотеку");
          break;
        case "go_schedule":
          navigate("/schedule");
          speak("Открываю расписание");
          break;
        case "go_teachers":
          navigate("/teachers");
          speak("Перехожу к преподавателям");
          break;
        case "go_main":
          navigate("/");
          speak("Главная страница");
          break;
        default:
          speak("Извините, я пока не умею выполнять эту команду.");
      }
    } catch (error) {
      console.error("Ошибка wit.ai:", error);
      speak("Ошибка подключения к серверу.");
    }
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Ваш браузер не поддерживает голосовое управление.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "ru-RU";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
      console.log("🎤 Распознано:", transcript);

      if (transcript === lastCommandRef.current) return;
      lastCommandRef.current = transcript;

        // 🗓 День недели
  if (transcript.includes("какой сегодня день")) {
    const date = new Date();
    const days = ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"];
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = date.toLocaleString("ru-RU", { month: "long" });
    const year = date.getFullYear();
    speak(`Сегодня ${dayName}, ${day} ${month} ${year} года`);
    return;
  }

  // ☀️ Погода
  if (transcript.includes("погода") && transcript.includes("душанбе")) {
    fetch("https://api.open-meteo.com/v1/forecast?latitude=38.56&longitude=68.78&current_weather=true")
      .then(res => res.json())
      .then(data => {
        const temp = data.current_weather.temperature;
        const wind = data.current_weather.windspeed;
        speak(`В Душанбе сейчас ${temp} градусов и ветер ${wind} километров в час`);
      })
      .catch(() => {
        speak("Не удалось получить данные о погоде");
      });
    return;
  }

// Функция для перевода текста с использованием Apertium
const translateText = async (text, to = "en") => {
  try {
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${to}&dt=t&q=${encodeURIComponent(text)}`);
    const data = await res.json();
    const translated = data[0][0][0];
    speak(`Перевод: ${translated}`);
  } catch (err) {
    console.error("Ошибка перевода:", err);
    speak("Не удалось выполнить перевод");
  }
};

// Обработка команды "переведи"
if (transcript.includes("переведи")) {
  const match = transcript.match(/переведи (.+?) на (английский|русский|таджикский)/);
  if (match) {
    const phrase = match[1];
    const lang = match[2];
    const langMap = {
      английский: "en",
      русский: "ru",
      таджикский: "tg"
    };
    const targetLang = langMap[lang];
    translateText(phrase, targetLang);
    return;
  }
  speak("Скажи: переведи фразу на нужный язык.");
  return;
}

      // ⚡ Локальные команды
      if (transcript.includes("джарвис") || transcript.includes("платформа")) {
        if (transcript.includes("библиотек")) {
          navigate("/library");
          speak("Переход в библиотеку выполнен");
          return;
        } else if (transcript.includes("расписание")) {
          navigate("/schedule");
          speak("Открываю расписание");
          return;
        } else if (transcript.includes("главн")) {
          navigate("/");
          speak("Вот главная страница");
          return;
        } else if (transcript.includes("поиск")) {
          navigate("/searchpage");
          speak("Открыт раздел поиска");
          return;
        } else if (transcript.includes("привет")) {
          speak("Привет босс, как ваши дела ?");
        } else if (transcript.includes("салам алейкум")) {
          speak("Воалейкум салом, чихел шумо? соз ? хуб ? ба шумо чи кумак расонам сардор ?!");
        } else if (transcript.includes("салом алейкум")) {
          speak("Воалейкум салом, чихелед шумо? ба шумо чи кумак расонам сардор ?!");
        } else if (transcript.includes("декан факультета")) {
          speak("Декан факультета Цифровые технологии системы и защита информации Абдурасулов Далер Анварович");
        } else if (transcript.includes("ректор университета")) {
          speak("Ректором Таджикского Технического Университета имени академика Мухаммад Осими является Давлатзода Кудрат Камбар");
        } else if (transcript.includes("заведующий кафедры")) {
          speak("Заведующий кафедры информационной безопасности Мусинов Абдували");
        }
      }

      // 🧠 Всё остальное через wit.ai
      processWithWitAI(transcript);
    };

    recognition.onerror = (event) => {
      if (["aborted", "no-speech"].includes(event.error)) {
        if (isActive) recognition.start();
      } else {
        console.error("Ошибка распознавания:", event.error);
      }
    };

    recognition.onend = () => {
      if (isActive) recognition.start();
    };

    recognitionRef.current = recognition;
  }, [navigate, isActive]);

  const toggleVoice = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (isActive) {
      recognition.stop();
    } else {
      lastCommandRef.current = "";
      recognition.start();
    }

    setIsActive((prev) => !prev);
  };

  return (
    <button
      onClick={toggleVoice}
      style={{
        marginTop: "20px",
        padding: "10px 20px",
        fontSize: "16px",
        borderRadius: "10px",
        backgroundColor: isActive ? "#ff4d4d" : "#4CAF50",
        color: "white",
        border: "none",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        cursor: "pointer"
      }}
    >
      {isActive ? <FaMicrophone /> : <FaMicrophoneSlash />}
      {isActive ? "Выключить Джарвис" : "Активировать Джарвис"}
    </button>
  );
};

export default VoiceAssistant;















// import { useEffect, useState, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";

// const VoiceAssistant = () => {
//   const [isActive, setIsActive] = useState(false); // пассивное прослушивание включено по умолчанию
//   const recognitionRef = useRef(null);
//   const navigate = useNavigate();
//   const lastCommandRef = useRef("");

//   const speak = (message) => {
//     const synth = window.speechSynthesis;
//     const utterance = new SpeechSynthesisUtterance(message);
//     utterance.lang = "ru-RU";
//     synth.speak(utterance);
//   };

//   useEffect(() => {
//     if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
//       alert("Ваш браузер не поддерживает голосовое управление.");
//       return;
//     }

//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     const recognition = new SpeechRecognition();
//     recognition.lang = "ru-RU";
//     recognition.continuous = true;
//     recognition.interimResults = false;

//     recognition.onresult = (event) => {
//       const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
//       console.log("🎤 Распознано:", transcript);

//       if (transcript === lastCommandRef.current) return;
//       lastCommandRef.current = transcript;

//       if (transcript.includes("платформа") || transcript.includes("джарвис")) {
//         if (transcript.includes("библиотек")) {
//           navigate("/library");
//           speak("Переход в библиотеку выполнен");
//         } else if (transcript.includes("расписание")) {
//           navigate("/schedule");
//           speak("Переход в расписание выполнен");
//         } else if (transcript.includes("главн")) {
//           navigate("/");
//           speak("Вы перешли на главную страницу");
//         } else if (transcript.includes("поиск")) {
//           navigate("/searchpage");
//           speak("Открыт раздел поиска");
//         } else if (transcript.includes("уведомлен")) {
//           navigate("/notifications");
//           speak("Показаны уведомления");
//         } else if (transcript.includes("преподавател")) {
//           navigate("/teachers");
//           speak("Переход к преподавателям");
//         } else if (transcript.includes("сообщен")) {
//           navigate("/chats");
//           speak("Открыты сообщения");
//         } else if (transcript.includes("привет")) {
//           speak("Привет босс, как ваши дела ?");
//         } else if (transcript.includes("салам алейкум")) {
//           speak("Воалейкум салом, чихел шумо? соз ? хуб ? ба шумо чи кумак расонам сардор ?!");
//         } else if (transcript.includes("салом алейкум")) {
//           speak("Воалейкум салом, чихелед шумо? ба шумо чи кумак расонам сардор ?!");
//         }
//       }
//     };

//     recognition.onerror = (event) => {
//       if (["aborted", "no-speech"].includes(event.error)) {
//         console.warn("⚠️ Мягкая ошибка, перезапуск:", event.error);
//         if (isActive) recognition.start();
//       } else {
//         console.error("❌ Ошибка распознавания:", event.error);
//       }
//     };

//     recognition.onend = () => {
//       console.warn("🎤 Распознавание завершено.");
//       if (isActive) {
//         console.log("🔄 Перезапуск слушателя...");
//         recognition.start();
//       }
//     };

//     recognitionRef.current = recognition;
//     if (isActive) recognition.start();
//   }, [navigate, isActive]);

//   const toggleVoice = () => {
//     const recognition = recognitionRef.current;
//     if (!recognition) return;

//     if (isActive) {
//       recognition.stop();
//     } else {
//       try {
//         lastCommandRef.current = "";
//         recognition.start();
//       } catch (err) {
//         console.error("Ошибка запуска распознавания:", err);
//       }
//     }

//     setIsActive((prev) => !prev);
//   };

//   return (
//     <button
//       onClick={toggleVoice}
//       className="jarvis-button"
//       style={{ marginTop: "20px", padding: "10px 20px", fontSize: "16px", borderRadius: "10px", backgroundColor: isActive ? "#ff4d4d" : "#4CAF50", color: "white", border: "none", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
//     >
//       {isActive ? <FaMicrophone /> : <FaMicrophoneSlash />} {isActive ? "Выключить Джарвис" : "Активировать Джарвис"}
//     </button>
//   );
// };

// export default VoiceAssistant;
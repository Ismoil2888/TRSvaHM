import React, { useState, useEffect } from "react";
import { FaRobot, FaRedo, FaMicrophone, FaTimes } from "react-icons/fa";
import "../GlobalJarvisWidget.css";

const GlobalJarvisWidget = () => {
  const [enabled, setEnabled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [assistantActive, setAssistantActive] = useState(false);

  // Проверка состояния активации из localStorage
  useEffect(() => {
    const checkStatus = () => {
      setEnabled(localStorage.getItem("jarvisEnabled") === "true");
    };

    checkStatus();
    window.addEventListener("storage", checkStatus);
    return () => window.removeEventListener("storage", checkStatus);
  }, []);

  const toggleAssistant = () => {
    if (!assistantActive) {
      window.startJarvis();
    } else {
      window.stopJarvis();
    }
    setAssistantActive(!assistantActive);
    setMenuOpen(false);
  };

  const disableWidget = () => {
    localStorage.removeItem("jarvisEnabled");
    setEnabled(false);
  };

  if (!enabled) return null;

  return (
    <div className="jarvis-floating">
      <button className="jarvis-fab" onClick={() => setMenuOpen(!menuOpen)}>
        <FaRobot />
      </button>

      {menuOpen && (
        <div className="jarvis-menu">
          <button onClick={() => {
            window.stopJarvis();
            setAssistantActive(false);
            setTimeout(() => window.startJarvis(), 200);
            setAssistantActive(true);
            setMenuOpen(false);
          }}>
            <FaRedo /> Перезагрузить Помощника
          </button>
          <button onClick={toggleAssistant}>
            <FaMicrophone /> {assistantActive ? "Отключить Помощника" : "Включить Помощника"}
          </button>
          <button onClick={disableWidget}>
            <FaTimes /> Отключить виджет
          </button>
        </div>
      )}
    </div>
  );
};

export default GlobalJarvisWidget;
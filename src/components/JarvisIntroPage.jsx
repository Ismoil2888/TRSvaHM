import React from "react";
import { FaMicrophone, FaRobot } from "react-icons/fa";
import VoiceAssistant from "./VoiceAssistant";
import "../JarvisIntroPage.css";
import { LanguageContext } from '../contexts/LanguageContext';
import { translations } from '../translations';
import useTranslation from '../hooks/useTranslation';


const JarvisIntroPage = () => {
    const t = useTranslation();
  return (
    <div className="jarvis-page">
      <div className="jarvis-container">
        <div className="jarvis-icon">
          <FaRobot className="icon-robot" />
        </div>
        <h1 className="jarvis-title">{t('jarvistitle')}</h1>
        <p className="jarvis-subtitle">
        {t('jarvissubtitle')}
        </p>

        <div className="jarvis-button-wrapper">
          <VoiceAssistant />
        </div>

        <div className="jarvis-info">
          🧠 {t('jarvisinfo')}
        </div>
      </div>
    </div>
  );
};

export default JarvisIntroPage;
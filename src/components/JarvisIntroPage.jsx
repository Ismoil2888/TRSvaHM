import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaRobot } from "react-icons/fa";
import VoiceAssistant from "./VoiceAssistant";
import "../JarvisIntroPage.css";
import useTranslation from '../hooks/useTranslation';

const JarvisIntroPage = () => {
  const t = useTranslation();
  const navigate = useNavigate();

  const enableJarvisWidget = () => {
    localStorage.setItem("jarvisEnabled", "true");
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <div className="jarvis-page">
      <Link className="back-button-jp white-icon" onClick={() => navigate(-1)}>
        <FaArrowLeft />
      </Link>

      <div className="jarvis-container">
        <div className="jarvis-icon">
          <FaRobot className="icon-robot" />
        </div>

        <h1 className="jarvis-title">{t('jarvistitle')}</h1>
        <p className="jarvis-subtitle">{t('jarvissubtitle')}</p>

        <div className="jarvis-button-wrapper">
          <VoiceAssistant />
        </div>

        <button className="jarvis-activate-btn" onClick={enableJarvisWidget}>
          <FaRobot style={{ marginRight: '8px' }} /> Включить Помощника
        </button>

        <div className="jarvis-info">
          🧠 {t('jarvisinfo')}
        </div>
      </div>
    </div>
  );
};

export default JarvisIntroPage;









// import React from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { FaMicrophone, FaRobot } from "react-icons/fa";
// import VoiceAssistant from "./VoiceAssistant";
// import "../JarvisIntroPage.css";
// import { FaArrowLeft } from "react-icons/fa";
// import { LanguageContext } from '../contexts/LanguageContext';
// import { translations } from '../translations';
// import useTranslation from '../hooks/useTranslation';


// const JarvisIntroPage = () => {
//   const t = useTranslation();
//   const navigate = useNavigate();
//   return (
//     <div className="jarvis-page">
//       <Link className="back-button-jp white-icon" onClick={() => navigate(-1)}>
//         <FaArrowLeft />
//       </Link>
//       <div className="jarvis-container">
//         <div className="jarvis-icon">
//           <FaRobot className="icon-robot" />
//         </div>
//         <h1 className="jarvis-title">{t('jarvistitle')}</h1>
//         <p className="jarvis-subtitle">
//           {t('jarvissubtitle')}
//         </p>

//         <div className="jarvis-button-wrapper">
//           <VoiceAssistant />
//         </div>

//         <div className="jarvis-info">
//           🧠 {t('jarvisinfo')}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default JarvisIntroPage;
import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import { Link, useNavigate } from "react-router-dom";
import { getDatabase, ref as dbRef, onValue } from "firebase/database";
import defaultAvatar from "../default-image.png";
import "../SpecialtyPage.css";
import { FaArrowLeft } from "react-icons/fa";
import useTranslation from '../hooks/useTranslation';
import basiclogo from "../Screenshot_2025-03-26-11-56-24-140_com.miui.gallery.jpg";

const GroupPage = () => {
  // Принимаем два параметра: course и groupName
  const t = useTranslation();
  const { course, groupName } = useParams();
  const [groupUsers, setGroupUsers] = useState([]);
  const [schedule, setSchedule] = useState(null);
  const database = getDatabase();
  const navigate = useNavigate();
  const daysOrder = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  useEffect(() => {
    // Обращаемся к данным группы по курсу и названию группы
    const groupDataRef = dbRef(database, `groups/${course}/${groupName}`);
    onValue(groupDataRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const users = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setGroupUsers(users);
      } else {
        setGroupUsers([]);
      }
    });
  }, [database, course, groupName]);

  useEffect(() => {
    // Обращаемся к расписанию по курсу и названию группы
    const scheduleRef = dbRef(database, `schedules/${course}/${groupName}`);
    onValue(scheduleRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Сортировка уроков по порядку для каждого дня
        daysOrder.forEach(day => {
          if (data[day] && Array.isArray(data[day])) {
            data[day].sort((a, b) => a.order - b.order);
          }
        });
      }
      setSchedule(data);
    });
  }, [database, course, groupName]);

  return (
    <div className="group-page">
      <Link className="back-button-gp" style={{ marginLeft: "15px", color: "black" }} onClick={() => navigate(-1)}>
        <FaArrowLeft />
      </Link>
      <h3 style={{ color: "grey", paddingTop: "45px", fontSize: "21px" }}>Группа: {groupName} (Курс: {course})</h3>

      {schedule && (
        <div className="group-schedule">
          <h2>Расписание уроков</h2>
          <div className="group-schedule-flex">
            {daysOrder.map(day => (
              <div key={day} className="day-schedule-display">
                <h3>{t(day)}</h3>
                {schedule[day] && schedule[day].length ? (
                  <table className="schedule-table">
                    <thead>
                      <tr>
                        <th>№</th>
                        <th>{t("subject")}</th>
                        <th>{t("startTime")}</th>
                        <th>{t("endTime")}</th>
                        <th>{t("teacher")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedule[day].map((lesson, index) => (
                        <tr key={index}>
                          <td>{lesson.order}</td>
                          <td>{lesson.subject}</td>
                          <td>{lesson.startTime}</td>
                          <td>{lesson.endTime}</td>
                          <td>{lesson.teacher}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>{t("scheduleNotSetFor")} {t(day)}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="group-users">
        <h2>Студенты этой специальности</h2>
        {groupUsers.map(user => (
          <div key={user.id} className="user-block">
            <img
              src={user.photoUrl || defaultAvatar}
              alt={user.fio}
              className="user-photo"
            />
            <div className="user-info">
              <p><strong>ФИО:</strong> {user.fio}</p>
              <p><strong>Факультет:</strong> {user.faculty}</p>
              <p><strong>Курс:</strong> {user.course}</p>
              <p><strong>Группа:</strong> {user.group}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupPage;
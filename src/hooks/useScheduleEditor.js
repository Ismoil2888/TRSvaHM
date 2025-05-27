import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const initialScheduleData = {
  monday: [], tuesday: [], wednesday: [], thursday: [],
  friday: [], saturday: [], sunday: [],
};

const defaultLesson = {
  order: '',
  subject: '',
  startTime: '',
  endTime: '',
  teacher: '',
  audience: ''   // новое поле
};

const useScheduleEditor = () => {
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [scheduleData, setScheduleData] = useState(initialScheduleData);
  const [isScheduleLoading, setIsScheduleLoading] = useState(false);
  const [showScheduleEditor, setShowScheduleEditor] = useState(false);

  const daysOrder = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  useEffect(() => {
    if (selectedCourse && selectedGroup) {
      fetchSchedule();
    }
  }, [selectedCourse, selectedGroup]);

  const fetchSchedule = async () => {
    setIsScheduleLoading(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/schedules/${selectedCourse}/${selectedGroup}`);
      setScheduleData(res.data || initialScheduleData);
    } catch (err) {
      console.error(err);
      toast.error("Ошибка при загрузке расписания");
      setScheduleData(initialScheduleData);
    } finally {
      setIsScheduleLoading(false);
    }
  };

  const handleCourseSelect = (e) => setSelectedCourse(e.target.value);
  const handleGroupSelect = (e) => setSelectedGroup(e.target.value);

  const handleSaveSchedule = async () => {
    if (!selectedCourse || !selectedGroup) {
      toast.error("Пожалуйста, выберите и курс, и группу");
      return;
    }
    try {
      await axios.post(`${process.env.REACT_APP_API_BASE}/api/schedules/${selectedCourse}/${selectedGroup}`, scheduleData);
      toast.success("Расписание сохранено");
      setShowScheduleEditor(false);
    } catch (err) {
      console.error(err);
      toast.error("Ошибка при сохранении расписания");
    }
  };

const addLesson = (day) => {
  setScheduleData(prev => ({
    ...prev,
    [day]: [...(prev[day] || []), { ...defaultLesson }]
  }));
};

  // const addLesson = (day) => {
  //   setScheduleData(prev => ({
  //     ...prev,
  //     [day]: [...prev[day], { order: '', subject: '', startTime: '', endTime: '', teacher: '' }]
  //   }));
  // };

  const updateLesson = (day, index, field, value) => {
    setScheduleData(prev => {
      const newDayLessons = [...prev[day]];
      newDayLessons[index] = { ...newDayLessons[index], [field]: value };
      return { ...prev, [day]: newDayLessons };
    });
  };

  const removeLesson = (day, index) => {
    setScheduleData(prev => {
      const newDayLessons = [...prev[day]];
      newDayLessons.splice(index, 1);
      return { ...prev, [day]: newDayLessons };
    });
  };

  return {
    selectedCourse, selectedGroup, scheduleData,
    isScheduleLoading, showScheduleEditor, setShowScheduleEditor,
    handleCourseSelect, handleGroupSelect,
    handleSaveSchedule, addLesson, updateLesson, removeLesson,
    daysOrder
  };
};

export default useScheduleEditor;
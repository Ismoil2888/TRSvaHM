import React, { useEffect } from "react";

const ChatWidget = () => {
  useEffect(() => {
    // Создаем элемент <script>
    const script = document.createElement("script");
    script.src = "https://widget.flowxo.com/embed.js";
    script.async = true;
    script.defer = true;

    // Добавляем атрибуты, как в исходном HTML
    script.setAttribute(
      "data-fxo-widget",
      "eyJ0aGVtZSI6IiMyYWE4NjMiLCJ3ZWIiOnsiYm90SWQiOiI2NzM3MzViZjYxMGIzNjAwNTIwZTFmZWMiLCJ0aGVtZSI6IiMyYWE4NjMiLCJsYWJlbCI6IlQgSSBLIC0g0J/QvtC80L7RidC90LjQuiAifSwid2VsY29tZVRleHQiOiLQsNGB0YHQsNC70LDQvCDQsNC70LXQudC60YPQvCDQsdGA0LDRgiEg0LrQsNC6INGC0LLQvtC4INC00LXQu9CwID8ifQ=="
    );

    // Добавляем <script> в <body>
    document.body.appendChild(script);

    // Удаляем скрипт при размонтировании компонента
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null; // Компонент ничего не рендерит, только подключает виджет
};

export default ChatWidget;
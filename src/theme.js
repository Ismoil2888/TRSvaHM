export const themes = {
    standard: {
      '--bg-container-color': '#1e2c39',
      '--bg-header-color': 'linear-gradient(to left top, #2c3e50f3, #2c3e50)',
      '--bg-header-ul-color': '#334454c6',
      '--bg-sidebar-color': '#2c3e50',
      '--text-color': '#ffffff',
      '--bg-content-color': '#2c3e50',
      '--bg-footer-color': '#2c3e5098', 
      '--bg-searchpage-blocks-color': '#3a434f',
      '--bg-h2-icon-block-color': '#1e2c39',
      '--white-icon-color': '#F8F9FB',
      '--bg-sidebar-menu-find-block': '#384f64',
      '--menu-icon-color': '#00eaff',
      '--bg-register-login-button-color': 'white',
      '--bg-currentheader-color': 'linear-gradient(90deg, #334454c6 25%,rgba(79, 112, 143, 0.78) 50%, #334454c6 75%)',
      '--up-info-content-color': '#cfdae3',
      metaThemeColor: '#1e2c39',
    },
    light: {
      '--bg-container-color': '#F8F9FB',
      '--bg-header-color': 'linear-gradient(to left top,rgba(255, 255, 255, 0.94), #FFFFFF)',
      '--bg-header-ul-color': 'rgba(255, 255, 255, 0.8)',
      '--bg-sidebar-color': '#FFFFFF',
      '--text-color': '#020818',
      '--bg-content-color': '#FFFFFF',
      '--bg-footer-color': '#ffffffa8',
      '--bg-searchpage-blocks-color': '#b8c1c2af',
      '--bg-h2-icon-block-color': '#F8F9FB',
      '--white-icon-color': '#000103',
      '--bg-sidebar-menu-find-block': '#08213e21',
      '--menu-icon-color': '#1b68c0',
      '--bg-register-login-button-color': 'linear-gradient(90deg, #00e5ff, #9b00ff)',
      '--bg-currentheader-color': 'linear-gradient(90deg,rgb(255, 255, 255) 25%, #e0e0e0 50%,rgb(255, 255, 255) 75%)',
      '--up-info-content-color': '#116ca5',
      metaThemeColor: '#F8F9FB',
    },
    dark: {
      '--bg-container-color': '#00040f',
      '--bg-header-color': 'linear-gradient(to left top, #000103e5, #000103)',
      '--bg-header-ul-color': '#000103ce',
      '--bg-sidebar-color': '#000103',
      '--text-color': '#ffffff',
      '--bg-content-color': '#000103',
      '--bg-footer-color': '#00010393',
      '--bg-searchpage-blocks-color': '#202938',
      '--bg-h2-icon-block-color': '#00040f',
      '--white-icon-color': '#F8F9FB',
      '--bg-sidebar-menu-find-block': '#151d2cb5',
      '--menu-icon-color': '#00eaff',
      '--bg-register-login-button-color': 'white',
      '--bg-currentheader-color': 'linear-gradient(90deg, #000103ce 25%, rgb(29, 42, 52) 50%, #000103ce 75%)',
      '--up-info-content-color': '#cfdae3',
      metaThemeColor: '#00040f',
    }
  };

  export const applyTheme = (themeName) => {
    const theme = themes[themeName];
    Object.keys(theme).forEach(variable => {
      if (variable !== 'metaThemeColor') {
        document.documentElement.style.setProperty(variable, theme[variable]);
      }
    });
  
    // Обновляем цвет status bar на Android (PWA)
    const metaTag = document.querySelector('meta[name="theme-color"]');
    if (metaTag && theme.metaThemeColor) {
      metaTag.setAttribute('content', theme.metaThemeColor);
    }
  };  
  
  // export const applyTheme = (themeName) => {
  //   const theme = themes[themeName];
  //   Object.keys(theme).forEach(variable => {
  //     document.documentElement.style.setProperty(variable, theme[variable]);
  //   });
  // };  
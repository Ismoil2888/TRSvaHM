export const themes = {
    standard: {
      '--bg-container-color': '#1e2c39',
      '--bg-header-color': 'linear-gradient(to left top, #2c3e50f3, #2c3e50)',
      '--bg-sidebar-color': '#2c3e50',
      '--text-color': '#ffffff',
      '--bg-content-color': '#2c3e50',
      '--bg-footer-color': '#2c3e5098', 
      '--bg-searchpage-blocks-color': '#3a434f',
      '--bg-h2-icon-block-color': '#1e2c39',
      '--white-icon-color': '#F8F9FB',
    },
    light: {
      '--bg-container-color': '#F8F9FB',
      '--bg-header-color': 'linear-gradient(to left top,rgba(255, 255, 255, 0.94), #FFFFFF)',
      '--bg-sidebar-color': '#FFFFFF',
      '--text-color': '#030818',
      '--bg-content-color': '#FFFFFF',
      '--bg-footer-color': '#ffffffa8',
      '--bg-searchpage-blocks-color': '#b8c1c2af',
      '--bg-h2-icon-block-color': '#F8F9FB',
      '--white-icon-color': '#000103',
    },
    dark: {
      '--bg-container-color': '#020818',
      '--bg-header-color': 'linear-gradient(to left top, #000103e5, #000103)',
      '--bg-sidebar-color': '#000103',
      '--text-color': '#ffffff',
      '--bg-content-color': '#000103',
      '--bg-footer-color': '#00010393',
      '--bg-searchpage-blocks-color': '#202938',
      '--bg-h2-icon-block-color': '#020818',
      '--white-icon-color': '#F8F9FB',
    }
  };
  
  export const applyTheme = (themeName) => {
    const theme = themes[themeName];
    Object.keys(theme).forEach(variable => {
      document.documentElement.style.setProperty(variable, theme[variable]);
    });
  };  
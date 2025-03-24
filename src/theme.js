export const themes = {
    standard: {
      '--bg-container-color': '#1e2c39',
      '--bg-header-color': 'linear-gradient(to left top, #2c3e50f3, #2c3e50)',
      '--text-color': '#ffffff',
      '--bg-content-color': '#2c3e50',
      '--bg-footer-color': '#2c3e5098'
    },
    light: {
      '--bg-container-color': '#ffffff',
      '--bg-header-color': 'linear-gradient(to left top, #ede3e3ea, #ede3e3)',
      '--text-color': '#000000',
      '--bg-content-color': '',
      '--bg-footer-color': '#ede3e38f'
    },
    dark: {
      '--bg-container-color': '#1e1e1e',
      '--bg-header-color': 'linear-gradient(to left top, #333333ed, #333)',
      '--text-color': '#ffffff',
      '--bg-content-color': '#333',
      '--bg-footer-color': '#33333398'
    }
  };
  
  export const applyTheme = (themeName) => {
    const theme = themes[themeName];
    Object.keys(theme).forEach(variable => {
      document.documentElement.style.setProperty(variable, theme[variable]);
    });
  };  
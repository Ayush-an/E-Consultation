// ANSI Escape Codes for Terminal Colors
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  underscore: "\x1b[4m",
  blink: "\x1b[5m",
  reverse: "\x1b[7m",
  hidden: "\x1b[8m",
  
  fg: {
    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
    crimson: "\x1b[38m"
  },
  bg: {
    black: "\x1b[40m",
    red: "\x1b[41m",
    green: "\x1b[42m",
    yellow: "\x1b[43m",
    blue: "\x1b[44m",
    magenta: "\x1b[45m",
    cyan: "\x1b[46m",
    white: "\x1b[47m",
    crimson: "\x1b[48m"
  }
};

const logger = {
  info: (msg, tag = 'INFO') => {
    console.log(`${colors.fg.cyan}[${tag}]${colors.reset} ${msg}`);
  },
  success: (msg, tag = 'SUCCESS') => {
    console.log(`${colors.fg.green}${colors.bright}[${tag}]${colors.reset} ${msg}`);
  },
  warn: (msg, tag = 'WARN') => {
    console.log(`${colors.fg.yellow}[${tag}]${colors.reset} ${msg}`);
  },
  error: (msg, error = '', tag = 'ERROR') => {
    console.log(`${colors.fg.red}${colors.bright}[${tag}]${colors.reset} ${colors.fg.red}${msg}${colors.reset}`);
    if (error) {
      console.log(`${colors.fg.red}${error.stack || error}${colors.reset}`);
    }
  },
  db: (msg) => {
    console.log(`${colors.fg.magenta}[DATABASE]${colors.reset} ${msg}`);
  },
  auth: (msg) => {
    console.log(`${colors.fg.blue}[AUTH]${colors.reset} ${msg}`);
  }
};

module.exports = logger;

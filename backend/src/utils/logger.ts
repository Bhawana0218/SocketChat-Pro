const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

const getTimestamp = (): string => new Date().toISOString();

export const logger = {
  info: (message: string, ...args: unknown[]) => {
    console.log(
      `${colors.cyan}[${getTimestamp()}]${colors.reset} ${colors.green}[INFO]${colors.reset} ${message}`,
      ...args
    );
  },
  warn: (message: string, ...args: unknown[]) => {
    console.warn(
      `${colors.cyan}[${getTimestamp()}]${colors.reset} ${colors.yellow}[WARN]${colors.reset} ${message}`,
      ...args
    );
  },
  error: (message: string, ...args: unknown[]) => {
    console.error(
      `${colors.cyan}[${getTimestamp()}]${colors.reset} ${colors.red}[ERROR]${colors.reset} ${message}`,
      ...args
    );
  },
  socket: (message: string, ...args: unknown[]) => {
    console.log(
      `${colors.cyan}[${getTimestamp()}]${colors.reset} ${colors.magenta}[SOCKET]${colors.reset} ${message}`,
      ...args
    );
  },
};

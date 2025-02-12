const LogLevels = {
  off  :    0,	
  debug:  100,
  info :  400,
  warn :  800,
  error: 1000,
  all  : 9999
};

const DEFAULT_LOG_MESSAGE_PREFIX_FORMAT = '${log-level}';

let _currentLogLevel = LogLevels.info;
let _logMessagePrefixFormat = DEFAULT_LOG_MESSAGE_PREFIX_FORMAT;	

let _logLevelIndicator = { };
_logLevelIndicator[LogLevels.debug] = '[debug] ';
_logLevelIndicator[LogLevels.info] = '';
_logLevelIndicator[LogLevels.warn] = '[warn] ';
_logLevelIndicator[LogLevels.error] = '[error] ';

let _logDestination = (level, ...args) => {
  if (level > LogLevels.all) {
    console.log(...args);
  }
  else if (level >= LogLevels.error) {
    console.error(getLogMessagePrefix(LogLevels.error), ...args);
  }
  else if (level >= LogLevels.warn) {
    console.warn(getLogMessagePrefix(LogLevels.warn), ...args);
  }
  else if (level >= LogLevels.info) {
    console.info(getLogMessagePrefix(LogLevels.info), ...args);
  }
  else if (level >= LogLevels.debug) {
    console.debug(getLogMessagePrefix(LogLevels.debug), ...args);
  }
};

/**
 *  Set the log destination for log messages.
 *  @param {*} destination A function that will be called with the log level and any further log message arguments. 
 */
export function setLogDestination(destination) {
  if (typeof destination === 'function') {
    _logDestination = destination;
  }
  else {
    _logDestination(LogLevels.warn, 'Invalid log destination will be ignored: ', destination);
  }
}

/**
 *  Set the log level indicator for the given log level: the string to be shown in log messages.
 * 
 *  @param {string} level - The log level to set the indicator for.
 *  @param {*} indicator - The level text to use in log messages of the given log level.
 */
export function setLogLevelIndicator(level, indicator) {
  if (LogLevels[level] !== undefined) {
    _logLevelIndicator[level] = indicator || '';
  } 
  else {
    _logDestination(LogLevels.warn, `Unknown log level: ${level}`);
  }
}

/**
 *  Set the log message format.
 * 
 *  @param {string} format - The format of the log message, which can contain following placeholders:
 *                           ${log-level} - The active log level indicator, as set by setLogLevelIndicator.
 *                           ${log-time}  - The current timestamp, in ISO format.
 */
export function setLogMessagePrefixFormat(format) {
  if (format) {
    _logMessagePrefixFormat = format;
  }   
  else {
    _logMessagePrefixFormat = DEFAULT_LOG_MESSAGE_PREFIX_FORMAT;
  }
}

export function getLogMessagePrefix(level) {
  return _logMessagePrefixFormat
             .replace('${log-level}', _logLevelIndicator[level] || '')
             .replace('${log-time}', new Date().toISOString());
}

/**
 * Set the minimum log level. Only messages with a higher level will get logged.
 * 
 * @param {*} level The minimum log level. 
 */
export function setLogLevel(level) {
  if (LogLevels[level] !== undefined) {
    if (typeof level === 'number') {
      _currentLogLevel = level;
      return ;
    } 
    else {
      level = level.trim().toLowerCase();
      if (LogLevels.hasOwnProperty(level)) {
        _currentLogLevel = LogLevels[level];
        return ;
      }
    }
  }
  _logDestination(LogLevels.warn, `Unknown log level: ${level}`);
}

/**
 *  Log a message, irrespective of the configured minimum log level.
 */
export function log(...args) {
  console.log(...args);
}

/**
 *  Log an error message.
 */
export function error(...args) {
  if (_currentLogLevel > LogLevels.error) {
    return ;
  }
  _logDestination(LogLevels.error, ...args);  
}

/**
 *  Log a warning message.
 */
export function warn(...args) {
  if (_currentLogLevel > LogLevels.warn) {
    return ;
  }
  _logDestination(LogLevels.warn, ...args);  
}

/**
 *  Log an informational message. 
 */
export function info(...args) {
  if (_currentLogLevel > LogLevels.info) {
    return ;
  }
  _logDestination(LogLevels.info, ...args);  
}

/**
 *  Log a debug message. 
 */
export function debug(...args) {
  if (_currentLogLevel > LogLevels.debug) {
    return ;
  }
  _logDestination(LogLevels.debug, ...args);  
}

export default {
    /* Log levels */
    ALL: 'all',
    DEBUG: 'debug',
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error',
    OFF: 'off',
    /* Config functions */
    setLogLevelIndicator,
    setLogDestination,
    setLogMessagePrefixFormat,
    setLogLevel,
    getLogMessagePrefix,
    /* Logging functions */
    log,
    error,
    warn,
    info,
    debug
}
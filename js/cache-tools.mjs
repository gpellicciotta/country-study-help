// Script to generate a JSON file with a list of all files in a directory tree.

import fs from 'fs';
import dotenv from 'dotenv';
import log from './logging.mjs';
import path from 'path';

dotenv.config();

// Utilities:

function getAllFiles(basePath, dirPath, arrayOfFiles, excludeDirs) {
  if (!dirPath) {
    dirPath = basePath;
  }
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      const relFilePath = path.relative(basePath, filePath);
      if (!excludeDirs.includes(relFilePath)) {
        arrayOfFiles = getAllFiles(basePath, filePath, arrayOfFiles, excludeDirs);
      }
    } 
    else {
      arrayOfFiles.push(path.relative(basePath, filePath));
    }
  });
  return arrayOfFiles;
}

// ========================================
// Main script:

const DEFAULT_INPUT_DIR = '.';
const DEFAULT_OUTPUT_FILE = 'cache-data.json';
const DEFAULT_EXCLUDE_DIRS = [ "node_modules", ".git", ".vscode" ];
const DEFAULT_LOG_LEVEL = 'info';

function showHelp() {
  log.log(`
Usage: node cache-tools.js <command> [--input-dir <dir-name>] [--output-file <file-name>] [--exclude-dirs <comma-separated-dir-names>] [--log-level <level>]

Defaults:
  input-dir   : '${DEFAULT_INPUT_DIR}'
  output-file : '${DEFAULT_OUTPUT_FILE}'
  exclude-dirs: '${DEFAULT_EXCLUDE_DIRS}'
  log-level   : '${DEFAULT_LOG_LEVEL}'

Commands:
  help                   
    Show this help message

  generate
    List all files in the input directory and save the list as a JSON array in the output file    
  `);
}

async function main() {
  const args = process.argv.slice(2);
  console.log("args:", args);
  const command = args[0];
  if (command === "--") {
    command = args[1];
  }
  if (command && command.startsWith('--')) {
    command = command.slice(2);
  }
  
  const inputDirIndex = args.indexOf('--input-dir');
  const inputDirName = inputDirIndex !== -1 ? args[inputDirIndex + 1] : DEFAULT_INPUT_DIR;  

  const outputFileIndex = args.indexOf('--output-file');
  const outputFileName = outputFileIndex !== -1 ? args[outputFileIndex + 1] : DEFAULT_OUTPUT_FILE;

  const excludeDirsIndex = args.indexOf('--exclude-dirs');
  const excludeDirs = excludeDirsIndex !== -1 ? args[excludeDirsIndex + 1].split(',') : DEFAULT_EXCLUDE_DIRS;

  log.setLogMessagePrefixFormat('cache-tools: ${log-level}');
  const logLevelArgIndex = args.indexOf('--log-level');
  let currentLogLevel = logLevelArgIndex !== -1 ? args[logLevelArgIndex + 1] : DEFAULT_LOG_LEVEL;
  log.setLogLevel(currentLogLevel);
  
  switch (command) {
    case 'help':
      showHelp();
      break;

    case 'generate':
      log.info(`Collecting all files in directory '${inputDirName}'...`);	
      const fileList = getAllFiles(inputDirName, null, null, excludeDirs);
      fs.writeFileSync(outputFileName, JSON.stringify(fileList, null, 2));
      log.info(`Cache file saved to '${outputFileName}'`);
      break;

    default:
      log.error('Unknown command:', command);
      showHelp();
      process.exit(1);
  }
}

main();

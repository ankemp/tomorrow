import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';

interface IconData {
  [key: string]: {
    tags: string;
    categories: string;
  };
}

interface InvertedIndex {
  [key: string]: string[];
}

function buildIndex(directory: string): {
  iconData: IconData;
  invertedIndex: InvertedIndex;
} {
  const iconData: IconData = {};
  const invertedIndex: InvertedIndex = {};

  const files = fs.readdirSync(directory);
  files.forEach((filename) => {
    if (filename.endsWith('.json')) {
      const filePath = path.join(directory, filename);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      iconData[filename] = data;

      data.tags.forEach((tag: string) => {
        const lowerTag = tag.toLowerCase();
        if (invertedIndex[lowerTag]) {
          invertedIndex[lowerTag].push(filename);
        } else {
          invertedIndex[lowerTag] = [filename];
        }
      });

      data.categories.forEach((category: string) => {
        const lowerCategory = category.toLowerCase();
        if (invertedIndex[lowerCategory]) {
          invertedIndex[lowerCategory].push(filename);
        } else {
          invertedIndex[lowerCategory] = [filename];
        }
      });
    }
  });

  return { iconData, invertedIndex };
}

// CLI usage
const args = process.argv.slice(2);
const directories: any[] = [];
let outputPath: string | null = null;

args.forEach((arg, index) => {
  if (arg === '--output' || arg === '-o') {
    outputPath = args[index + 1];
  } else if (arg !== args[index - 1]) {
    directories.push(arg);
  }
});

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Usage: node create-dict-tree.js [options] <directory>...

Options:
  --output, -o  Specify the output directory for the index.json file
  --help, -h    Show this help message

Example:
  node create-dict-tree.js --output ./output ./icons
  `);
  process.exit(0);
}

if (directories.length === 0) {
  console.error('Error: Please provide at least one directory as an argument.');
  console.error('Use --help or -h for usage information.');
  process.exit(1);
}

directories.forEach((dir) => {
  const { iconData, invertedIndex } = buildIndex(dir);
  console.log(`Results for directory: ${dir}`);
  console.log('Icon Data:', iconData);
  console.log('Inverted Index:', invertedIndex);

  const outputFilePath = outputPath
    ? path.join(outputPath, 'index.json')
    : path.join(dir, 'index.json');
  const outputData = { iconData, invertedIndex };
  fs.writeFileSync(outputFilePath, JSON.stringify(outputData, null, 2));
  console.log(`Index written to ${outputFilePath}`);
});

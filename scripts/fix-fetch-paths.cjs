const fs = require("fs");
const path = require("path");

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");

  const updated = content.replace(
    /fetch\((`|'|")http:\/\/localhost:8000\/api\/questions\/([a-zA-Z0-9]+)\1/g,
    'fetch(`http://localhost:8000/api/questions?level=$2`'
  );

  if (updated !== content) {
    fs.writeFileSync(filePath, updated, "utf-8");
    console.log(`✅ Corrigé : ${filePath}`);
  }
}

function scanDir(dirPath) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      scanDir(fullPath);
    } else if (file.endsWith(".tsx") || file.endsWith(".js")) {
      updateFile(fullPath);
    }
  }
}

// Lance le scan à partir du dossier contenant tes pages questions
scanDir(path.join(__dirname, "../src/pages/Maths/Test/Questions"));


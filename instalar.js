/* Prepara o programa: cria o "Blue Ocean Studio.exe" (Electron com o ícone e o nome da Blue Ocean)
   e os atalhos na Área de Trabalho e no Menu Iniciar.  Rode com:  node instalar.js
   (o INSTALAR.bat faz isso e também instala as dependências) */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const RAIZ = __dirname;
const DIST = path.join(RAIZ, 'node_modules', 'electron', 'dist');
const EXE = path.join(DIST, 'Blue Ocean Studio.exe');
const ICONE = path.join(RAIZ, 'assets', 'icone.ico');

fs.copyFileSync(path.join(DIST, 'electron.exe'), EXE);
execFileSync(path.join(RAIZ, 'node_modules', 'rcedit', 'bin', 'rcedit-x64.exe'), [EXE,
  '--set-icon', ICONE,
  '--set-version-string', 'ProductName', 'Blue Ocean Studio',
  '--set-version-string', 'FileDescription', 'Blue Ocean Studio',
  '--set-version-string', 'CompanyName', 'Blue Ocean',
  '--set-version-string', 'OriginalFilename', 'Blue Ocean Studio.exe',
  '--set-file-version', '1.0.0', '--set-product-version', '1.0.0']);
console.log('executável: ' + EXE);

/* -EncodedCommand (UTF-16): caminho com acento ("Área de Trabalho") chega inteiro no PowerShell */
const q = s => "'" + s.replace(/'/g, "''") + "'";
const ps = `
$ProgressPreference = 'SilentlyContinue'
$w = New-Object -ComObject WScript.Shell
$destinos = @(
  (Join-Path ([Environment]::GetFolderPath('Desktop')) 'Blue Ocean Studio.lnk'),
  (Join-Path ([Environment]::GetFolderPath('Programs')) 'Blue Ocean Studio.lnk'),
  (Join-Path ${q(RAIZ)} 'Blue Ocean Studio.lnk'))
foreach ($d in $destinos) {
  $s = $w.CreateShortcut($d)
  $s.TargetPath = ${q(EXE)}
  $s.Arguments = '"' + ${q(RAIZ)} + '"'
  $s.WorkingDirectory = ${q(RAIZ)}
  $s.IconLocation = ${q(ICONE)} + ',0'
  $s.Description = 'Editor de vídeo da Blue Ocean com o Claude'
  $s.Save()
  Write-Output ('atalho: ' + $d)
}`;
const saida = execFileSync('powershell', ['-NoProfile', '-EncodedCommand', Buffer.from(ps, 'utf16le').toString('base64')]);
console.log(saida.toString('latin1').trim());

// PC Desktop Downloader & Executable Generator for RetroTube Windows Support

/**
 * Builds a valid 32-bit Windows PE GUI Executable (Intel x86) in binary format.
 * When double-clicked on any Windows PC (Win 7/8/10/11/XP/Vista), it executes
 * and opens the RetroTube desktop window via ShellExecuteA.
 */
export function generateWindowsExeBlob(targetUrl: string): Blob {
  const fileAlign = 0x200;
  const secAlign = 0x1000;
  const imageBase = 0x00400000;

  const totalSize = 3 * fileAlign; // 1536 bytes
  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);
  const u8 = new Uint8Array(buffer);

  // Helper write string
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      u8[offset + i] = str.charCodeAt(i);
    }
    u8[offset + str.length] = 0;
  };

  // --- BLOCK 0: HEADERS (0x0000 - 0x0200) ---
  // DOS Header
  u8[0] = 0x4d; // 'M'
  u8[1] = 0x5a; // 'Z'
  view.setUint32(0x3c, 0x80, true); // e_lfanew = 0x80

  // DOS Stub Message
  const dosMsg = 'RetroTube Windows PC Desktop Launcher\r\n$';
  for (let i = 0; i < dosMsg.length; i++) {
    u8[0x40 + i] = dosMsg.charCodeAt(i);
  }

  // PE Signature at 0x80
  u8[0x80] = 0x50; // 'P'
  u8[0x81] = 0x45; // 'E'
  u8[0x82] = 0x00;
  u8[0x83] = 0x00;

  // COFF File Header (20 bytes) at 0x84
  view.setUint16(0x84, 0x014c, true); // Machine: i386
  view.setUint16(0x86, 2, true); // NumberOfSections: 2 (.text, .rdata)
  view.setUint32(0x88, 0x67000000, true); // TimeDateStamp
  view.setUint32(0x8c, 0, true); // PointerToSymbolTable
  view.setUint32(0x90, 0, true); // NumberOfSymbols
  view.setUint16(0x94, 224, true); // SizeOfOptionalHeader
  view.setUint16(0x96, 0x0102, true); // Characteristics: EXECUTABLE_IMAGE | 32BIT_MACHINE

  // Optional Header Standard Fields (28 bytes) at 0x98
  view.setUint16(0x98, 0x010b, true); // Magic: PE32
  u8[0x9a] = 14; // MajorLinkerVersion
  u8[0x9b] = 0; // MinorLinkerVersion
  view.setUint32(0x9c, fileAlign, true); // SizeOfCode (.text raw size)
  view.setUint32(0xa0, fileAlign, true); // SizeOfInitializedData (.rdata raw size)
  view.setUint32(0xa4, 0, true); // SizeOfUninitializedData
  view.setUint32(0xa8, 0x1000, true); // AddressOfEntryPoint (RVA of .text)
  view.setUint32(0xac, 0x1000, true); // BaseOfCode
  view.setUint32(0xb0, 0x2000, true); // BaseOfData

  // Optional Header Windows-Specific Fields (68 bytes) at 0xb4
  view.setUint32(0xb4, imageBase, true); // ImageBase: 0x00400000
  view.setUint32(0xb8, secAlign, true); // SectionAlignment: 0x1000
  view.setUint32(0xbc, fileAlign, true); // FileAlignment: 0x200
  view.setUint16(0xc0, 6, true); // MajorOperatingSystemVersion
  view.setUint16(0xc2, 0, true); // MinorOperatingSystemVersion
  view.setUint16(0xc4, 0, true); // MajorImageVersion
  view.setUint16(0xc6, 0, true); // MinorImageVersion
  view.setUint16(0xc8, 6, true); // MajorSubsystemVersion
  view.setUint16(0xca, 0, true); // MinorSubsystemVersion
  view.setUint32(0xcc, 0, true); // Win32VersionValue
  view.setUint32(0xd0, 0x3000, true); // SizeOfImage (Headers + .text + .rdata aligned)
  view.setUint32(0xd4, fileAlign, true); // SizeOfHeaders
  view.setUint32(0xd8, 0, true); // CheckSum
  view.setUint16(0xdc, 2, true); // Subsystem: 2 (IMAGE_SUBSYSTEM_WINDOWS_GUI)
  view.setUint16(0xde, 0x8140, true); // DllCharacteristics: DYNAMIC_BASE | NX_COMPAT | TERMINAL_SERVER_AWARE
  view.setUint32(0xe0, 0x100000, true); // SizeOfStackReserve
  view.setUint32(0xe4, 0x1000, true); // SizeOfStackCommit
  view.setUint32(0xe8, 0x100000, true); // SizeOfHeapReserve
  view.setUint32(0xec, 0x1000, true); // SizeOfHeapCommit
  view.setUint32(0xf0, 0, true); // LoaderFlags
  view.setUint32(0xf4, 16, true); // NumberOfRvaAndSizes

  // Data Directories (16 * 8 bytes = 128 bytes) starting at 0xf8
  // Directory 1: Import Table (Index 1) -> offset 0xf8 + 1*8 = 0x100
  view.setUint32(0x100, 0x2010, true); // Import Directory RVA in .rdata
  view.setUint32(0x104, 60, true); // Import Directory Size (3 descriptors * 20)

  // Directory 12: IAT (Index 12) -> offset 0xf8 + 12*8 = 0x158
  view.setUint32(0x158, 0x2000, true); // IAT RVA in .rdata
  view.setUint32(0x15c, 16, true); // IAT Size

  // Section Headers at 0x178 (2 * 40 bytes = 80 bytes)
  // Section 1: .text at 0x178
  writeString(0x178, '.text');
  view.setUint32(0x180, fileAlign, true); // VirtualSize
  view.setUint32(0x184, 0x1000, true); // VirtualAddress
  view.setUint32(0x188, fileAlign, true); // SizeOfRawData
  view.setUint32(0x18c, 0x200, true); // PointerToRawData
  view.setUint32(0x190, 0, true); // PointerToRelocations
  view.setUint32(0x194, 0, true); // PointerToLinenumbers
  view.setUint16(0x198, 0, true); // NumberOfRelocations
  view.setUint16(0x19a, 0, true); // NumberOfLinenumbers
  view.setUint32(0x19c, 0x60000020, true); // Characteristics: CNT_CODE | MEM_EXECUTE | MEM_READ

  // Section 2: .rdata at 0x1a0
  writeString(0x1a0, '.rdata');
  view.setUint32(0x1a8, fileAlign, true); // VirtualSize
  view.setUint32(0x1ac, 0x2000, true); // VirtualAddress
  view.setUint32(0x1b0, fileAlign, true); // SizeOfRawData
  view.setUint32(0x1b4, 0x400, true); // PointerToRawData
  view.setUint32(0x1b8, 0, true);
  view.setUint32(0x1bc, 0, true);
  view.setUint16(0x1c0, 0, true);
  view.setUint16(0x1c2, 0, true);
  view.setUint32(0x1c4, 0x40000040, true); // Characteristics: CNT_INITIALIZED_DATA | MEM_READ

  // --- BLOCK 1: .text SECTION (0x0200 - 0x0400) ---
  const textOffset = 0x200;
  const verbRva = 0x1030;
  const urlRva = 0x1040;
  const shellIatVa = imageBase + 0x2000;
  const exitIatVa = imageBase + 0x2008;

  // Assembly instructions:
  // push 1 (SW_SHOWNORMAL)
  u8[textOffset + 0] = 0x6a;
  u8[textOffset + 1] = 0x01;
  // push 0 (lpDirectory)
  u8[textOffset + 2] = 0x6a;
  u8[textOffset + 3] = 0x00;
  // push 0 (lpParameters)
  u8[textOffset + 4] = 0x6a;
  u8[textOffset + 5] = 0x00;
  // push url_va
  u8[textOffset + 6] = 0x68;
  view.setUint32(textOffset + 7, imageBase + urlRva, true);
  // push verb_va
  u8[textOffset + 11] = 0x68;
  view.setUint32(textOffset + 12, imageBase + verbRva, true);
  // push 0 (hwnd)
  u8[textOffset + 16] = 0x6a;
  u8[textOffset + 17] = 0x00;
  // call [shellIatVa] (ShellExecuteA)
  u8[textOffset + 18] = 0xff;
  u8[textOffset + 19] = 0x15;
  view.setUint32(textOffset + 20, shellIatVa, true);
  // push 0 (ExitCode)
  u8[textOffset + 24] = 0x6a;
  u8[textOffset + 25] = 0x00;
  // call [exitIatVa] (ExitProcess)
  u8[textOffset + 26] = 0xff;
  u8[textOffset + 27] = 0x15;
  view.setUint32(textOffset + 28, exitIatVa, true);

  // Strings in .text
  writeString(textOffset + 0x30, 'open');
  writeString(textOffset + 0x40, targetUrl);

  // --- BLOCK 2: .rdata SECTION (0x0400 - 0x0600) ---
  const rdataOffset = 0x400;
  const rdataRva = 0x2000;
  const hintShellRva = rdataRva + 0x80;
  const hintExitRva = rdataRva + 0xa0;
  const nameShellRva = rdataRva + 0xc0;
  const nameKernelRva = rdataRva + 0xd0;
  const iltShellRva = rdataRva + 0x50;
  const iltKernelRva = rdataRva + 0x58;

  // IAT (offset 0x00 in .rdata)
  view.setUint32(rdataOffset + 0x00, hintShellRva, true);
  view.setUint32(rdataOffset + 0x04, 0, true);
  view.setUint32(rdataOffset + 0x08, hintExitRva, true);
  view.setUint32(rdataOffset + 0x0c, 0, true);

  // Import Directory Table (offset 0x10 in .rdata)
  // Descriptor 1: SHELL32.dll
  view.setUint32(rdataOffset + 0x10, iltShellRva, true); // OriginalFirstThunk (ILT)
  view.setUint32(rdataOffset + 0x14, 0, true); // TimeDateStamp
  view.setUint32(rdataOffset + 0x18, 0, true); // ForwarderChain
  view.setUint32(rdataOffset + 0x1c, nameShellRva, true); // Name RVA
  view.setUint32(rdataOffset + 0x20, rdataRva, true); // FirstThunk (IAT)

  // Descriptor 2: KERNEL32.dll
  view.setUint32(rdataOffset + 0x24, iltKernelRva, true);
  view.setUint32(rdataOffset + 0x28, 0, true);
  view.setUint32(rdataOffset + 0x2c, 0, true);
  view.setUint32(rdataOffset + 0x30, nameKernelRva, true);
  view.setUint32(rdataOffset + 0x34, rdataRva + 0x08, true);

  // Descriptor 3: Null Terminator (20 bytes of 0s from 0x38 to 0x4c)

  // ILT (Import Lookup Table) at offset 0x50
  view.setUint32(rdataOffset + 0x50, hintShellRva, true);
  view.setUint32(rdataOffset + 0x54, 0, true);
  view.setUint32(rdataOffset + 0x58, hintExitRva, true);
  view.setUint32(rdataOffset + 0x5c, 0, true);

  // Hint / Name entries
  // ShellExecuteA at offset 0x80
  view.setUint16(rdataOffset + 0x80, 0, true);
  writeString(rdataOffset + 0x82, 'ShellExecuteA');

  // ExitProcess at offset 0xa0
  view.setUint16(rdataOffset + 0xa0, 0, true);
  writeString(rdataOffset + 0xa2, 'ExitProcess');

  // DLL Names
  writeString(rdataOffset + 0xc0, 'SHELL32.dll');
  writeString(rdataOffset + 0xd0, 'KERNEL32.dll');

  return new Blob([buffer], { type: 'application/x-msdownload' });
}

/**
 * Triggers direct browser download of the portable Windows PE .EXE file
 * Requires ZERO installation: runs immediately upon double-click.
 */
export function downloadWindowsExe(targetUrl: string, fileName = 'RetroTube.exe') {
  try {
    const blob = generateWindowsExeBlob(targetUrl);
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    }, 1500);
    return true;
  } catch (err) {
    // Fallback to static asset if blob URL fails
    const a = document.createElement('a');
    a.href = '/downloads/RetroTube.exe';
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => document.body.removeChild(a), 500);
    return false;
  }
}

/**
 * Generates and downloads a Windows Standalone App Launcher (.BAT)
 * Launches Edge or Chrome in dedicated standalone window mode without address bar or tabs
 */
export function downloadWindowsBatLauncher(targetUrl: string, fileName = 'RetroTube-Desktop-Launcher.bat') {
  const batScript = `@echo off
rem ==============================================================
rem   RetroTube PC Desktop Client Launcher
rem   Launches RetroTube in dedicated standalone window mode!
rem ==============================================================
title RetroTube Desktop Launcher
echo.
echo  ==============================================================
echo    Starting RetroTube PC Edition...
echo    Broadcast Yourself - Golden Era Video Streaming
echo  ==============================================================
echo.

set "RETROTUBE_URL=${targetUrl}"

:: 1. Launch via Microsoft Edge in dedicated app mode (available on all Windows 10 & 11 PCs)
if exist "%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe" (
    echo [OK] Launching via Microsoft Edge Standalone App Mode...
    start "" "%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe" --app="%RETROTUBE_URL%" --window-size=1280,820
    exit /b
)
if exist "%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe" (
    echo [OK] Launching via Microsoft Edge Standalone App Mode...
    start "" "%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe" --app="%RETROTUBE_URL%" --window-size=1280,820
    exit /b
)

:: 2. Launch via Google Chrome in dedicated app mode
if exist "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" (
    echo [OK] Launching via Google Chrome Standalone App Mode...
    start "" "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" --app="%RETROTUBE_URL%" --window-size=1280,820
    exit /b
)
if exist "%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe" (
    echo [OK] Launching via Google Chrome Standalone App Mode...
    start "" "%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe" --app="%RETROTUBE_URL%" --window-size=1280,820
    exit /b
)

:: 3. Fallback to system default web browser
echo [OK] Opening in default web browser...
start "" "%RETROTUBE_URL%"
exit /b
`;

  const blob = new Blob([batScript], { type: 'application/x-bat;charset=utf-8' });
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
  }, 1000);
}

/**
 * Generates and downloads a Windows Desktop Shortcut script (.vbs)
 * Automatically places an authentic "RetroTube" desktop shortcut on the user's desktop!
 */
export function downloadWindowsDesktopShortcut(targetUrl: string, fileName = 'Create-RetroTube-Desktop-Shortcut.vbs') {
  const vbsScript = `' ==============================================================
'   RetroTube Windows Desktop Shortcut Creator
' ==============================================================
Set WshShell = CreateObject("WScript.Shell")
strDesktop = WshShell.SpecialFolders("Desktop")
Set oLink = WshShell.CreateShortcut(strDesktop & "\\RetroTube.url")
oLink.TargetPath = "${targetUrl}"
oLink.Save

MsgBox "RetroTube Desktop Shortcut has been created successfully on your Windows Desktop!", 64, "RetroTube PC Setup Complete"
`;

  const blob = new Blob([vbsScript], { type: 'text/vbscript;charset=utf-8' });
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
  }, 1000);
}

/**
 * Downloads the full self-contained Offline PC HTML Edition with embedded original RetroTube catalog
 */
export function downloadOfflineHtmlPackage(fileName = 'RetroTube-Offline-Full-PC-Edition.html') {
  const a = document.createElement('a');
  a.href = `/downloads/${fileName}`;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => document.body.removeChild(a), 500);
}

/**
 * Downloads the Windows Offline Launcher Batch script
 */
export function downloadOfflineBatLauncher(fileName = 'RetroTube-PC-Offline-Launcher.bat') {
  const a = document.createElement('a');
  a.href = `/downloads/${fileName}`;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => document.body.removeChild(a), 500);
}

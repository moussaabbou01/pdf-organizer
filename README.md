# 📄 PDF Organizer

> A free, open-source desktop application for organizing PDF files. No subscriptions, no limits, no online uploads required.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Made with Electron](https://img.shields.io/badge/Made%20with-Electron-blue.svg)](https://www.electronjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)

## 🎯 Why PDF Organizer?

Tired of expensive PDF tools with monthly subscriptions? Frustrated by upload limits and privacy concerns with online PDF editors? **PDF Organizer** is your solution!

- ✅ **100% Free** - No subscriptions, no hidden costs
- ✅ **Offline First** - Your PDFs stay on your computer
- ✅ **No Limits** - Organize unlimited pages and files
- ✅ **Privacy Focused** - No data sent to any server
- ✅ **Open Source** - Community-driven development

## ✨ Features

### 🔄 Core Features
- **Merge Multiple PDFs** - Combine multiple PDF files into one document
- **Drag & Drop Reordering** - Intuitively reorder pages by dragging thumbnails
- **Page Rotation** - Rotate pages 90° clockwise or counterclockwise
- **Batch Operations** - Select and manipulate multiple pages at once
- **Page Deletion** - Remove unwanted pages before merging

### 🎨 User Experience
- **Live Thumbnail Preview** - See page previews while organizing
- **Zoom Controls** - Adjust thumbnail size for comfortable viewing
- **Undo/Redo** - Full history with Ctrl+Z / Ctrl+Y support
- **Auto-save** - Never lose your work with automatic recovery
- **Modern UI** - Clean, intuitive interface

### ⚡ Performance
- **Lazy Loading** - Thumbnails generated on-demand
- **Memory Efficient** - LRU caching for optimal performance
- **Background Processing** - Export doesn't freeze the UI
- **Progress Tracking** - Real-time export progress with page counts

## 🚀 Installation

### Download Pre-built Application

**Windows (x64)**
1. Download the latest `PDF-Organizer-Setup.exe` from [Releases](https://github.com/moussaabbou01/pdf-organizer/releases)
2. Run the installer
3. Launch PDF Organizer from Start Menu or Desktop

### Build from Source

#### Prerequisites
- Node.js 18+ and npm
- Git

#### Steps
```bash
# Clone the repository
git clone https://github.com/moussaabbou01/pdf-organizer.git
cd pdf-organizer

# Install dependencies
npm install

# Run in development mode
npm start

# Build for production
npm run make:win
```

The installer will be in `out/make/squirrel.windows/x64/`

## 💻 Usage

### Quick Start
1. **Open PDFs** - Click "Open PDF Files" or drag & drop files into the window
2. **Organize** - Drag thumbnails to reorder, use toolbar buttons to rotate/delete
3. **Select Multiple** - Hold Ctrl to select multiple pages for batch operations
4. **Export** - Click "Export PDF" to save your organized document

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl + O` | Open PDF files |
| `Ctrl + S` | Export merged PDF |
| `Ctrl + Z` | Undo |
| `Ctrl + Y` | Redo |
| `Ctrl + A` | Select all pages |
| `Delete` | Delete selected pages |
| `Ctrl + +` | Zoom in |
| `Ctrl + -` | Zoom out |

## 🛠️ Tech Stack

- **Framework**: [Electron](https://www.electronjs.org/) 28
- **UI Library**: [React](https://reactjs.org/) 18 + TypeScript
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) with Immer
- **Drag & Drop**: [@dnd-kit](https://dndkit.com/)
- **PDF Library**: [pdf-lib](https://pdf-lib.js.org/) + [PDF.js](https://mozilla.github.io/pdf.js/)
- **Build Tool**: [Vite](https://vitejs.dev/) + [Electron Forge](https://www.electronforge.io/)

## 📋 System Requirements

- **OS**: Windows 10/11 (64-bit)
- **RAM**: 4 GB minimum, 8 GB recommended
- **Disk Space**: 150 MB for installation
- **.NET Framework**: 4.5+ (usually pre-installed)

## 🗺️ Roadmap

- [ ] **macOS Support** - Build for macOS
- [ ] **Linux Support** - Build for Linux
- [ ] **PDF Splitting** - Split PDFs into multiple files
- [ ] **Page Extraction** - Extract specific pages to new PDF
- [ ] **Bookmarks Support** - Preserve and edit PDF bookmarks
- [ ] **Annotations** - Add text annotations and highlights
- [ ] **Password Protection** - Add passwords to exported PDFs
- [ ] **Batch Export** - Export multiple PDFs at once

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

Please ensure your code follows the existing style and passes all tests.

## 🐛 Bug Reports & Feature Requests

Found a bug? Have an idea? [Open an issue](https://github.com/moussaabbou01/pdf-organizer/issues)!

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [pdf-lib](https://pdf-lib.js.org/) for PDF manipulation
- [PDF.js](https://mozilla.github.io/pdf.js/) by Mozilla for PDF rendering
- [dnd-kit](https://dndkit.com/) for drag-and-drop functionality
- The Electron and React communities

## 💬 Contact

**Moussa Abbou**
- GitHub: [@moussaabbou01](https://github.com/moussaabbou01)
- LinkedIn: [Connect on LinkedIn](https://linkedin.com)

---

<p align="center">
  <strong>⭐ If you find this project useful, please star it on GitHub! ⭐</strong>
  <br>
  Made with ❤️ to solve a real problem
</p>

## 🆘 Support

If PDF Organizer helped you avoid expensive subscriptions, consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs or suggesting features
- 🤝 Contributing code or documentation
- 📢 Sharing with others who need a free PDF tool

---

**Note**: PDF Organizer is completely free and open-source. If someone is trying to sell you this software, please report it.

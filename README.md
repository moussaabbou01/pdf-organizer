# PDF Organizer

A powerful desktop application for organizing, merging, and manipulating PDF documents. Built with Electron, React, and TypeScript.

## ✨ Features

- **📄 Combine PDFs**: Merge multiple PDF files into a single document
- **🔄 Page Manipulation**: Insert, delete, reorder, and rotate pages with ease
- **🖼️ Visual Preview**: Thumbnail grid with lazy loading and caching
- **↔️ Drag and Drop**: Intuitive drag-and-drop page reordering
- **↩️ Undo/Redo**: Full undo/redo support for all operations
- **💾 Auto-save & Recovery**: Automatic backup with crash recovery
- **⚡ Background Processing**: Non-blocking exports with progress feedback

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd PDF_orgenizer

# Install dependencies
npm install
```

### Development

```bash
# Start the app in development mode with hot reload
npm start
```

### Building

```bash
# Package the app for distribution
npm run package

# Create distributable installer
npm run make
```

## 🏗️ Architecture

```
src/
├── main/               # Electron main process
│   ├── index.ts        # App entry point
│   ├── ipc-handlers.ts # IPC communication handlers
│   ├── menu.ts         # Application menu
│   ├── recovery-service.ts  # Crash recovery
│   └── workers/        # Background workers
│       ├── thumbnail-worker.ts
│       └── export-worker.ts
│
├── preload/            # Preload scripts
│   └── index.ts        # Context bridge
│
├── renderer/           # React application
│   ├── App.tsx         # Root component
│   ├── index.tsx       # React entry point
│   ├── components/     # UI components
│   │   ├── MainWindow.tsx
│   │   ├── Toolbar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── StatusBar.tsx
│   │   ├── ThumbnailGrid.tsx
│   │   ├── ThumbnailCard.tsx
│   │   └── dialogs/
│   ├── services/       # Core services
│   │   ├── pdf-service.ts
│   │   ├── thumbnail-service.ts
│   │   ├── cache-service.ts
│   │   └── autosave-service.ts
│   ├── store/          # Zustand state management
│   │   ├── projectSlice.ts
│   │   ├── selectionSlice.ts
│   │   ├── undoSlice.ts
│   │   └── uiSlice.ts
│   └── hooks/          # Custom React hooks
│       ├── usePdfOperations.ts
│       ├── useThumbnails.ts
│       ├── useUndoRedo.ts
│       ├── useSelection.ts
│       ├── useMenuCommands.ts
│       └── useAutosave.ts
│
└── shared/             # Shared types and utilities
    ├── types/
    │   ├── project.ts
    │   ├── operations.ts
    │   └── ipc.ts
    ├── constants.ts
    └── utils/
        ├── path-utils.ts
        └── id-utils.ts
```

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| Desktop Framework | Electron 28 |
| UI Framework | React 18 |
| Language | TypeScript 5 |
| Build Tool | Vite |
| Packaging | Electron Forge |
| PDF Manipulation | pdf-lib (MIT) |
| PDF Rendering | pdfjs-dist (Apache 2.0) |
| State Management | Zustand |
| Drag & Drop | @dnd-kit |
| Testing | Vitest, Playwright |

## 📋 Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start in development mode |
| `npm run package` | Package the app |
| `npm run make` | Build installer |
| `npm run publish` | Publish release |
| `npm test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Lint source files |

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

## 📝 Usage

### Adding PDFs
1. Click the "Add PDF" button in the toolbar or drag files into the window
2. PDFs appear in the sidebar; pages are shown in the main grid

### Organizing Pages
- **Select**: Click to select, Ctrl+click for multi-select, Shift+click for range
- **Reorder**: Drag pages to new positions
- **Rotate**: Right-click and choose rotation, or use toolbar buttons
- **Delete**: Press Delete key or use the toolbar button

### Exporting
1. Click "Export" in the toolbar
2. Choose output location
3. Watch progress in the export dialog
4. PDF is saved when complete

## 🔒 Security

- Context isolation enabled
- Node integration disabled in renderer
- Secure IPC communication
- Input validation on all file operations

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

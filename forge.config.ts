import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { VitePlugin } from '@electron-forge/plugin-vite';

const config: ForgeConfig = {
  packagerConfig: {
    name: 'PDF Organizer',
    executableName: 'pdf-organizer',

    asar: true,
    win32metadata: {
      CompanyName: 'Moussaab boutelis',
      ProductName: 'PDF Organizer',
      FileDescription: 'Free desktop PDF organizer - Merge, reorder, and edit PDFs',
      InternalName: 'PDF Organizer',
      OriginalFilename: 'pdf-organizer.exe'
    }
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      name: 'pdf_organizer'
    }),
    new MakerZIP({}, ['win32', 'darwin', 'linux'])
  ],
  plugins: [
    new VitePlugin({
      build: [
        {
          entry: 'src/main/index.ts',
          config: 'vite.main.config.ts',
        },
        {
          entry: 'src/preload/index.ts',
          config: 'vite.preload.config.ts',
        }
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.ts',
        }
      ]
    })
  ]
};

export default config;

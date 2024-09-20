### Create this:

phaser-project/

├── public/

│ ├── index.html

│ ├── main.ts

├── src/

│ ├── game.ts

├── tsconfig.json

├── webpack.config.js

### Install Dependencies

```bash
npm init
npm install typescript phaser webpack webpack-cli webpack-dev-server ts-loader --save-dev
npm install copy-webpack-plugin --save-dev
npm install @types/phaser --save-dev
```

### Update webpack.config.js

```javascript
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './src/main.ts',
    output: {
        filename: 'bundle.min.js',
        path: path.resolve(__dirname, 'dist'),
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'public'),
        },
        compress: true,
        port: 9000,
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: 'public/index.html', to: 'index.html' },  // Copy index.html to dist
            ],
        }),
    ],
};
```

### Update tsconfig.json
```json
{
  "compilerOptions": {
    "target": "es5",
    "module": "es6",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "moduleResolution": "node"
  },
  "include": [
    "public/**/*.ts",
    "src/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

### Update index.html
```html
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Document</title>
</head>
<body>

</body>
<script src="/bundle.min.js"></script>
</html>
```

### Update main.ts
```typescript
import {Game} from '../src/game';

window.onload = () => {
    new Game();
};
```

### Update game.ts
```typescript
import Phaser from 'phaser';

export class Game {
    game: Phaser.Game;

    constructor() {
        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            width: 800,
            height: 600,
            scene: {
                preload: this.preload,
                create: this.create,
            },
            backgroundColor: '#2d2d2d'
        };

        this.game = new Phaser.Game(config);
    }

    create(this: Phaser.Scene) {
        this.add.text(300, 300, 'Hello Phaser 3 with TypeScript!', {
            font: '24px Arial',
            color: '#ffffff',
        });
    }
}
```

### Compile and run
```bash
npx webpack
npx webpack serve
```

Default is http://localhost:9000/ (changeable in webpack.config.js)

Dist folder can be used on github-pages
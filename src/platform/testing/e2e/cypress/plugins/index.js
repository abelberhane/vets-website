const fs = require('fs');
const path = require('path');
const { table } = require('table');
const createBundler = require('@bahmutov/cypress-esbuild-preprocessor');

const tableConfig = {
  columns: {
    0: { width: 15 },
    1: { width: 85 },
  },
};

module.exports = async on => {
  let appRegistry;
  if (process.env.CYPRESS_CI) {
    // eslint-disable-next-line import/no-unresolved
    appRegistry = require('../../../../../../content-build/src/applications/registry.json');
  } else {
    appRegistry = require('../../../../../../../content-build/src/applications/registry.json');
  }
  // eslint-disable-next-line no-useless-escape
  const nodeModules = new RegExp(/^(?:.*[\\\/])?node_modules(?:[\\\/].*)?$/);
  const dirnamePlugin = {
    name: 'dirname',

    setup(build) {
      // eslint-disable-next-line consistent-return
      build.onLoad({ filter: /.js?$/ }, ({ path: filePath }) => {
        if (!filePath.match(nodeModules)) {
          const regex = /.*\/vets-website\/(.+)/;
          const [, relativePath] = filePath.match(regex);
          let contents = fs.readFileSync(filePath, 'utf8');
          const dirname = path.dirname(relativePath);
          const injectedStuff = `const __dirname = '${dirname.replace(
            'src/',
            '',
          )}';`;
          contents = `${injectedStuff}\n\n${contents}`;
          return {
            contents,
            loader: 'jsx',
          };
        }
      });
    },
  };

  // eslint-disable-next-line no-useless-escape, prettier/prettier
  const nodeModules2 = new RegExp(/^(?:.*[\\\/])?node_modules\/url-search-params(?:[\\\/].*)?$/);
  const dirnamePlugin2 = {
    name: 'dirname2',

    setup(build) {
      // eslint-disable-next-line consistent-return
      build.onLoad({ filter: /.js?$/ }, ({ path: filePath }) => {
        if (filePath.match(nodeModules2)) {
          let contents = fs.readFileSync(filePath, 'utf8');
          contents = ` `;
          return {
            contents,
            loader: 'jsx',
          };
        }
      });
    },
  };

  const dirnamePlugin3 = {
    name: 'dirname3',

    setup(build) {
      // eslint-disable-next-line consistent-return
      build.onLoad({ filter: /.js?$/ }, ({ path: filePath }) => {
        let contents = fs.readFileSync(filePath, 'utf8');
        contents = contents.replace(
          /import Timeouts from 'platform\/testing\/e2e\/timeouts';/,
          `import Timeouts from 'src/platform/testing/e2e/timeouts';`,
        );
        return {
          contents,
          loader: 'jsx',
        };
      });
    },
  };
  let plugins;
  if (process.env.CYPRESS_CI) {
    plugins = [dirnamePlugin, dirnamePlugin2, dirnamePlugin3];
  } else {
    plugins = [dirnamePlugin, dirnamePlugin2];
  }

  const bundler = createBundler({
    entryPoints: ['src/**/*cypress.spec.js*'],
    loader: { '.js': 'jsx' },
    format: 'cjs',
    bundle: true,
    external: ['web-components/react-bindings'],
    banner: { js: `function require(a) { return a; };` },
    define: {
      __BUILDTYPE__: '"vagovprod"',
      __API__: '""',
      __REGISTRY__: JSON.stringify(appRegistry),
      'process.env.NODE_ENV': '"production"',
      'process.env.BUILDTYPE': '"production"',
    },
    plugins,
    platform: 'browser',
    target: ['esnext', 'node14'],
  });
  on('file:preprocessor', bundler);

  on('after:spec', (spec, results) => {
    if (results.stats.failures === 0 && results.video) {
      fs.unlinkSync(results.video);
    }
  });

  on('task', {
    /* eslint-disable no-console */
    log: message => console.log(message) || null,
    table: message => console.log(table(message, tableConfig)) || null,
    /* eslint-enable no-console */
  });
};

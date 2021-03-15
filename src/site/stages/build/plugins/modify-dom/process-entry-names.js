/* eslint-disable no-continue, no-param-reassign */

const path = require('path');
const environments = require('../../../../constants/environments');

const FILE_MANIFEST_FILENAME = 'generated/file-manifest.json';

function copyAssetsToTeamSitePaths(buildOptions, files, entryNamesDictionary) {
  // TeamSite pages such as "benefits.va.gov" have hardcoded references to certain
  // JavaScript bundles so that we can inject our header/footer into pages outside
  // of our source. Therefore, we can't apply a hash to those bundles.
  const teamSiteInjectionBundles = {
    'proxy-rewrite.js': 'generated/proxy-rewrite.entry.js',
    'vendor.js': 'generated/vendor.entry.js',
    'polyfills.js': 'generated/polyfills.entry.js',
    'styleConsolidated.css': 'generated/styleConsolidated.css',
    'static-pages.css': 'generated/static-pages.css',
  };

  for (const [fileManifestKey, teamSitePath] of Object.entries(
    teamSiteInjectionBundles,
  )) {
    const hashedFileName = entryNamesDictionary.get(fileManifestKey);

    if (!hashedFileName) {
      if (buildOptions.entry) {
        // A command arg was passed to build only certain areas of the site, so
        // it makes that it would be missing.
        continue;
      } else {
        throw new Error('Missing Webpack assets required for TeamSite!');
      }
    }

    const hashedFileNameWithoutLeadingSlash = `generated/${
      hashedFileName.split('/generated/')[1]
    }`;
    const file = files[hashedFileNameWithoutLeadingSlash];

    if (!file) continue;

    files[teamSitePath] = file;
  }
}

function getEntryNamesDictionary(buildOptions, files) {
  const isDevBuild = [environments.LOCALHOST, environments.VAGOVDEV].includes(
    buildOptions.buildtype,
  );

  if (isDevBuild) {
    return {
      get(entryName) {
        const isJs = path.extname(entryName) === '.js';
        const fileName = isJs
          ? `${path.parse(entryName).name}.entry.js`
          : entryName;
        return `/generated/${fileName}`;
      },
    };
  }

  const fileManifest = files[FILE_MANIFEST_FILENAME];

  if (!fileManifest) {
    throw new Error('file-manifest.json (generated by Webpack) not found!');
  }

  return new Map(Object.entries(JSON.parse(fileManifest.contents)));
}

module.exports = {
  initialize(buildOptions, files) {
    this.entryNamesDictionary = getEntryNamesDictionary(buildOptions, files);
  },

  modifyFile(fileName, file, files, buildOptions) {
    const { dom } = file;
    if (!dom) return;

    dom('script[data-entry-name],link[data-entry-name]').each((index, el) => {
      // Derive the element properties.
      const $el = dom(el);
      const entryName = $el.data('entryName');
      const attribute = $el.is('script') ? 'src' : 'href';

      // Derive the hashed entry name.
      const hashedEntryName = this.entryNamesDictionary.get(entryName) || '';

      // Assemble the filename so we can match it in the generated files array.
      const fileSearch = `generated/${hashedEntryName.split('/generated/')[1]}`;

      // Ensure we have valid options and that the entry exists.
      const entryExists = files[fileSearch];

      if (
        buildOptions.buildtype !== environments.LOCALHOST &&
        !buildOptions.isPreviewServer &&
        !buildOptions.entry &&
        !entryExists
      ) {
        throw new Error(`Entry Name "${entryName}" was not found.`);
      }

      // Link the element to the hashed entry name w/o the S3 bucket
      $el.attr(attribute, `/${fileSearch}`);
      file.modified = true;
    });
  },

  conclude(buildOptions, files) {
    if (!buildOptions.isPreviewServer) {
      copyAssetsToTeamSitePaths(buildOptions, files, this.entryNamesDictionary);
    }
  },
};

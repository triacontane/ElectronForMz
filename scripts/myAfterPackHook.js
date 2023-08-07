const {join} = require('path');
const asarmor = require('asarmor');
const {encrypt} = require('asarmor');

exports.default = async ({appOutDir, packager}) => {
    try {
        const asarPath = join(packager.getResourcesDir(appOutDir), 'app.asar');

        // encrypt file contents first
        const root = join(__dirname, '..');
        const src = join(packager.info.projectDir, root);
        const dst = asarPath;
        const keyFilePath = join(
            root,
            'node_modules',
            'asarmor',
            'build',
            'src',
            'encryption',
            'key.txt'
        );
        console.log(`  \x1B[34m•\x1B[0m asarmor encrypting contents of ${src} to ${dst}`);
        await encrypt({src, dst, keyFilePath});

        // then patch the header
        console.log(`  \x1B[34m•\x1B[0m asarmor applying patches to ${asarPath}`);
        const archive = await asarmor.open(asarPath);
        archive.patch(); // apply default patches
        await archive.write(asarPath);
    } catch (err) {
        console.error(err);
    }
};

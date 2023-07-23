const {join} = require('path');
const {copyFile} = require('fs/promises');

exports.default = async context => {
    try {
        console.log('  \x1B[34m•\x1B[0m copying native dependencies');

        const asarmorModuleDir = join(__dirname, '..', 'node_modules', 'asarmor');
        const mainNodePath = join(asarmorModuleDir, 'build', 'Release', 'main.node');
        const rendererNodePath = join(asarmorModuleDir, 'build', 'Release', 'renderer.node');

        // copy main.node
        await copyFile(
            mainNodePath,
            join(context.packager.info.projectDir, 'dist', 'main', 'main.node')
        );
        // copy renderer.node
        await copyFile(
            rendererNodePath,
            join(
                context.packager.info.projectDir,
                'dist',
                'renderer',
                'renderer.node'
            )
        );
    } catch (err) {
        console.error(err);
    }
};

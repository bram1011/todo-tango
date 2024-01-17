/** @type {import('next').NextConfig} */
const FilterWarningsPlugin = require('webpack-filter-warnings-plugin');
const nextConfig = {
    experimental: {
        serverComponentsExternalPackages: ["typeorm"],
        instrumentationHook : true,
    },
    webpack: (config) => {
        config.ignoreWarnings = [
            { module: /node_modules\/typeorm\/util\/ImportUtils\.js/ },
            {
            module:
                /node_modules\/typeorm\/util\/DirectoryExportedClassesLoader\.js/,
            },
            { module: /node_modules\/typeorm\/platform\/PlatformTools\.js/ },
            {
            module:
                /node_modules\/typeorm\/connection\/ConnectionOptionsReader\.js/,
            },
        ];
        config.plugins.push(
            new FilterWarningsPlugin({
            exclude: [
                /mongodb/,
                /mssql/,
                /mysql/,
                /mysql2/,
                /oracledb/,
                /pg/,
                /pg-native/,
                /pg-query-stream/,
                /react-native-sqlite-storage/,
                /redis/,
                /sqlite3/,
                /sql.js/,
                /typeorm-aurora-data-api-driver/,
                /hdb-pool/,
                /spanner/,
                /hana-client/,
            ],
            })
        );
        return config;
    }
}

module.exports = nextConfig

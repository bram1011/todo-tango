/** @type {import('next').NextConfig} */
require('next-ws/server').verifyPatch();

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
});
const FilterWarningsPlugin = require('webpack-filter-warnings-plugin');
const nextConfig = {
    reactStrictMode: true,
    experimental: {
        serverComponentsExternalPackages: ["typeorm"],
        instrumentationHook : true,
    },
    async headers() {
        return [
            {
                // matching all API routes
                source: "/api/:path*",
                headers: [
                    { key: "Access-Control-Allow-Credentials", value: "true" },
                    { key: "Access-Control-Allow-Origin", value: "*" },
                    { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
                    { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
                ]
            }
        ]
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
};

module.exports = withPWA(nextConfig);

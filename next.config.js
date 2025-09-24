/** @type {import('next').NextConfig} */
const nextConfig = { reactStrictMode: true };
module.exports = nextConfig;
/** Force UTF-8 so no mojibake */
module.exports.headers = async () => ([
  { source: '/(.*)', headers: [{ key: 'Content-Type', value: 'text/html; charset=utf-8' }] }
]);
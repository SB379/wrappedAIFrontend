/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
              protocol: 'https',
              hostname: 'platform-lookaside.fbsbx.com',
            },
            {
              protocol: 'https',
              hostname: 'oaidalleapiprodscus.blob.core.windows.net',
            },
            
          ],
    },
}

module.exports = nextConfig

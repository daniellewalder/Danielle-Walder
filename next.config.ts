import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,

  /**
   * The public route vocabulary is /read, /search, /tuesday-test, /about and
   * /contact. Anything that ever pointed at the old internal routes lands on
   * the right page instead of a 404.
   */
  async redirects() {
    return [
      { source: '/overthinking-real-estate', destination: '/read', permanent: true },
      { source: '/overthinking-real-estate/:slug*', destination: '/read', permanent: true },
      { source: '/quizzes', destination: '/tuesday-test', permanent: true },
      { source: '/quizzes/:slug*', destination: '/tuesday-test', permanent: true },
      { source: '/listings', destination: '/search', permanent: true },
      { source: '/listings/:slug*', destination: '/search', permanent: true },
      { source: '/home-valuation', destination: '/contact', permanent: true },
    ]
  },
}

export default nextConfig

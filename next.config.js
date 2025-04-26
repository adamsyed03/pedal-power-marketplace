module.exports = {
  // ... other config options
  async redirects() {
    return [
      {
        source: '/aboutus',
        destination: '/bout-us',
        permanent: true,
      },
      {
        source: '/about',
        destination: '/bout-us',
        permanent: true,
      },
      {
        source: '/about-us',
        destination: '/bout-us',
        permanent: true,
      }
    ]
  },
} 
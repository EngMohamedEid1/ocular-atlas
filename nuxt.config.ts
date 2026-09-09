export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: false,
  devtools: { enabled: true },
  css: ['~/assets/css/main.css', '~/assets/css/theme.css'],
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss', '@vite-pwa/nuxt'],
  app: {
    head: {
      title: 'Ocular Atlas | Complete Eye & Ophthalmology Atlas',
      meta: [{ name: 'description', content: 'Offline interactive atlas for complete eye anatomy and ophthalmology learning.' }],
      link: [{ rel: 'icon', type: 'image/png', href: '/brand/ophthalmic-atlas-mark.png' }]
    }
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Ocular Atlas', short_name: 'Ocular Atlas',
      description: 'Interactive offline atlas for complete eye anatomy and ophthalmology learning', theme_color: '#07111f',
      background_color: '#07111f', display: 'standalone',
      icons: [{ src: '/brand/ophthalmic-atlas-mark.png', sizes: '1280x1280', type: 'image/png', purpose: 'any' }]
    },
    workbox: { navigateFallback: '/' },
    // Service workers are generated for production; disabling the dev worker
    // prevents Vite from serving a stale temporary service-worker file.
    devOptions: { enabled: false }
  }
})

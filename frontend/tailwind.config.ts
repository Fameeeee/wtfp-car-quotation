// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './components/**/*.{vue,js,ts}',
        './pages/**/*.{vue,js,ts}',
        './app.vue'
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Noto Sans Thai"', 'sans-serif'],
            }
        }
    },
    plugins: []
}

export default config

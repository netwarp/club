let mix = require('laravel-mix')

require('laravel-mix-svelte')

mix
    .js('resources/js/services/chat/app.js', 'public/js/chat.js')
    .svelte()
    .disableNotifications()
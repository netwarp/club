<script>
    // TODO ungroup global and security
    import {onMount} from 'svelte'
    import axios from 'axios'

    let user = {}
    let error = null

    onMount(async () => {
        try {
            const url = 'http://localhost:8080/api/users/logged'

            const response = await axios.get(url) // TODO .env
            user = response.data

        } catch (e) {

        }
    })

    async function handleForm() {
        const url = `http://localhost:8080/api/users/logged`
        const response = await axios.post(url, {
            username: user.username,
            email: user.email,
            bio: user.bio,
            password: user.password,

        })
    }

</script>

<div class="container px-5 py-6 mx-auto flex">
    <form on:submit|preventDefault={handleForm} class="bg-gray-100 rounded-lg p-8 flex flex-col md:ml-auto w-full mt-10 md:mt-0 relative z-10 shadow-md">
        <h2 class="text-gray-900 text-lg mb-1 font-medium title-font">Mon profil</h2>
        <div class="relative mb-4">
            <label for="username" class="leading-7 text-sm text-gray-600">Nom</label>
            <input type="text" id="username" name="username" class="w-full bg-white rounded border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" bind:value={user.username}>
        </div>
        <div class="relative mb-4">
            <label for="bio" class="leading-7 text-sm text-gray-600">Email</label>
            <input type="email" id="email" name="email" class="w-full bg-white rounded border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" bind:value={user.email}>
        </div>
        <div class="relative mb-4">
            <label for="bio" class="leading-7 text-sm text-gray-600">Bio</label>
            <input type="text" id="bio" name="email" class="w-full bg-white rounded border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out">
        </div>
        <div class="relative mb-4">
            <label for="password" class="leading-7 text-sm text-gray-600">Mot de passe</label>
            <input type="password" id="password" name="password" class="w-full bg-white rounded border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out">
        </div>
        <button class="text-white bg-blue-500 border-0 py-2 px-6 focus:outline-none hover:bg-blue-600 rounded text-lg">Button</button>
        <p class="text-xs text-gray-500 mt-3">Chicharrones blog helvetica normcore iceland tousled brook viral artisan.</p>
    </form>
</div>
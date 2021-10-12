<script>
    import {onMount} from 'svelte'
    import axios from 'axios'

    let user = {}
    let error = null

    onMount(async () => {
        try {
            const url = new URL(window.location.href)
            let username = url.pathname
            username = username.substr(1)

            const response = await axios.get(`http://localhost:8080/api/users/${username}`) // TODO .env
            user = response.data

            console.log(user)
        } catch (e) {

        }
    })
</script>

<div>
    <h1>{user.username}</h1>
    <div>{new Date().getFullYear() - user.birth_year } ans</div>
</div>
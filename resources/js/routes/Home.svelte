<script>
    import {onMount} from 'svelte'
    import axios from 'axios'
    import {Link} from 'svelte-routing'

    import UserProfile from './UserProfile'

    let users = []
    let error = null

    onMount(async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/users')
            users = response.data
            // console.log(users)
        } catch (e) {
            error = e
        }
    })
</script>

<div class="p-5 flex flex-wrap">
    {#each users as user}
        <div class="bg-white m-5 card">
            <div class="card-image">
                <Link to="{user.username}"><img src="https://picsum.photos/seed/picsum/200/150" alt=""></Link>
            </div>
            <div class="card-content p-3">
                <div>{user.username}</div>
                <div>{new Date().getFullYear() - user.birth_year } ans</div>
                <div>Paris</div>
            </div>
            <div class="card-footer flex text-center border-t-2 border-fuchsia-600 text-center p-3">
                <Link to="{user.username}">Voir profil</Link>
            </div>
        </div>
    {/each}
</div>
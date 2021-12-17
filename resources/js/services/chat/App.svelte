<script>
    import axios from 'axios'

    import Preview from './components/Preview.svelte'

    let chats = []
    let error = null

    async function fetch() {
        const url = '/api/chats'
        const response = await axios.get(url)
        const data = response.data

        chats = data
        console.log(chats)
    }
    fetch()
</script>

<div class="container">
    {#each chats as chat}
        <Preview user_id_1="{chat.user_id_1}" user_id_2="{chat.user_id_2}" />
    {/each}
</div>
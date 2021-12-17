<script>
    import axios from 'axios'

    export let user_id_1 = Number
    export let user_id_2 = Number

    async function fetch() {
        const url = '/api/chats/contacts'
        const response = await axios.post(url, {
            user_id_1,
            user_id_2
        })

        console.log(response)
    }

    fetch()
</script>

<div class="bg-white p-5 m-5">
    <div>id  {user_id_1}</div>
    <div>id  {user_id_2}</div>
</div>
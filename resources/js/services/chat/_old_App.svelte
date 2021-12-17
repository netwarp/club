<script>

    let text = ''

    let messages = []
    messages = [
        {
            from: 'me',
            text: 'lorem ipsum'
        },
        {
            from: 'you',
            text: 'aaa aaa aaa'
        }
    ]


    async function handleForm(event) {

        if ( ! text) return

        const message = {
            from: 'me',
            text
        }

        messages = [...messages, message]

        text = ''
    }
</script>

<div class="border border-gray-200 bg-white p-2 rounded-lg mb-4">
    <div class="chat-space flex-col">

        {#each messages as message}
            <div class="message {message.from === 'me' ? 'bg-blue-100 text-right' : 'bg-red-100'} p-2 mb-3 rounded-lg">
                {message.text}
            </div>
        {/each}
    </div>

    <form on:submit|preventDefault={handleForm}>
        <input type="text" class="border-2 border-gray-400 w-full p-1" bind:value={text}>
    </form>
</div>
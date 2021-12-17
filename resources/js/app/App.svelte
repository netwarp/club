<script>
    import { Router, Link, Route } from 'svelte-routing'

    import Home from './routes/Home'


    const routes = [
        {
            link: '/',
            text: 'Explorer'
        },
        {
            link: '/chat',
            text: 'Chat'
        },
        {
            link: '/notifications',
            text: 'Notifications'
        },
        {
            link: '/favorites',
            text: 'Favoris'
        },
        {
            link: '/compte',
            text: 'Mon compte'
        }
    ]

    export let url = "";

</script>


<div class="flex-col w-full md:flex md:flex-row md:min-h-screen bg-blueGray-50">
    <div class="flex flex-col flex-shrink-0 w-full bg-white shadow-xl text-blueGray-700 md:w-64">
        <Router url="{url}">
            <nav class="flex-grow pb-4 pr-4 md:block md:pb-0 md:overflow-y-auto">
                <Link to="/" class="block px-4 py-2 mt-2 text-base transition duration-500 ease-in-out transform border-l-4 border-blue-600 text-blueGray-500 focus:shadow-outline focus:outline-none focus:ring-2 ring-offset-current ring-offset-2 hover:text-black">Home</Link>

            </nav>
        </Router>

        <Route path="/"><Home /></Route>
    </div>

    <div>
        <Route path="/"><Home /></Route>
    </div>
</div>

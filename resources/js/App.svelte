<script>
    // https://dribbble.com/shots/11547484-Twitter-UI-Kits-Design/attachments/3168151?mode=media

    import { Router, Link, Route } from 'svelte-routing'

    import Home from './routes/Home'
    import Notifications from './routes/Nofifications'
    import Messages from './routes/Messages'
    import Favorites from './routes/Favorites'
    import UserProfile from './routes/UserProfile'
    import MyProfile from './routes/MyProfile.svelte'

    export let url = ''
</script>
<Router url="{url}">
    <div class="container flex items-stretch">
        <div class="p-5 w-1/5 bg-gray-100">
            <nav class="flex flex-col">
                <Link to="/">Home</Link>
                <Link to="notifications">Notifications</Link>
                <Link to="messages">Messages</Link>
                <Link to="compte">Mon compte</Link>
            </nav>
        </div>
        <div class="">
            <Route path="/"><Home /></Route>
            <Route path="notifications" component="{Notifications}" />
            <Route path="messages" component="{Messages}" />
            <Route path="favoris" component="{Favorites}" />
            <Route path="compte" component="{MyProfile}" />
            <Route path="*" component="{UserProfile}" />
        </div>
    </div>
</Router>
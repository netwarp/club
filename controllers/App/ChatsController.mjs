const ChatsController = {
    async index(request, response) {

        const data = {
            auth: request.user
        }

        return response.render('app/chats.html', data)
    }
}

export default ChatsController
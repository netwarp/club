const NotificationsController = {

    async index(request, response) {

        const data = {
            auth: request.user
        }
        return response.render('app/notifications.html', data)
    }
}

export default NotificationsController
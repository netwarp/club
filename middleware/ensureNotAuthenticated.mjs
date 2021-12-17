export default (request, response, next) => {
    if ( ! request.isAuthenticated()) {
        return next()
    }

    response.redirect('/')
}
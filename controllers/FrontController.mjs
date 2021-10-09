const FrontController = {
    async index(request, response) {

        const data = {
            auth: request.user
        }
        console.log('---- --- -')
        console.log(data)

        return response.render('index.html', data)
    },


}

export default FrontController
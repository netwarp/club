import { readFile } from 'fs/promises'

const ImagesController = {
    async index(request, response) {
        const src = request.params.src
        const url = PATH.storage + '/app/avatars/' + src

        readFile(url).then((buffer) => {
            return response
                .header('image/jpg')
                .end(buffer)
        }).catch((error) => {
            console.log(error)
            return response.status(404)
        })
    }
}

export default ImagesController
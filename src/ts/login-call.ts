import Service from "./service"

export default class LoginCall {
    private services?: Service

    async execute() {
        let username = document.getElementById('username')!.innerText
        let password = document.getElementById('password')!.innerText

        this.services = new Service()
        const resp = await this.services.getToken(username, password)
        console.log("resp: " + resp)
    }

}
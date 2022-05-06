export default class Service {

    constructor() {
    }

    async getToken(username: string, password: string): Promise<string> {
        const response = await fetch("http://localhost:8080/api/v1/authenticate/user", {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin //origin: 'http://localhost',
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'include', // include, *same-origin, omit //same-origin
            headers: {
                'Authorization': 'Bearer ',
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify({'username': username, 'password': password}) // body data type must match "Content-Type" header
        });
        const resp = await response.json()
        console.log('response from method: ' + resp)
        return resp; // parses JSON response into native JavaScript objects
    }
}
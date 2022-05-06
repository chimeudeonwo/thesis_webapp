/*import {getAuthToken, getLoginFormData, requestAuthInit} from "./pureJs.js";

const authUrl = 'http://localhost:8080/api/v1/authenticate/user'

document.getElementById('login').addEventListener('click', async () => {
    const userInfo = getLoginFormData('loginForm');

    if(!userInfo.username || !userInfo.password){
        return
    }
    console.log('Jwt Authentication requested!')
    const responseType = {jwtToken: '', userId: 0}
    const resp = await getAuthToken(authUrl, requestAuthInit(userInfo))

    if (resp) {
        // console.log('resp token: ', resp.jwtToken)
        localStorage.setItem('jwtToken', resp.jwtToken)
        localStorage.setItem('userId', resp.userId)
        // setInterval(() => liveUpdate(), 10000)
        window.location.assign('../../login.html');
    }
}) */
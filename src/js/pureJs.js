import {createDefaultDisplayEmAlertResponseOfThisAgency} from "./displayEmAlertResponse.js";
import {State} from "./state.js";

const authUrl = 'http://localhost:8080/api/v1/authenticate/user'

function fetch_api() {
    let loginForm = document.getElementById('loginForm')
    let formData = new FormData(loginForm);

    let data = {'username': formData.get('username'), 'password': formData.get('password')}
    console.log('data: ' + JSON.stringify(data))

    let header = new Headers;
    header.append('Access-Control-Allow-Origin', '*');
    header.append('Content-Type', 'application/json');
    header.append('Authorization', '');

    const myInit = {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        cache: 'default',
        headers: header,
        body: JSON.stringify(data) //Object.assign(data)
    };

    /*.then() always returns a promise. A promise takes two functions (function onSuccess(), function onFailure()) as arguments
       .then() always returns a promise either onSuccess function or onFailure function */
    const result = fetch(url, myInit)
        .then(function onSuccess(response) {
            response.text().then(function onSuccess(text) {
                localStorage.setItem('jwtToken', text)
                let toJsonObj = {jwtToken: ''}
                let toJson = JSON.parse(text)
                console.log(toJson.jwtToken)
            }, function onFail(text) {
                console.log('failed to get auth token')
            });
        }, function onFailure(response) {
            console.log('Auth token fetch call Failed!')
        });
}



// -------------- Execution starts ---------------------
const getTableRef = document.getElementById('em_alert_display_section');

// login form button click listener //username: sec7 pass:pass7
document.getElementById('login').addEventListener('click', async () => {
    console.log('Jwt Authentication requested!')
    const respType = {user_id: 0, user_token: ''}
    let resp = await getAuthToken(authUrl, requestAuthInit(getLoginFormData('loginForm')))
    // console.log('resp: ', resp)
    if (resp) {
        //display the table
        getTableRef.style.display ="block";

        // hide login form
       const hideLoginForm = document.getElementById('login_form_section');
        hideLoginForm.style.display ="none";

        const respJson = JSON.parse(JSON.stringify(resp))
        // console.log('resp token: ', respJson.user_token)
        localStorage.setItem('jwtToken', respJson.user_token)
        localStorage.setItem('userId', respJson.user_id)
        setInterval(() => liveUpdate('First'), 5000) // 5 seconds
        // setTimeout(() => liveUpdate('First'), 5000) // 5 seconds
    }
})

/**if userId and authToken is not null (for logged agency), validate both userId and authToken otherwise wait for the user to login*/
if (getUserId()  && getUserAuthToken()) {
    const getUserId_url = 'http://localhost:8080/api/v1/user/getUserId/' + getUserId()

    const validate_userId_and_token = await fetch(getUserId_url, requestGetInit())
    const validation_response = await validate_userId_and_token

    if(validation_response.status === 200){
        //display the table
        getTableRef.style.display ="block";
        setInterval(() => liveUpdate('Second'), 5000) // 5 seconds
    }
    else console.error("Error occurred: ", validation_response)
}
// -------------------- End of execution ----------------




// __________________________________ Start of methods to be called ___________________________________________
function getUserId() {
    return localStorage.getItem('userId')
}

function getUserAuthToken() {
    return localStorage.getItem('jwtToken')
}

// TODO: only reload the html if response.currentStatus === 'new'
export async function liveUpdate(call) {
    // console.log('await fetchNotNewEmAlertResponse(): ' + await fetchNotNewEmAlertResponse())
    console.log(call + ' call --> live update called!') //username: patto4 pass:passsec4
    //const emAlertRespUlr = `http://localhost:8080/api/v1/agency/notNewEmAlertResponse/${localStorage.getItem('userId')}` //user must to be agency
    const emAlertRespUlr = `http://localhost:8080/api/v1/agency/viewEmAlert/${getUserId()}` //user must be agency
    const arrV = [0]
    const newState = new State(arrV)
    //return setInterval(async () => await newState.make_a_request(emAlertRespUlr, requestGetInit()), 10000)    //sixty thousand ms
    return newState.make_a_request(emAlertRespUlr, requestGetInit())
}

function getLoginFormData(formId) {
    let loginForm = document.getElementById(formId)
    let formData = new FormData(loginForm);
    const userDetails = {'username': formData.get('username'), 'password': formData.get('password')}
    if(!userDetails.username || !userDetails.password){
        alert('Username and Password must not be empty');
        return
    }
    return userDetails
}

function customHeader(authValue) {
    let header = new Headers;
    header.append('Access-Control-Allow-Origin', '*');
    header.append('Content-Type', 'application/json');
    header.append('Authorization', authValue);
    return header
}

/**only for jwt authentication.*/
export function requestAuthInit(userDetails) {
    let header = new Headers;
    header.append('Access-Control-Allow-Origin', '*');
    header.append('Content-Type', 'application/json');
    return {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        // cache: 'default',
        headers: header,
        body: JSON.stringify(userDetails) //Object.assign(data) TODO: the userDetails must be encoded before transmitting.
    };
}

/** For all other subsequent request.*/
export function requestGetInit() {
    return {
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
        cache: 'default',
        headers: customHeader('Bearer ' + localStorage.getItem('jwtToken')),
    };
}

export function requestPostInit(postBody) {
    return {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        cache: 'default',
        headers: customHeader('Bearer ' + localStorage.getItem('jwtToken')),
        body: JSON.stringify(postBody)
    };
}

/** requests from auth token from the server. On success, saves userId to the local storage of the user with key jwtToken*/
async function getAuthToken(url, reqInit) {
    const resp = await fetch(url, reqInit)
    // console.log('resp1: ', resp)
    if (resp.status === 200) {
        return resp.json()
    }
}

const responseJson = {
    emAlertResponseId: 0, agencyAlerted_agencyId: 0, emAlertId_emAlertResponse: 0,
    date: null, rcvStatus: '', sentStatus: '', currentStatus: '', time: null
}

/**makes a request to the server to get all emAlertResponse for the given agency and upon response sends to the server that
 * the client has received the response*/

// -------------------------- Starts -----------------------------------
async function make_a_request(url, requestInit) {
    const resp = fetch(url, requestInit)
    const result = (await resp).text()
    let latestEmAlertResponses = JSON.parse(await result)

    if (!latestEmAlertResponses) {
        throw new Error('make_a_request returned null or undefined')
    }
    console.log('make-a-request called!')

    //call the display function only if new emResponse arrives
    createDefaultDisplayEmAlertResponseOfThisAgency(latestEmAlertResponses, 'tableId')
}

//----------------End -------------------

export async function postClientResponse(emResponseId) {
    //wait for click event
    const postBody = {
        rcvStatus: 'received',
        currentStatus: 'on-going',
        emAlertResponseId: emResponseId // localStorage.getItem('emResponseId')
    }
    const rcvStatusUrl = `http://localhost:8080/api/v1/victim/getEmAlertResponse/${localStorage.getItem('userId')}` //user must be agency
    const clientResponse = fetch(rcvStatusUrl, requestPostInit(postBody))
    return (await clientResponse).text()
}

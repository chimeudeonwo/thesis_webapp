
import {requestGetInit} from "./pureJs.js";
import {
    isPreviousToLatestEmAlertResponseEqual,
    displayEmAlertResponse,
    getEmAlertResponseTableRef,
    comparePreviousToLatestEmAlertResponse
} from "./displayEmAlertResponse.js";

export class State {
    static responseState = []
    constructor(stateVariable) {
        this.stateVariable = stateVariable;
    }

    test() {
        console.log('testing!')
    }

    async make_a_request(url, requestInit) {
        // console.log(this.stateVariable)
        localStorage.setItem('duration', null);
        let start_time = new Date().getMilliseconds();
        const resp = await fetch(url, requestInit)
        const end_time = new Date().getMilliseconds();
        let duration = (((end_time - start_time) / 1000) % 60);
        // Save the duration it took to make request and get the response to localstorage
        localStorage.setItem('duration', String(duration)) // in seconds.
        const serverResponse = (await resp).text() //await resp
        // console.log('result', await result);
        let latestEmAlertResponse = JSON.parse(await serverResponse)
        // console.log('before static ', State.responseState);
        //let resultToJson = await resp.json()

        if(!latestEmAlertResponse) {
            throw new Error('make_a_request returned null or undefined')
        }

        /*fetch(url, requestInit)
            .then(resp => resp.json())
            .then((packageJson) => {
                console.log(packageJson);
            }); */
        //call the display function only if new emResponse arrives
        //createDefaultDisplayEmAlertResponseOfThisAgency(getNotAllNewEmAlertResponse(resultToJson))
      const diff = comparePreviousToLatestEmAlertResponse(latestEmAlertResponse, State.responseState)
        displayEmAlertResponse(diff)
        // console.log('diff ', diff);

        State.responseState = latestEmAlertResponse
        // console.log('after static ', State.responseState);
    }

   /* createAndDisplayNewEmAlert(newEmAlertResponseArray) {
        displayEmAlertResponse(newEmAlertResponseArray, getEmAlertResponseTableRef(), containsNewResponse(newEmAlertResponseArray))
    }*/

}

import {
    displayEmAlertResponse,
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
        localStorage.setItem('duration', String(duration))
        const serverResponse = (await resp).text()
        let latestEmAlertResponse = JSON.parse(await serverResponse)

        if(!latestEmAlertResponse) {
            throw new Error('make_a_request returned null or undefined')
        }

      const diff = comparePreviousToLatestEmAlertResponse(latestEmAlertResponse, State.responseState)
        displayEmAlertResponse(diff)
        // console.log('diff ', diff);

        State.responseState = latestEmAlertResponse
    }
}
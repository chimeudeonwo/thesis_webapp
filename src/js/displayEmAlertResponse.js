//import fs from "./node_modules/fs-extra/lib/fs/index.js"
import {postClientResponse} from './pureJs.js';

/** displays all em alert responses that are not new */
export function createDefaultDisplayEmAlertResponseOfThisAgency(notNewEmAlertResponseArray, tableId) {
    let tableRef = document.getElementById(tableId)
    // console.log('notNewEmAlertResponseArray.length: ' + notNewEmAlertResponseArray.length)
    if (tableRef.rows.length < notNewEmAlertResponseArray.length) {
        displayEmAlertResponse(notNewEmAlertResponseArray, tableRef)
    } else {
        displayEmAlertResponse(notNewEmAlertResponseArray, tableRef)
    }
}

export function getEmAlertResponseTableRef() {
    return document.getElementById('table-emAlert-response')
}

/**checks if the passes concatenated array is null or contains sth*/
export function containsNewResponse(newEmAlertResponseArr) {
    // console.log('contains: ', newEmAlertResponseArr)
    for (let i = 0; i < newEmAlertResponseArr.length; i++) {
        if (newEmAlertResponseArr[i].currentStatus === 'new') {
            return true
        }
    }
    return false
}

export function displayEmAlertResponse(emAlertResponse) {
    // if no difference, do not display nothing
    if (!emAlertResponse) {
        // console.log('emAlertResponse in display is: ', emAlertResponse)
        return
    }

    let responseType = {
        emAlertResponseId: 0, agencyAlerted_agencyId: 0, emAlertId_emAlertResponseId: 0,
        rcvStatus: '', sentStatus: '', currentStatus: '', localDate: null, time: null
    }

    //create table and get the table body <tbody> ref
    const emAlertResponseTableBodyRef = document.getElementById('table-emAlert-response')
    //const emAlertResponseTableBodyRef = createTable('table')

    for (let i = 0; i < emAlertResponse.length; i++) {
        //create type
        responseType = emAlertResponse[i]

        // create a new row i.e <tr>
        let newRow = emAlertResponseTableBodyRef.insertRow();

        //set the row id
        newRow.id = responseType.emAlertResponseId

        // create a new cell i.e. <td>
        let emAlertResponseId = newRow.insertCell();
        let agencyAlerted_agencyId = newRow.insertCell();
        let emAlertId_emAlertResponse = newRow.insertCell();    // emRespId, agencyId, sent., rcv, date, time
        let sentStatus = newRow.insertCell();
        let rcvStatus = newRow.insertCell();
        let currentStatus = newRow.insertCell();
        let localDate = newRow.insertCell();
        let time = newRow.insertCell();

        // add value to the cell
        emAlertResponseId.innerHTML = responseType.emAlertResponseId;
        agencyAlerted_agencyId.innerHTML = responseType.agencyAlerted_agencyId;
        emAlertId_emAlertResponse.innerHTML = responseType.emAlertId_emAlertResponseId;
        sentStatus.innerHTML = responseType.sentStatus;
        rcvStatus.innerHTML = responseType.rcvStatus;
        currentStatus.innerHTML = responseType.currentStatus;
        localDate.innerHTML = responseType.localDate;

        // responseType.time = duration in seconds (form server). NB: // localStorage.getItem('duration') already in seconds.
        let duration = Number(localStorage.getItem('duration')) + Number(responseType.time) // in seconds
        if(duration !== 0 && duration < 0){
            duration = (duration * -1);
        }
        time.innerHTML = String((duration).toFixed(4) + ' seconds'); //in seconds
        console.log('Number(responseType.time)', Number(responseType.time))

        //format text
        newRow.style.color = "#FFFFFF";
        newRow.style.fontSize = "20px";

        // add color to every new row
        if(responseType.currentStatus === "new"){
            newRow.style.backgroundColor = "#FF0000";
        }
        else if(responseType.currentStatus === "on-going"){
            newRow.style.backgroundColor = '#def605';
            newRow.style.color = "#090404";
        }
        else {
            newRow.style.backgroundColor = "#24fc03";
        }


        //add click event to every new row
        document.getElementById(newRow.id).addEventListener('click', async () => {
            await postClientResponse(newRow.id)
            //await fetchEmAlertResponse(url) //to reload the page for the new ones updated
            window.location.reload();
        })
    }
}

/**function to return all displayed row data */
export function getAllAlreadyDisplayedRowIds() {
    let allDisplayedEmAlertResponse = []
    let tableLength = document.getElementById("table-emAlert-response").rows.length;
    //let tableRowsArr = document.getElementById("table-emAlert-response").rows; // document.getElementById("table-emAlert-response").rows[i].cells
    let i = 1, j = 0;   // 0 index is for the head <th>
    for (i; i < tableLength; i++) {
        allDisplayedEmAlertResponse[j++] = document.getElementById("table-emAlert-response").rows[i].id
    }
    return allDisplayedEmAlertResponse
}

/*export async function writeLatestEmAlertResponse(emAlertResponse) {
    // for the first time, both would be the same until the first click
    let latestEmAlertResponsePath
    if(fse.pathExists('/latestEmAlertResponse.json')){
        latestEmAlertResponsePath = '/latestEmAlertResponse.json'
    }
    //const latestEmAlertResponsePath = path.resolve('/latestEmAlertResponse.json');
    //fs.writeFileSync(path.resolve(previousEmAlertResponsePath), emAlertResponse, "utf-8") //try it later
    const writeFilePromise = new Promise((resolve, reject) => {
        fse.write(path.resolve(latestEmAlertResponsePath), emAlertResponse, err => {
            if (err) {
                return reject(err)
            }
            resolve()
        })
    })

    await writeFilePromise
    return latestEmAlertResponsePath
} */

/**Compares the previous emAlert response to the latest emAlert response from server
 * @return returns true if equal or false if not equal*/
export function isPreviousToLatestEmAlertResponseEqual(latestEmAlertResponse) {
    //const stringSimilarity = require('string-similarity');

    //let previousEmAlertResponse = fs.readFileSync(path.resolve('/latestEmAlertResponse.json'));
    let previousEmAlertResponse = localStorage.getItem('previousEmAlertResponse')

    return previousEmAlertResponse === JSON.stringify(latestEmAlertResponse)

    /* const similarity = stringSimilarity.compareTwoStrings(previousEmAlertResponse, latestEmAlertResponse);
     console.log('similarity: ', similarity)

     return similarity*/
}

//compares previous and latest emAlert response and saves the difference to localStorage and return the difference
export function comparePreviousToLatestEmAlertResponse(latestEmAlertResponse, previousEmAlertResponse) {
    let newEmAlertResponseArr = []

    if ((previousEmAlertResponse.length <= 0)) {
        // console.log('previousEmAlertResponse is possible null : ', previousEmAlertResponse)
        // for the very first time
        //localStorage.setItem('emAlertResponseDifference', JSON.stringify(latestEmAlertResponse))
        newEmAlertResponseArr = latestEmAlertResponse
        return newEmAlertResponseArr
    }

    if (JSON.stringify(latestEmAlertResponse) === JSON.stringify(previousEmAlertResponse)) {
        // console.log('latest and previous is equal i.e. no new emAlert, hence, do nothing')
        // console.log('previous ', previousEmAlertResponse, 'latest: ', latestEmAlertResponse)

        return // dont do nothing if they are equal
    }

    //otherwise compute the difference and return it
    for (let i = 0; i < latestEmAlertResponse.length; i++) {
        if (JSON.stringify(latestEmAlertResponse[i]) !== JSON.stringify(previousEmAlertResponse[i])) {
            // console.log('latest, previous not eq: ', latestEmAlertResponse[i], previousEmAlertResponse[i])
            newEmAlertResponseArr.push(latestEmAlertResponse[i])
        }
    }

    // when an em alert is deleted (for whatever reason)
    if(latestEmAlertResponse.length < previousEmAlertResponse.length){
        for(let i = 0; i < previousEmAlertResponse.length; i++){
            if (JSON.stringify(previousEmAlertResponse[i]) !== JSON.stringify(latestEmAlertResponse[i])) {
                console.log('previous, latest not eq: ', previousEmAlertResponse[i], latestEmAlertResponse[i])
                newEmAlertResponseArr.push(previousEmAlertResponse[i])
            }
        }
    }
    console.log('newEmAlertResponseArr: ', newEmAlertResponseArr)
    //localStorage.setItem('emAlertResponseDifference', JSON.stringify(newEmAlertResponseArr))
    return newEmAlertResponseArr
}

function createButton(tagName) {
    const btn = document.createElement(tagName)
    btn.innerHTML = "Do confirmation";

    // 2. Append somewhere
    let body = document.getElementsByTagName("body")[0];
    body.appendChild(btn);

// 3. Add event handler
    btn.addEventListener("click", function () {
        alert("did something");
    });

    return btn
}

/**Creates a new table, adds the table head and tbody and returns reference to the table body
 * @param tagName is the table
 * @return returns the newly created table*/
function createTable(tagName) {
    //create table tag and assign it and id
    const emAlertResponseTable = document.createElement(tagName)
    emAlertResponseTable.id = 'newTable-emAlert-response'

    //Append somewhere
    let body = document.getElementsByTagName("body")[0];
    body.appendChild(emAlertResponseTable);

    //create thead, tb, tr, td
    let emAlertResponseTableHead = emAlertResponseTable.appendChild(document.createElement('thead'))
    // Append somewhere
    //emAlertResponseTable.appendChild(emAlertResponseTableHead)

    let EmAlertResponseId = emAlertResponseTableHead.appendChild(document.createElement('th'))
    EmAlertResponseId.innerHTML = 'EmAlertResponseId'
    let AgencyId = emAlertResponseTableHead.appendChild(document.createElement('th'))
    AgencyId.innerHTML = 'AgencyId'
    let EmAlertId = emAlertResponseTableHead.appendChild(document.createElement('th'))
    EmAlertId.innerHTML = 'EmAlertId'
    let SentStatus = emAlertResponseTableHead.appendChild(document.createElement('th'))
    SentStatus.innerHTML = 'SentStatus'
    let ReceivedStatus = emAlertResponseTableHead.appendChild(document.createElement('th'))
    ReceivedStatus.innerHTML = 'ReceivedStatus'
    let CurrentStatus = emAlertResponseTableHead.appendChild(document.createElement('th'))
    CurrentStatus.innerHTML = 'CurrentStatus'
    let Date = emAlertResponseTableHead.appendChild(document.createElement('th'))
    Date.innerHTML = 'Date'
    let Time = emAlertResponseTableHead.appendChild(document.createElement('th'))
    Time.innerHTML = 'Time'

    //create tbody tr, td
    return emAlertResponseTable.appendChild(document.createElement('tbody'));

}





















//const URI_CREATE = "https://tvds-service.herokuapp.com/api/involvedPartys";
//const URI_UPDATE = "https://tvds-service.herokuapp.com/api/involvedPartys/";
//const URI_QUERY = "https://tvds-service.herokuapp.com/api/involvedPartys/query";
const URI_CREATE = "https://tvds-service-prod-7lgq2xsobq-de.a.run.app/api/involvedPartys";
const URI_UPDATE = "https://tvds-service-prod-7lgq2xsobq-de.a.run.app/api/involvedPartys/";
const URI_QUERY = "https://tvds-service-prod-7lgq2xsobq-de.a.run.app/api/involvedPartys/query";
// const URL_POST = "http://localhost:3000/api/involvedPartys";

const request = require('request');

exports.request = request;
/**
 * send query to TVDS REST API
 * @param {string} firstNameThai
 * @param {string} lastNameThai
 * @param {string} mobileNumber
 */
exports.sendQuery = function(firstNameThai, lastNameThai, mobileNumber) {
    return new Promise((resolve, reject) => {

        // Crete Query value
        var queryBody = {};
        queryBody.firstNameThai = firstNameThai || " ";
        queryBody.lastNameThai = lastNameThai || " ";
        queryBody.mobileNumber = mobileNumber || " ";
        // console.log(queryBody);

        // Send post request and query body
        request.post(
            {
                url: URI_QUERY,
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(queryBody)
            },
            (err, res, body) => {
                if (err) {
                    reject(err);
                } else {
                    //console.log("--Query part --")
                    //console.log("status : " + res.statusCode)
                    //console.log(body);

                    resolve(body);
                } 
            }     
        );
    });

}

/**
 * send request create new involveParty
 * @param {JSON} involvedParty that send request 
 * return body
 */
exports.sendCreate = function(involvedParty) {
    return new Promise((resolve, reject) => {
        request.post(
            {
                url: URI_CREATE,
                headers: {"Content-Type": "application/json"},
                body: involvedParty
            },
            (err, res, body) => {
                if (err) {
                    reject(err);
                } else {
                    // console.log(res.body);
                    resolve(res.body);
                } 
            }     
        );
    });
}

/**
 * Send update value to TVDS REST API
 * @param {string} objID object id that want to update
 * @param {JSON} involvedParty that send request 
 */
exports.sendUpdate = function(objID, newInvolvedParty) {
    return new Promise((resolve, reject) => {
        request.put(
            {
                url: URI_UPDATE + objID,
                headers: {"Content-Type": "application/json"},
                body: newInvolvedParty
            },
            (err, res, body) => {
                if (err) {
                    reject(err);
                } else {
                    // console.log(res.body);
                    resolve(res.body);
                } 
            }     
        );
    });
}
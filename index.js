'use strict';

var connection = require('./connection.js');
var twilio = require('twilio');
var mysql = require('mysql');
var squel = require('squel');
var contactNumber = [];
var userAddress = "";
//Event trigger for Dash Button

exports.handler = function (event, context, callback) {


    // Build the MySQL query for the User's Address
	var queryString = squel.select()
								.from("addresses")
                               	.field("address")
                               	.field("city")
                               	.field("state")
                               	.field("zip")
                               	.where("uid = 1")
                               	.toString();
            // console.log(queryString);
    // Query the DB and build the userAddress String
    connection.query(queryString, function (err, data) {
       console.log(data);
       var userAddress = data[0].address + " " + data[0].city + ", " + data[0].state + " " + data[0].zip;
       console.log(userAddress);
 
    // Build the MySQL query for the emergency contact numbers
    var queryString = squel.select()
                          .from("contacts")
                          .field("cphone")
                          .toString();

    // Query the DB and populate the contactNumber array which contains the reformatted numbers
    connection.query(queryString, function (err, data) {
       console.log(data);
       var contactNumber = [];
       for (var i=0; i<data.length;i++) {
        var number = data[i].cphone;
        number = number.replace(/[^\d]/g, '');
        number = "+1"+number 
        contactNumber.push(number);
	}
     console.log(contactNumber)
    
	// console.log('Received event:', event.clickType);
	// May just throw everything into here instead of referencing from environment for Lambda
	var twilio_account_sid = "ACd70e7f437051f3322e495dd39dc8237f";
	var twilio_auth_token = "3cd27552128685f7bfe39b918f698a14";
	// Pull number from DB
	// var my_phone_number = "+16095050940";
	// text message body.
	// var new_body = `${event.serialNumber} -- processed by Lambda. Battery voltage: ${event.batteryVoltage}`;
	var new_body = "HELP! I've fallen and I can't get up! I'm currently at " + userAddress;
	// Create new restclient which will access the API using our credentials
	var client = new twilio.RestClient(twilio_account_sid, twilio_auth_token);
	// Twilio requires XML so this is an empty one to store our response in
	var xml = '<?xml version="1.0" encoding="UTF-8"?><Response></Response>';
	var toNumber = number;
	for (var i = 0; i<contactNumber.length;i++) {
	client.sendSms({
		// Where the SMS is sent to (ACCESS THIS FROM THE DATABASE)
		to: contactNumber[i],
		// From our Twilio number
		from: "+16092514231",
		body: new_body
	}, function(error, message){
		if (!error) {
			var log_message = message.sid+" "+message.dateCreated+" "+new_body;
			console.log(log_message);
            // context.succeed(xml);
        } else {
        	console.log(error);
           	// context.fail(xml);
		}
	});
};
});	
});
};

/**
 * The following JSON template shows what is sent as the payload:
{
    "serialNumber": "GXXXXXXXXXXXXXXXXX",
    "batteryVoltage": "xxmV",
    "clickType": "SINGLE" | "DOUBLE" | "LONG"
}
 *
 * A "LONG" clickType is sent if the first press lasts longer than 1.5 seconds.
 * "SINGLE" and "DOUBLE" clickType payloads are sent for short clicks.
 *
 * For more documentation, follow the link below.
 * http://docs.aws.amazon.com/iot/latest/developerguide/iot-lambda-rule.html
 */

//===============================================================
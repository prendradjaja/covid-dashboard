/*
	This file doesn't actually write to the lambda. However, 
	it is a static copy of the code running there (currently managed by hand)
*/

const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const request = require('request')
const csv = require('csvtojson')
const _ = require('lodash')

// Function which reads from the NYT CSV File and writes the output to S3 in location-specific buckets
const consolidateNYTCSV = async(url) => { 
    let allLocations;
    // NYT
    await csv()
    .fromStream(request.get(url))
    .then(async (json)=>{
        let LocationScopeData = _.mapValues(_.groupBy(json, t => (t.county ? `${t.county}, ` : "") + t.state +  ", " + t.fips), (dates) => ({
            dates,
            source: "NYT"
        }))
        allLocations = Object.keys(LocationScopeData);
        await Promise.all(Object.entries(LocationScopeData).map(
            async ([key, value]) => s3.putObject({
                Bucket: process.env.BUCKET,
                Key: `locations/${key}.json`,
                Body: JSON.stringify(value)
            }).promise() 
        ))
    });
    
    return allLocations
}

// Function which reads from the CoronaDataScraper sit and condenses 
const consolidateCDSCSV = async(url) => { 
    let allLocations;
    await csv()
    .fromStream(request.get(url))
    .then(async (json)=>{
        let LocationScopeData = _.mapValues(_.groupBy(json, t => t.name), (dates) => ({
            dates,
            source: "Corona Data Scraper",
        }))
        allLocations = Object.keys(LocationScopeData);
        await Promise.all(Object.entries(LocationScopeData).map(
            async ([key, value]) => s3.putObject({
                Bucket: process.env.BUCKET,
                Key: `locations/${key}.json`,
                Body: JSON.stringify(value)
            }).promise() 
        ))
    });
    
    return allLocations
}

exports.handler = async (event) => {
    let stateLocations = await consolidateNYTCSV("https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-states.csv")
    let countyLocations = await consolidateNYTCSV("https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv")
    let cdsLocations = await consolidateCDSCSV("https://coronadatascraper.com/timeseries.csv")
    
    await s3.putObject({
        Bucket: process.env.BUCKET, 
        Key: "search-cds.json", 
        Body: JSON.stringify(cdsLocations)}
    ).promise()
    
    await s3.putObject({
        Bucket: process.env.BUCKET, 
        Key: "search-nyt.json", 
        Body: JSON.stringify(countyLocations.concat(stateLocations))}
    ).promise()
}
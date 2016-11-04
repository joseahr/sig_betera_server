const XMLParser = require('xml2json');
const request = require('request-promise');

const parse = serviceUrl =>
    request({ url : serviceUrl, method : 'HEAD' })
    .then(headers => {
        if(!headers['content-length'] || headers['content-length'] > 5*1024*1024) 
            return [];

        return request({ url : serviceUrl, method : 'GET' })
        .then( capabilities =>{
            let capabilitiesJSON = JSON.parse(XMLParser.toJson(capabilities));
            try {

                let layers = ( capabilitiesJSON['WMS_Capabilities'] || capabilitiesJSON['WMT_MS_Capabilities'] )['Capability']['Layer']['Layer']
                return layers;
            } catch (e){
                return [];
            }
        })
        .catch(err => []);
    });

module.exports = {
    parse
}
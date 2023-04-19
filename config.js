const fs = require('fs');
let configCache;

function getValue(key) {
    if (!configCache) getConfig();
    return configCache[key];
}

function setValue(key, value) {
    if (!configCache) getConfig();
    configCache[key] = value;
    setConfig(configCache);
}

function setConfig(object) {
    fs.writeFile('config.json', JSON.stringify(object), err => {
        if (err) console.error(err);
    });
    configCache = object;
}

function getConfig() {
    try {
        let buffer = fs.readFileSync('config.json');
        let data = JSON.parse(buffer.toString());

        configCache = data;
        return data;
    } catch (e) {
        console.error(e);
        return {
            votingOpen: true,
            registrationOpen: true
        };
    }
}


module.exports = { getValue, setValue, getConfig, setConfig };
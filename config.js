const fs = require('fs');

function votingOpen() {
    try {
        let buffer = fs.readFileSync('config.json');
        let data = JSON.parse(buffer.toString());

        return data.votingOpen;
    } catch (e) {
        console.error(e);
        return true;
    }
}

function setVotingOpen(value) {
    let data = JSON.stringify({
        votingOpen: value,
        registrationOpen: registrationOpen()
    });

    fs.writeFile('config.json', data, err => {
        if (err) console.error(err);
    });
}

function registrationOpen() {
    try {
        let buffer = fs.readFileSync('config.json');
        let data = JSON.parse(buffer.toString());

        return data.registrationOpen;
    } catch (e) {
        console.error(e);
        return true;
    }
}

function setRegistrationOpen(value) {
    let data = JSON.stringify({
        registrationOpen: value,
        votingOpen: votingOpen()
    });

    fs.writeFile('config.json', data, err => {
        if (err) console.error(err);
    });
}

function setConfig(object) {
    fs.writeFile('config.json', JSON.stringify(object), err => {
        if (err) console.error(err);
    });
}

function getConfig() {
    try {
        let buffer = fs.readFileSync('config.json');
        let data = JSON.parse(buffer.toString());

        return data;
    } catch (e) {
        console.error(e);
        return {
            votingOpen: true,
            registrationOpen: true
        };
    }
}


module.exports = { votingOpen, registrationOpen, getConfig, setConfig };
let votesButton = document.getElementById('votes-btn');

votesButton.onclick = async () => {
    const res = await fetch('/api/cars/highestvotes').then(res => res.json());
    let dataContainer = document.getElementById('data');
    dataContainer.innerText = '';
    dataContainer.innerHTML += `<h1 style="margin-bottom: 1rem;">Votes: ${res.votes}</h1>`;
    res.cars.forEach(car => {
        dataContainer.innerHTML += `
        <h3>${car.owner}'s</h3>
        <h4>${car.year} ${car.make} ${car.model}</h4>
        <p style="margin-bottom: 1rem;">Search Phrase: ${car.searchPhrase || 'None'}</p>
        `;
    });
};

let carCreateBtn = document.getElementById('car-create-btn');
let carMsg = document.getElementById('car-create-msg');

// carMsg.style.color = res.success ? '' : 'red';
// carMsg.innerText = res.message;

carCreateBtn.onclick = async () => {
    carMsg.innerText = '';
    let owner = document.getElementById('owner-in').value;
    let make = document.getElementById('make-in').value;
    let model = document.getElementById('model-in').value;
    let year = document.getElementById('year-in').value;
    let searchPhrase = document.getElementById('searchphrase-in').value;
    if (!(make && model && year && owner)) {
        carMsg.style.color = 'red';
        carMsg.innerText = 'Fill in all the fields first!';
        return;
    }

    if (searchPhrase) {
        console.log('fetching')
        console.log({ make, model, year, owner, searchPhrase })

        let res = await fetch('/api/cars', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            mode: 'cors',
            body: JSON.stringify({ make, model, year, owner, searchPhrase })
        }).then(res => res.json());

        carMsg.style.color = res.success ? '' : 'red';
        carMsg.innerText = res.message;

        //GEN QR HERE.
    } else {

    }
};
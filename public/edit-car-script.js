let updateBtn = document.getElementById('car-update');
let archiveBtn = document.getElementById('car-archive')
let carMsg = document.getElementById('car-create-msg');

// carMsg.style.color = res.success ? '' : 'red';
// carMsg.innerText = res.message;

updateBtn.onclick = async () => {
    let id = document.getElementById('id-in').value;

    carMsg.innerText = '';
    let owner = document.getElementById('owner-in').value;
    let make = document.getElementById('make-in').value;
    let model = document.getElementById('model-in').value;
    let year = document.getElementById('year-in').value;
    let votes = document.getElementById('votes-in').value;
    let res = await fetch(`/api/cars/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
        body: JSON.stringify({ make, model, year, owner, votes })
    }).then(res => res.json());

    carMsg.style.color = res.success ? '' : 'red';
    carMsg.innerText = res.message;
};

archiveBtn.onclick = async () => {
    let id = document.getElementById('id-in').value;
    let archived = document.getElementById('archived-in').value == 'true' ? true : false;

    let res = await fetch(`/api/cars/archive?ids=${id}` + (archived ? '&unarchive=true' : '')).then(res => res.json());

    carMsg.innerText = res.message;
};
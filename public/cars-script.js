let tablebody = document.getElementById('table-body');
let msg = document.getElementById('cars-msg');

let page = 1;
let hasNextPage = true;

window.addEventListener('load', loadCars(page));
window.addEventListener('click', () => {
    if (msg.innerText !== '') msg.innerText = '';
});
document.getElementById('next-page').addEventListener('click', () => {
    if (hasNextPage) loadCars(++page)
});
document.getElementById('last-page').addEventListener('click', () => {
    if (page > 1) loadCars(--page);
});

async function loadCars(page) {
    tablebody.innerHTML = '';

    let results = 15;
    let req = await fetch(`/api/cars/cars?results=${results}&page=${page}`);
    let { cars } = await req.json();

    hasNextPage = cars.length > 0;
    cars.forEach(car => {
        let row = document.createElement('tr');

        let box = document.createElement('input');
        box.setAttribute('type', 'checkbox');
        box.setAttribute('name', car._id);
        box.id = car._id;
        let boxtd = document.createElement('td');
        boxtd.appendChild(box);
        row.appendChild(boxtd);

        let owner = document.createElement('td');
        owner.innerText = car.owner;
        row.appendChild(owner);

        let make = document.createElement('td');
        make.innerText = car.make;
        row.appendChild(make);

        let model = document.createElement('td');
        model.innerText = car.model;
        row.appendChild(model);

        let year = document.createElement('td');
        year.innerText = car.year;
        row.appendChild(year);

        let registered = document.createElement('td');
        let date = new Date(car.created_at);
        registered.innerText = date.toLocaleString('en-US');
        row.append(registered);

        let votes = document.createElement('td');
        votes.innerText = car.votes;
        row.appendChild(votes);

        tablebody.appendChild(row);
    });

    document.getElementById('page-num').innerText = `Page: ${page}`;
}

document.getElementById('select-all').addEventListener('click', e => {
    document.querySelectorAll('#cars td input[type=checkbox]').forEach(checkbox => checkbox.checked = e.target.checked);
});

document.getElementById('create-pdf').addEventListener('click', async () => {
    let selected = Array.from(document.querySelectorAll('#cars td input[type=checkbox]')).filter(box => box.checked).map(box => box.id);

    let res = await fetch(`/api/cars/multipage?ids=${selected.join(';')}`);
    if (res.status != 200) {
        let json = await res.json();
        msg.innerText = json.message ? json.message : 'An error occured processing your request.';
        msg.style.color = 'red';
        return;
    }
    let file = await res.blob();
    let a = document.createElement('a');
    a.href = window.URL.createObjectURL(file);
    a.download = 'QR Codes';
    a.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
});

document.getElementById('clear-votes').addEventListener('click', async () => {
    let selected = Array.from(document.querySelectorAll('#cars td input[type=checkbox]')).filter(box => box.checked).map(box => box.id);

    let req = await fetch(`/api/cars/clearvotes?ids=${selected.join(';')}`);
    let res = await req.json();

    msg.style.color = req.status == 200 ? 'white' : 'red';
    msg.innerText = res.message;

    if (req.status == 200) loadCars(page);
});

document.getElementById('archive').addEventListener('click', async () => {
    let selected = Array.from(document.querySelectorAll('#cars td input[type=checkbox]')).filter(box => box.checked).map(box => box.id);

    let req = await fetch(`/api/cars/archive?ids=${selected.join(';')}`);
    let res = await req.json();

    msg.style.color = req.status == 200 ? 'white' : 'red';
    msg.innerText = res.message;

    if (req.status == 200) loadCars(page);
});
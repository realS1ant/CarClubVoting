let tablebody = document.getElementById('table-body');

let page = 1;
let hasNextPage;

window.addEventListener('load', loadCars(page));
document.getElementById('next-page').addEventListener('click', () => {
    console.log("hello")
    loadCars(++page)
});
document.getElementById('last-page').addEventListener('click', () => {
    if (page > 1) loadCars(--page);
});

async function loadCars(page) {
    tablebody.innerHTML = '';

    let results = 15;
    let req = await fetch(`/api/cars/cars?results=${results}&page=${page}`);
    let { cars } = await req.json();
    hasNextPage = cars.length == results;
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

document.getElementById('create-pdf').addEventListener('click', async e => {
    let selected = Array.from(document.querySelectorAll('#cars td input[type=checkbox]')).filter(box => box.checked).map(box => box.id);

    let res = await fetch(`/api/cars/multipage?ids=${selected.join(';')}`);
    let file = await res.blob();
    console.log(file);
    let a = document.createElement('a');
    a.href = window.URL.createObjectURL(file);
    a.download = 'QR Codes';
    a.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
});
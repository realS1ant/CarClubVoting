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
    let download = document.getElementById('download-in').checked;
    if (!(make && model && year && owner)) {
        carMsg.style.color = 'red';
        carMsg.innerText = 'Fill in all the fields first!';
        return;
    }

    if (searchPhrase) {
        let res = await fetch('/api/cars', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            mode: 'cors',
            body: JSON.stringify({ make, model, year, owner, searchPhrase })
        }).then(res => res.json());

        carMsg.style.color = res.success ? '' : 'red';
        carMsg.innerText = res.message;

        document.getElementById('owner-in').value = '';
        document.getElementById('make-in').value = '';
        document.getElementById('model-in').value = '';
        document.getElementById('year-in').value = '';
        document.getElementById('searchphrase-in').value = '';

        if (download) generateQRCode(searchPhrase);
    } else {
        let res = await fetch('/api/cars', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            mode: 'cors',
            body: JSON.stringify({ make, model, year, owner })
        }).then(res => res.json());

        carMsg.style.color = res.success ? '' : 'red';
        carMsg.innerText = res.message;

        document.getElementById('owner-in').value = '';
        document.getElementById('make-in').value = '';
        document.getElementById('model-in').value = '';
        document.getElementById('year-in').value = '';
        document.getElementById('searchphrase-in').value = '';

        if (download) generateQRCode(res.car._id)
    }
};

async function generateQRCode(query) {
    let res = await fetch(`/api/cars/qrcode/${query}`).then(res => {
        if (res.status == 500) {
            return;
        } else return res.blob();
    });

    let pdf = new File([res], `${query}.pdf`);


    //sketch download
    let a = document.createElement('a');
    a.style.display = 'none';
    a.setAttribute('href', URL.createObjectURL(pdf));
    a.setAttribute('download', `${query}.pdf`);

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
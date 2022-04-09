let registerBtn = document.getElementById('register-btn');
let registerMsg = document.getElementById('register-header');

registerBtn.onclick = async () => {
    registerMsg.innerText = '';
    let owner = document.getElementById('owner').value;
    let make = document.getElementById('make').value;
    let model = document.getElementById('model').value;
    let year = document.getElementById('year').value;
    if (!(make && model && year && owner)) {
        registerMsg.style.color = 'red';
        registerMsg.innerText = 'Fill in all the fields first!';
        return;
    }

    let res = await fetch('/api/register', {
        method: 'POST',
        method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            mode: 'cors',
            body: JSON.stringify({ make, model, year, owner })
    }).then(res => res.json());

    registerMsg.style.color = res.success ? '' : 'red';
    registerMsg.innerText = res.message;

    if(res.success) {
        let li = document.createElement('li');
        li.appendChild(document.createTextNode(`${res.car.year} ${res.car.make} ${res.car.model}`));
    
        document.getElementById('registered-cars').appendChild(li);
    
        document.getElementById('owner').value = '';
        document.getElementById('make').value = '';
        document.getElementById('model').value = '';
        document.getElementById('year').value = '';
    }
};
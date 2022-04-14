let msg = document.getElementById('config-msg');
let voting = document.getElementById('voting');
let registration = document.getElementById('registration');

window.addEventListener('load', async () => {
    let req = await fetch('/api/admin/config');
    let res = await req.json();

    voting.checked = res.data.votingOpen;
    registration.checked = res.data.registrationOpen;
});

document.getElementById('update-btn').addEventListener('click', async () => {
    let req = await fetch('/api/admin/setconfig', {
        method: 'PATCH',
        body: JSON.stringify({
            voting: voting.checked,
            registration: registration.checked
        }),
        headers: {
            'Content-type': 'application/json'
        }
    });
    let res = await req.json();
    voting.checked = res.data.votingOpen;
    registration.checked = res.data.registrationOpen;
    msg.innerText = res.message;
});

window.addEventListener('click', () => {
    if (msg.innerText !== '') msg.innerText = '';
});
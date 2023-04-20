let msg = document.getElementById('config-msg');

window.addEventListener('load', async () => {
    let req = await fetch('/api/admin/config');
    let config = (await req.json()).data;

    document.querySelectorAll('.config-value > input').forEach(input => {
        if (config[input.id] != undefined) {
            switch (input.type) {
                default:
                case 'text':
                    input.value = config[input.id];
                    break;
                case 'checkbox':
                    input.checked = config[input.id];
            }
        }
    });
});

document.getElementById('update-btn').addEventListener('click', async () => {
    let config = {};
    document.querySelectorAll('.config-value > input').forEach(input => {
        let val;
        switch (input.type) {
            default:
            case 'text':
                val = input.value;
                break;
            case 'checkbox':
                val = input.checked;
        }
        config[input.id] = val;
    });

    setMessage((await (await fetch('/api/admin/config', {
        method: 'PATCH',
        body: JSON.stringify(config),
        headers: {
            'Content-Type': 'application/json'
        }
    })).json()).message);

});

window.addEventListener('click', () => {
    if (msg.innerText !== '') msg.innerText = '';
});

function clearMessage() {
    msg.setAttribute('display', 'none');
}

function setMessage(text) {
    msg.innerText = text;
    msg.setAttribute('display', 'block');
}
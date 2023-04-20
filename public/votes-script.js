window.addEventListener('load', async () => {
    let req = await fetch('/api/cars/highestvotes');
    let cars = (await req.json()).cars;
    const yeah = document.querySelector('#yeah');
    cars.forEach(car => {
        yeah.innerText += `${car.votes} votes - ${car.owner}'s ${car.year} ${car.make} ${car.model} \n`;
    })
    console.log(cars);
});
let x=1;
console.log(`the value of x is ${x}`);

function change() {
    document.getElementById("heading").textContent = `Changed header ${x}`;
    x = x + 1;
    }

window.onload = change;

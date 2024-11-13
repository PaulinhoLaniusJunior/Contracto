// auth.js
function logout() {
    sessionStorage.removeItem('userLogged');
    window.location.href = 'home.html'; // Redireciona para a página home
}

function isUserLoggedIn() {
    return sessionStorage.getItem('userLogged') === 'true';
}

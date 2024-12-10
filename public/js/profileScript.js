// Verifica se o usuário está autenticado
const token = localStorage.getItem('token');

if (!token) {
    alert('Acesso negado. Faça login.');
    window.location.href = 'login.html';
} else {
    fetch('/profile', {
        method: 'GET',
        headers: { Authorization: token },
    })
        .then(response => {
            if (response.status === 403 || response.status === 401) {
                alert('Sessão expirada. Faça login novamente.');
                window.location.href = 'login.html';
            }
        });
}

// Função de logout
const logout = () => {
    localStorage.removeItem('token');
    alert('Você foi desconectado.');
    window.location.href = 'login.html';
};

// Ligar o botão de logout à função
document.getElementById('logout-btn').addEventListener('click', logout);

document.getElementById('userMenuBtn').addEventListener('click', function (event) {
    event.stopPropagation();
    const dropdownContent = document.querySelector('.dropdown-content');
    dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
});

// Fecha o dropdown se o usuário clicar fora dele
window.addEventListener('click', function (event) {
    const dropdowns = document.getElementsByClassName("dropdown-content");
    for (let i = 0; i < dropdowns.length; i++) {
        const openDropdown = dropdowns[i];
        if (openDropdown.style.display === 'block') {
            openDropdown.style.display = 'none';
        }
    }
});


document.getElementById('profileForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const formData = {
        nome: document.getElementById('name').value,
        email: document.getElementById('email').value,
        celular: document.getElementById('phone').value,
        dataNascimento: document.getElementById('birthdate').value,
        cpf: document.getElementById('cpf').value,
        rua: document.getElementById('street').value,
        bairro: document.getElementById('neighborhood').value,
        numero: document.getElementById('number').value,
        cidade: document.getElementById('city').value,
        cep: document.getElementById('cep').value,
        tipoConta: document.getElementById('accountType').value,
    };

    try {
        // Substitua aqui a chamada para getFromLocalStorage
        const token = localStorage.getItem('token');

        console.log(token); // Verifique se o token está sendo recuperado corretamente
        const response = await fetch('/profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData),
        });

        const result = await response.json();
        if (response.ok) {
            alert(result.message);
        } else {
            alert('Erro: ' + result.message);
        }
    } catch (error) {
        console.error('Erro ao enviar os dados:', error);
        alert('Erro ao salvar os dados. Tente novamente mais tarde.');
    }
});

// Botão de cancelar
document.getElementById('cancelProfileBtn').addEventListener('click', function () {
    window.location.href = '../pages/home.html'; // Redireciona para a página inicial
});

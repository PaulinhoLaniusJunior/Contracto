document.getElementById('userMenuBtn').addEventListener('click', function(event) {
    event.stopPropagation();
    const dropdownContent = document.querySelector('.dropdown-content');
    dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
});

// Fecha o dropdown se o usuário clicar fora dele
window.addEventListener('click', function(event) {
    const dropdowns = document.getElementsByClassName("dropdown-content");
    for (let i = 0; i < dropdowns.length; i++) {
        const openDropdown = dropdowns[i];
        if (openDropdown.style.display === 'block') {
            openDropdown.style.display = 'none';
        }
    }
});

// Lidar com o envio do formulário
document.getElementById('profileForm').addEventListener('submit', function(event) {
    event.preventDefault();
    alert('Alterações salvas com sucesso!');
});

// Botão de cancelar
document.getElementById('cancelProfileBtn').addEventListener('click', function() {
    window.location.href = '../pages/home.html'; // Redireciona para a página inicial
});

document.addEventListener('DOMContentLoaded', () => {
    // Verifica se o usuário está autenticado
    const token = localStorage.getItem('token');
    
    if (!token) {
        alert('Acesso negado. Faça login.');
        window.location.href = 'login.html';
    } else {
        // Verifica validade do token
        fetch('/profile', {
            method: 'GET',
            headers: { Authorization: token },
        })
            .then(response => {
                if (response.status === 403 || response.status === 401) {
                    alert('Sessão expirada. Faça login novamente.');
                    localStorage.removeItem('token'); // Remove token inválido
                    window.location.href = 'login.html';
                }
            })
            .catch(() => {
                alert('Erro ao verificar autenticação. Faça login novamente.');
                localStorage.removeItem('token');
                window.location.href = 'login.html';
            });
    }

    // Configuração do botão de logout
    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn.addEventListener('click', (event) => {
        event.preventDefault(); // Previne comportamento padrão do link
        localStorage.removeItem('token');
        alert('Você foi desconectado.');
        window.location.href = 'login.html';
    });

    // Dropdown menu
    const userMenuBtn = document.getElementById('userMenuBtn');
    const dropdownContent = document.querySelector('.dropdown-content');

    userMenuBtn.addEventListener('click', (event) => {
        event.stopPropagation(); // Previne o clique de fechar o dropdown imediatamente
        dropdownContent.style.display =
            dropdownContent.style.display === 'block' ? 'none' : 'block';
    });

    window.addEventListener('click', () => {
        dropdownContent.style.display = 'none'; // Fecha o menu ao clicar fora
    });
});

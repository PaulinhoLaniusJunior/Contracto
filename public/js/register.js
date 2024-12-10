import validarCPF from './validateCpf.js';

const registerForm = document.getElementById('registerForm');
const notificationContainer = document.getElementById('notification-container');

registerForm.addEventListener('submit', function (e) {

    console.log('chegou aqui')
    e.preventDefault();
    console.log('formulário enviado');

    limparNotificacoes();

    let valid = true;

    const cpf = document.getElementById('reg_cpf').value;
    if (!cpf || !validarCPF(cpf)) {
        criarNotificacao('CPF inválido.', 'error');
        valid = false;
    }

    const nome = document.getElementById('reg_name').value;
    if (!nome) {
        criarNotificacao('Preencha o campo Nome completo.', 'error');
        valid = false;
    }

    const email = document.getElementById('reg_email').value;
    if (!email) {
        criarNotificacao('Preencha o campo Email.', 'error');
        valid = false;
    }

    const password = document.getElementById('reg_password').value;
    if (!password) {
        criarNotificacao('Preencha o campo Senha.', 'error');
        valid = false;
    }

    const confirmPassword = document.getElementById('reg_confirm_password').value;
    if (password !== confirmPassword) {
        criarNotificacao('As senhas não coincidem.', 'error');
        valid = false;
    }

    console.log('chegou aqui')

    if (!valid) {
        return; // Se algum campo for inválido, impede o envio
    }

    const data = { nome, cpf, email, password };

    fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
        .then((response) => response.json())
        .then((data) => {
            console.log('Resposta recebida do servidor:', data);
            if (data.success) {
                criarNotificacao('Registro realizado com sucesso!', 'success');
                window.location.href = '../pages/login.html'; // Redireciona após registro bem-sucedido
            } else {
                criarNotificacao('Erro no registro: ' + data.message, 'error');
            }
        })
        .catch((error) => {
            console.error('Erro ao fazer a requisição:', error);
            criarNotificacao('Erro ao se conectar ao servidor. Tente novamente.', 'error');
        });
});

function criarNotificacao(message, type) {
    const notification = document.createElement('div');
    notification.classList.add('notification');
    if (type) {
        notification.classList.add(type);
    }
    notification.textContent = message;
    notificationContainer.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 5000);
}

function limparNotificacoes() {
    notificationContainer.innerHTML = '';
}

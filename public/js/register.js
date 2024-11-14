const registerForm = document.getElementById('registerForm');
const notificationContainer = document.getElementById('notification-container');

registerForm.addEventListener('submit', function (e) {
    e.preventDefault();
    console.log('formulário enviado');

    // Limpa as notificações anteriores
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

    if (!valid) {
        return; // Se algum campo for inválido, impede o envio
    }

    // Se os dados são válidos, realiza o registro
    const data = {
        nome,
        cpf,
        email,
        password
    };

    fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Resposta recebida do servidor:', data);
        if (data.success) {
            criarNotificacao('Registro realizado com sucesso!', 'success');
            window.location.href = '../pages/servicos.html'; // Redireciona após registro bem-sucedido
        } else {
            criarNotificacao('Erro no registro: ' + data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Erro ao fazer a requisição:', error);
        criarNotificacao('Erro ao se conectar ao servidor. Tente novamente.', 'error');
    });
});

// Função para criar notificações
function criarNotificacao(message, type) {
    const notification = document.createElement('div');
    notification.classList.add('notification');
    if (type) {
        notification.classList.add(type); // Define o tipo da notificação (error, success)
    }
    notification.textContent = message;
    notificationContainer.appendChild(notification);

    // Remove a notificação após 5 segundos
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Função para limpar notificações anteriores
function limparNotificacoes() {
    notificationContainer.innerHTML = '';
}

// Função de validação do CPF
function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, ''); // Remove qualquer caractere não numérico

    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
        return false; // CPF com números repetidos (exemplo: 11111111111) é inválido
    }

    let soma = 0;
    let resto;

    for (let i = 1; i <= 9; i++) {
        soma += parseInt(cpf.charAt(i - 1)) * (11 - i);
    }

    resto = (soma * 10) % 11;

    if (resto === 10 || resto === 11) {
        resto = 0;
    }

    if (resto !== parseInt(cpf.charAt(9))) {
        return false;
    }

    soma = 0;

    for (let i = 1; i <= 10; i++) {
        soma += parseInt(cpf.charAt(i - 1)) * (12 - i);
    }

    resto = (soma * 10) % 11;

    if (resto === 10 || resto === 11) {
        resto = 0;
    }

    if (resto !== parseInt(cpf.charAt(10))) {
        return false;
    }

    return true;
}

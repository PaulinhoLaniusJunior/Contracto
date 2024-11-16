const updateForm = document.getElementById('updateForm');
const notificationContainer = document.getElementById('notification-container');

updateForm.addEventListener('submit', function (e) {
    e.preventDefault();
    console.log('Formulário de atualização enviado.');

    // Limpa as notificações anteriores
    limparNotificacoes();

    let valid = true;

    const cpf = document.getElementById('cpf').value;
    if (!cpf || !validarCPF(cpf)) {
        criarNotificacao('CPF inválido.', 'error');
        valid = false;
    }

    const name = document.getElementById('name').value;
    const surname = document.getElementById('surname').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const birthdate = document.getElementById('birthdate').value;
    const street = document.getElementById('street').value;
    const neighborhood = document.getElementById('neighborhood').value;
    const number = document.getElementById('number').value;
    const city = document.getElementById('city').value;
    const cep = document.getElementById('cep').value;

    // Verifica se ao menos um campo foi preenchido
    if (!name && !surname && !email && !phone && !birthdate && !street && !neighborhood && !number && !city && !cep) {
        criarNotificacao('Preencha ao menos um campo para atualizar.', 'error');
        valid = false;
    }

    if (!valid) {
        return; // Interrompe o envio se houver erros
    }

    // Monta os dados para a requisição
    const data = {
        cpf,
        name,
        surname,
        email,
        phone,
        birthdate,
        street,
        neighborhood,
        number,
        city,
        cep,
    };

    // Faz a requisição para o endpoint /update-user
    fetch('/update-user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
        .then((response) => response.json())
        .then((data) => {
            console.log('Resposta recebida do servidor:', data);
            if (data.success) {
                criarNotificacao('Dados atualizados com sucesso!', 'success');
            } else {
                criarNotificacao('Erro na atualização: ' + data.message, 'error');
            }
        })
        .catch((error) => {
            console.error('Erro ao fazer a requisição:', error);
            criarNotificacao('Erro ao se conectar ao servidor. Tente novamente.', 'error');
        });
});

// Função para criar notificações
function criarNotificacao(message, type) {
    const notification = document.createElement('div');
    notification.classList.add('notification');
    if (type) {
        notification.classList.add(type);
    }
    notification.textContent = message;
    notificationContainer.appendChild(notification);

    // Remove a notificação após 5 segundos
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Função para limpar notificações
function limparNotificacoes() {
    notificationContainer.innerHTML = '';
}

// Função de validação do CPF
function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
        return false;
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

const updateForm = document.getElementById('formularioPerfil');
const notificationContainer = document.getElementById('notificacao-container');

// Ao carregar a página, buscar os dados do usuário logado
document.addEventListener('DOMContentLoaded', () => {
    fetch('/user/me', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`, // Inclui o token JWT
        },
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Erro ao buscar dados do usuário.');
            }
            return response.json();
        })
        .then((data) => {
            if (data.success && data.user) {
                preencherFormulario(data.user);
            } else {
                criarNotificacao('Não foi possível carregar os dados do usuário.', 'error');
            }
        })
        .catch((error) => {
            console.error('Erro ao buscar dados do usuário:', error);
            criarNotificacao('Erro ao carregar os dados. Tente novamente.', 'error');
        });
});

// Função para preencher o formulário com os dados do usuário
function preencherFormulario(user) {
    document.getElementById('cpf').value = user.cpf || '';
    document.getElementById('nome').value = user.nome || '';
    document.getElementById('sobrenome').value = user.sobrenome || '';
    document.getElementById('email').value = user.email || '';
    document.getElementById('celular').value = user.celular || '';
    document.getElementById('dataNascimento').value = user.data_nascimento || '';
    document.getElementById('rua').value = user.rua || '';
    document.getElementById('bairro').value = user.bairro || '';
    document.getElementById('numero').value = user.numero || '';
    document.getElementById('cidade').value = user.cidade || '';
    document.getElementById('cep').value = user.cep || '';
    document.getElementById('tipoConta').value = user.tipo_conta || '';
}

// Lidar com o envio do formulário de atualização
updateForm.addEventListener('submit', function (e) {
    e.preventDefault();
    console.log('Formulário de atualização enviado.');

    // Limpa as notificações anteriores
    limparNotificacoes();

    let valido = true;

    const cpf = document.getElementById('cpf').value;
    if (!cpf || !validarCPF(cpf)) {
        criarNotificacao('CPF inválido.', 'error');
        valido = false;
    }

    const nome = document.getElementById('nome').value;
    const sobrenome = document.getElementById('sobrenome').value;
    const email = document.getElementById('email').value;
    const celular = document.getElementById('celular').value;
    const dataNascimento = document.getElementById('dataNascimento').value;
    const rua = document.getElementById('rua').value;
    const bairro = document.getElementById('bairro').value;
    const numero = document.getElementById('numero').value;
    const cidade = document.getElementById('cidade').value;
    const cep = document.getElementById('cep').value;

    // Verifica se ao menos um campo foi preenchido
    if (!nome && !sobrenome && !email && !celular && !dataNascimento && !rua && !bairro && !numero && !cidade && !cep) {
        criarNotificacao('Preencha ao menos um campo para atualizar.', 'error');
        valido = false;
    }

    if (!valido) {
        return; // Interrompe o envio se houver erros
    }

    // Monta os dados para a requisição
    const dados = {
        cpf,
        nome,
        sobrenome,
        email,
        celular,
        dataNascimento,
        rua,
        bairro,
        numero,
        cidade,
        cep,
    };

    // Faz a requisição para o endpoint /update-user
    fetch('/profile', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`, // Inclui o token JWT
        },
        body: JSON.stringify(dados),
    })
        .then((response) => response.json())
        .then((dados) => {
            console.log('Resposta recebida do servidor:', dados);
            if (dados.success) {
                criarNotificacao('Dados atualizados com sucesso!', 'success');
            } else {
                criarNotificacao('Erro na atualização: ' + dados.message, 'error');
            }
        })
        .catch((error) => {
            console.error('Erro ao fazer a requisição:', error);
            criarNotificacao('Erro ao se conectar ao servidor. Tente novamente.', 'error');
        });
});

// Funções auxiliares (validação, notificações, etc.) permanecem as mesmas

function criarNotificacao(mensagem, tipo) {
    const notificacao = document.createElement('div');
    notificacao.classList.add('notificacao');
    if (tipo) {
        notificacao.classList.add(tipo);
    }
    notificacao.textContent = mensagem;
    notificationContainer.appendChild(notificacao);

    // Remove a notificação após 5 segundos
    setTimeout(() => {
        notificacao.remove();
    }, 5000);
}

function limparNotificacoes() {
    notificationContainer.innerHTML = '';
}

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

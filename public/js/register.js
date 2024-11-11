const registerForm = document.getElementById('registerForm');

registerForm.addEventListener('submit', function (e) {
    e.preventDefault();
    console.log('formulário enviado');

    // Verifique se as senhas coincidem
    if (!validarSenhas()) return;

    const email = document.getElementById('reg_email').value;
    const password = document.getElementById('reg_password').value;

    fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
        .then(response => response.json())
        .then(data => {
            console.log('Resposta recebida do servidor:', data);
            const message = document.getElementById('reg_message');
            message.textContent = data.message;

            if (data.success) {

                // alert é a mensagem que aparece caso receba como parametro a mensagem de formulario (login_mesage)
                //usar somente em caso de testes

                //alert('Registro realizado com sucesso!'); <-- linha de código
                window.location.href = '../pages/servicos.html'; // Redireciona após registro bem-sucedido
            } else {
                console.error('Erro no registro:', data.message);
            }
        })
        .catch(error => {
            console.error('Erro ao fazer a requisição:', error);
            const message = document.getElementById('reg_message');
            message.textContent = 'Erro ao se conectar ao servidor. Tente novamente.';
        });
});

document.getElementById().addEventListener('submit', function (e) {
    e.preventDefault()


    //const email = document.getElementById('login_email').value;
    //const password = document.getElementById('login_password').value;
    const marca = false;
    const email = document.getElementById('login_email').value;
    const password = document.getElementById('login_password').value

    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Resposta recebida do servidor:', data);
        const message = document.getElementById('login_message');
        message.textContent = data.message;

        if (data.success) {
            marca = true
            window.location.href = '../pages/servicos.html'; // Redireciona após login bem-sucedido
        } else {
           console.log('deu ruim lambari')
        }
    })
    .catch(error => {
        console.error('Erro ao fazer a requisição:', error);
        const message = document.getElementById('login_message');
        message.textContent = 'Erro ao se conectar ao servidor. Tente novamente.';
    });

});
function validarSenhas() {
    const senha = document.getElementById('reg_password').value;
    const confirmarSenha = document.getElementById('reg_confirm_password').value;

    if (senha !== confirmarSenha) {
        console.log('deu ruim não verificou a senha')
        document.getElementById('reg_message').textContent = "As senhas não coincidem!";
        return false;
    } else {
        document.getElementById('reg_message').textContent = "deu bom macaco";
        return true;
    }
}

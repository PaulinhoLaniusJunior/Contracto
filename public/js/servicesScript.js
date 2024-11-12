const addContractBtn = document.getElementById('addContractBtn');
const contractFileInput = document.getElementById('contractFileInput');
const contractList = document.getElementById('contractList');

// Abrir o seletor de arquivos ao clicar em "Adicionar Contrato"
addContractBtn.addEventListener('click', () => {
    contractFileInput.click();
});

// Lidar com o upload de arquivos
contractFileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        addToHistory(file);
    }
});

// Adiciona o contrato ao histórico
function addToHistory(file) {
    const li = document.createElement('li');
    li.innerHTML = `
        ${file.name}
        <div class="buttons-container">
            <button class="btn view-btn">Visualizar</button>
            <button class="btn analyze-btn">Analisar</button>
            <button class="btn delete-btn">Excluir</button>
        </div>
    `;

    // Botão de Visualizar
    li.querySelector('.view-btn').addEventListener('click', () => viewContract(file));
    // Botão de Analisar
    li.querySelector('.analyze-btn').addEventListener('click', () => analyzeContract(file));
    // Botão de Excluir
    li.querySelector('.delete-btn').addEventListener('click', () => li.remove());

    contractList.appendChild(li);
}

// Função para visualizar o contrato
function viewContract(file) {
    const url = URL.createObjectURL(file);
    window.open(url, '_blank');
}

// Função para analisar o contrato
async function analyzeContract(file) {
    try {
        const formData = new FormData();
        formData.append('pdf', file);

        const response = await fetch('http://localhost:3000/analyze-pdf', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            alert(`Análise do Contrato:\n\n${data.analysis}`);
        } else {
            alert('Erro ao analisar o contrato.');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao se comunicar com o servidor.');
    }
}

document.getElementById('userMenuBtn').addEventListener('click', function(event) {
    event.stopPropagation(); // Impede que o evento de clique se propague para o documento
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
document.getElementById('saveProfileBtn').addEventListener('click', function() {
    alert('Alterações salvas com sucesso!');
});

document.getElementById('cancelProfileBtn').addEventListener('click', function() {
    window.location.href = '../pages/home.html'; // Redireciona para a página inicial
});


// servicesScript.js
document.getElementById('logo').addEventListener('click', function() {
    const homePage = isUserLoggedIn() ? 'home_logged.html' : 'home.html';
    window.location.href = homePage;
});

const addContractBtn = document.getElementById('addContractBtn');
const addContractModal = document.getElementById('addContractModal');
const closeModal = document.getElementById('closeModal');
const selectFileBtn = document.getElementById('selectFileBtn');
const fileInput = document.getElementById('fileInput');
const filePreview = document.getElementById('filePreview');
const pagesContainer = document.getElementById('pagesContainer');
const signatoriesSection = document.getElementById('signatoriesSection');
const addSignatoryBtn = document.getElementById('addSignatoryBtn');
const signatoriesList = document.getElementById('signatoriesList');
const saveContractBtn = document.getElementById('saveContractBtn');
let signatoryCount = 0;

// Abre o modal ao clicar em "Adicionar Contrato"
addContractBtn.addEventListener('click', () => {
    addContractModal.style.display = 'flex';
});

// Fecha o modal
closeModal.addEventListener('click', () => {
    addContractModal.style.display = 'none';
});

// Seleciona o arquivo ao clicar no botão "Selecionar Arquivo"
selectFileBtn.addEventListener('click', () => {
    fileInput.click();
});

// Processa o arquivo selecionado e exibe as páginas
fileInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (file) {
        // Exibir visualização de páginas do documento (implementação simplificada)
        pagesContainer.innerHTML = `<p>Visualização do documento: ${file.name}</p>`;
        filePreview.style.display = 'block';
        
        // Mostrar a seção para adicionar signatários
        signatoriesSection.style.display = 'block';
    }
});

// Adiciona um novo signatário
addSignatoryBtn.addEventListener('click', () => {
    if (signatoryCount >= 4) {
        alert('O número máximo de signatários é 4.');
        return;
    }

    const signatoryDiv = document.createElement('div');
    signatoryDiv.classList.add('signatory');
    signatoryDiv.innerHTML = `
        <input type="text" placeholder="Nome Completo" required>
        <input type="text" placeholder="CPF" required>
        <input type="text" placeholder="Celular" required>
        <input type="email" placeholder="E-mail" required>
        <button class="btn remove-signatory-btn">Remover</button>
    `;

    // Remover signatário ao clicar no botão "Remover"
    signatoryDiv.querySelector('.remove-signatory-btn').addEventListener('click', () => {
        signatoryDiv.remove();
        signatoryCount--;
        toggleSaveButton();
    });

    signatoriesList.appendChild(signatoryDiv);
    signatoryCount++;
    toggleSaveButton();
});

// Exibe o botão "Salvar Contrato" se houver pelo menos 1 signatário
function toggleSaveButton() {
    saveContractBtn.style.display = signatoryCount > 0 ? 'block' : 'none';
}

// Salva o contrato e o adiciona ao histórico
saveContractBtn.addEventListener('click', () => {
    const fileName = fileInput.files[0].name;
    addToHistory(fileName);

    // Fecha o modal após salvar
    addContractModal.style.display = 'none';

    // Limpa o modal para a próxima adição de contrato
    fileInput.value = '';
    pagesContainer.innerHTML = '';
    filePreview.style.display = 'none';
    signatoriesList.innerHTML = '';
    signatoriesSection.style.display = 'none';
    signatoryCount = 0;
    toggleSaveButton();
});

// Adiciona o contrato ao histórico de contratos
function addToHistory(fileName) {
    const li = document.createElement('li');
    li.innerHTML = `
        ${fileName}
        <div class="buttons-container">
            <button class="btn view-btn">Visualizar</button>
            <button class="btn analyze-btn">Analisar</button>
            <button class="btn delete-btn">Excluir</button>
        </div>
    `;

    // Configurações dos botões
    li.querySelector('.view-btn').addEventListener('click', () => viewContract(fileName));
    li.querySelector('.analyze-btn').addEventListener('click', () => analyzeContract(fileName));
    li.querySelector('.delete-btn').addEventListener('click', () => li.remove());

    contractList.appendChild(li);
}

// Funções de visualização e análise do contrato
function viewContract(fileName) {
    alert(`Visualizando: ${fileName}`);
}

function analyzeContract(fileName) {
    alert(`Analisando: ${fileName}`);
}

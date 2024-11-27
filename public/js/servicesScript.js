if (!sessionStorage.getItem('token')) {
    alert('Acesso negado. Faça login para continuar.');
    window.location.href = 'login.html'; // Redireciona para a página de login
}

// Seleção dos elementos do modal e botões
const addContractBtn = document.getElementById('addContractBtn');
const addContractModal = document.getElementById('addContractModal');
const closeModal = document.getElementById('closeModal');
const selectFileBtn = document.getElementById('selectFileBtn');
const fileInput = document.getElementById('fileInput');
const filePreview = document.getElementById('filePreview');
const pagesContainer = document.getElementById('pagesContainer');
const saveContractBtn = document.getElementById('saveContractBtn');

document.addEventListener('DOMContentLoaded', () => {
    addContractModal.style.display = 'none';
    signContractModal.style.display = 'none';
});

closeSignModal.addEventListener('click', () => {
    signContractModal.style.display = 'none'; // Esconde o modal
});

// Abre o modal ao clicar em "Adicionar Contrato"
addContractBtn.addEventListener('click', () => {
    addContractModal.style.display = 'flex';  // Exibe o modal
});

// Fecha o modal
closeModal.addEventListener('click', () => {
    addContractModal.style.display = 'none';  // Esconde o modal
});

// Seleciona o arquivo ao clicar no botão "Selecionar Arquivo"
selectFileBtn.addEventListener('click', () => {
    fileInput.click();  // Abre o seletor de arquivos
});

// Processa o arquivo selecionado e exibe as páginas
// Mostra o botão "Salvar Contrato" ao selecionar o arquivo
fileInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (file) {
        const fileType = file.type;

        // Limpa a prévia do arquivo
        pagesContainer.innerHTML = '';

        if (fileType === 'application/pdf') {
            // Configurar o PDF.js
            pdfjsLib.GlobalWorkerOptions.workerSrc =
                'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

            const fileReader = new FileReader();
            fileReader.onload = async (e) => {
                const typedArray = new Uint8Array(e.target.result);
                const pdf = await pdfjsLib.getDocument(typedArray).promise;

                for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
                    const page = await pdf.getPage(pageNumber);
                    const viewport = page.getViewport({ scale: 1 });

                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;

                    await page.render({
                        canvasContext: context,
                        viewport: viewport,
                    }).promise;

                    const pageContainer = document.createElement('div');
                    pageContainer.classList.add('page-container');
                    pageContainer.appendChild(canvas);
                    pagesContainer.appendChild(pageContainer);
                }
            };
            fileReader.readAsArrayBuffer(file);
        } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const fileReader = new FileReader();
            fileReader.onload = async (e) => {
                const result = await mammoth.extractRawText({ arrayBuffer: e.target.result });
                const pageContainer = document.createElement('div');
                pageContainer.classList.add('page-container');
                pageContainer.textContent = result.value;
                pagesContainer.appendChild(pageContainer);
            };
            fileReader.readAsArrayBuffer(file);
        } else if (fileType === 'text/plain') {
            const fileReader = new FileReader();
            fileReader.onload = (e) => {
                const pageContainer = document.createElement('div');
                pageContainer.classList.add('page-container');
                pageContainer.textContent = e.target.result;
                pagesContainer.appendChild(pageContainer);
            };
            fileReader.readAsText(file);
        } else {
            alert('Formato de arquivo não suportado. Por favor, selecione um PDF, DOCX ou TXT.');
        }

        filePreview.style.display = 'block';
        saveContractBtn.style.display = 'inline-block'; // Exibe o botão "Salvar Contrato"
    }
});

// Adiciona o contrato ao histórico ao clicar em "Salvar Contrato"
saveContractBtn.addEventListener('click', () => {
    const fileName = fileInput.files[0]?.name || 'Contrato sem nome';
    if (fileName) {
        addToHistory(fileName);
        alert('Contrato salvo com sucesso no histórico!');
        // Reseta o estado do modal
        fileInput.value = '';
        filePreview.style.display = 'none';
        saveContractBtn.style.display = 'none';
        addContractModal.style.display = 'none';
    }
});

// Adiciona o contrato ao histórico de contratos
function addToHistory(fileName) {
    const li = document.createElement('li');
    li.innerHTML = `
        ${fileName}
        <div class="buttons-container">
            <button class="btn view-btn">Visualizar</button>
            <button class="btn analyze-btn">Analisar</button>
            <button class="btn sign-btn">Assinar</button>
            <button class="btn delete-btn">Excluir</button>
        </div>
    `;

    // Configurações dos botões
    li.querySelector('.sign-btn').addEventListener('click', () => openSignModal(fileName));
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
const userMenuBtn = document.getElementById("userMenuBtn");
        const dropdownContent = document.querySelector(".dropdown-content");
    
        userMenuBtn.addEventListener("click", () => {
            // Alterna a visibilidade do menu suspenso
            dropdownContent.style.display = dropdownContent.style.display === "block" ? "none" : "block";
        });
    
        // Fecha o menu suspenso se o usuário clicar fora dele
        window.addEventListener("click", (event) => {
            if (!event.target.matches('#userMenuBtn') && !event.target.closest('.user-menu')) {
                dropdownContent.style.display = "none";
            }
        });

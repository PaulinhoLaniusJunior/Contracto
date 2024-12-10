// Verifica se o usuário está autenticado
const token = localStorage.getItem('token');

if (!token) {
    alert('Acesso negado. Faça login.');
    window.location.href = 'login.html';
} else {
    fetch('/profile', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
    })
        .then(response => {
            if (response.status === 403 || response.status === 401) {
                alert('Sessão expirada. Faça login novamente.');
                localStorage.removeItem('token'); // Remove token inválido
                window.location.href = 'login.html';
            } else {
                // Se o token for válido, continua a execução do app
                initializeApp();
            }
        })
        .catch(err => {
            console.error('Erro ao verificar sessão:', err);
            alert('Erro de autenticação. Faça login novamente.');
            window.location.href = 'login.html';
        });
}

// Função para inicializar o aplicativo
function initializeApp() {
    // Seleção dos elementos do modal e botões
    const addContractBtn = document.getElementById('addContractBtn');
    const addContractModal = document.getElementById('addContractModal');
    const closeModal = document.getElementById('closeModal');
    const selectFileBtn = document.getElementById('selectFileBtn');
    const fileInput = document.getElementById('fileInput');
    const filePreview = document.getElementById('filePreview');
    const pagesContainer = document.getElementById('pagesContainer');
    const saveContractBtn = document.getElementById('saveContractBtn');
    const viewContractModal = document.getElementById('viewContractModal');
    const closeViewModal = document.getElementById('closeViewModal');
    const documentPreview = document.getElementById('documentPreview');

    
    // Função de logout
    const logout = () => {
        localStorage.removeItem('token');
        alert('Você foi desconectado.');
        window.location.href = 'login.html';
    };

    // Ligar o botão de logout à função
    document.getElementById('logout-btn').addEventListener('click', logout);

    document.addEventListener('DOMContentLoaded', () => {
        addContractModal.style.display = 'none';
        viewContractModal.style.display = 'none';
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

    saveContractBtn.addEventListener('click', () => {
        const file = fileInput.files[0];
        if (!file) {
            alert('Por favor, selecione um arquivo antes de salvar.');
            return;
        }
    
        const formData = new FormData();
        formData.append('file', file);
    
        fetch('/upload', {
            method: 'POST',
            body: formData,
        })
            .then(response => response.json())
            .then(data => {
                alert(data.message || 'Contrato salvo com sucesso!');
                addToHistory(file.name);  // Adiciona o arquivo ao histórico
                addContractModal.style.display = 'none';  // Fecha o modal
            })
            .catch(err => {
                console.error(err);
                alert('Erro ao salvar o contrato.');
            });
    });
    

    // Função para visualizar o contrato
    async function viewContract(fileName) {
        documentPreview.innerHTML = ''; // Limpa o preview anterior

        try {
            const response = await fetch(`http://localhost:3000/api/view-pdf/${fileName}`, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`,
                },
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                const iframe = document.createElement('iframe');
                iframe.src = url;
                iframe.width = '100%';
                iframe.height = '500px';
                documentPreview.appendChild(iframe);
                viewContractModal.style.display = 'block';
            } else {
                alert('Erro ao carregar o contrato.');
            }
        } catch (error) {
            console.error('Erro ao visualizar contrato:', error);
            alert('Ocorreu um erro ao visualizar o contrato.');
        }
    }

    // Função para adicionar contrato ao histórico
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

    // Função de análise do contrato
    function analyzeContract(fileName) {
        alert(`Analisando: ${fileName}`);
    }

    // Menu do usuário
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

    // Fecha o modal de visualização
    closeViewModal.addEventListener('click', () => {
        viewContractModal.style.display = 'none';
        documentPreview.innerHTML = ''; // Limpa o conteúdo anterior
    });
}

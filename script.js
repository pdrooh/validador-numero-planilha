document.getElementById('validateButton').addEventListener('click', processFile);

async function processFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (!file) {
        alert("Por favor, selecione um arquivo.");
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        const { validos, indicesInvalidos } = validarNumeros(json);
        const novaPlanilha = removerInvalidos(json, indicesInvalidos);
        const numerosInvalidos = obterInvalidos(json, indicesInvalidos);

        displayResults(novaPlanilha, numerosInvalidos);
    };
    reader.readAsArrayBuffer(file);
}

function validarNumeros(dados) {
    const indicesInvalidos = [];

    dados.forEach((linha, index) => {
        const ddi = linha[1]; // Coluna DDI
        const numero = linha[2]; // Coluna Telefone
        
        // Limpar e concatenar
        const numeroCompleto = `${ddi}${String(numero).replace(/\D/g, '')}`;
        
        // Verificar se o número tem o comprimento adequado
        if (numeroCompleto.length < 10 || numeroCompleto.length > 15) {
            indicesInvalidos.push(index);
        }
    });

    return {
        validos: dados.length - indicesInvalidos.length,
        indicesInvalidos: indicesInvalidos
    };
}

function removerInvalidos(dados, indicesInvalidos) {
    return dados.filter((_, index) => !indicesInvalidos.includes(index));
}

function obterInvalidos(dados, indicesInvalidos) {
    return dados.filter((_, index) => indicesInvalidos.includes(index));
}

function displayResults(novaPlanilha, numerosInvalidos) {
    console.log("Números Válidos:", novaPlanilha);
    console.log("Números Inválidos:", numerosInvalidos);

    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `<p>Números Válidos: ${novaPlanilha.length}</p>`;
    resultDiv.innerHTML += `<p>Números Inválidos: ${numerosInvalidos.length}</p>`;

    // Exibir os números inválidos
    if (numerosInvalidos.length > 0) {
        resultDiv.innerHTML += `<h3>Números Inválidos:</h3><ul>`;
        numerosInvalidos.forEach(linha => {
            resultDiv.innerHTML += `<li>DDI: ${linha[1]}, Telefone: ${linha[2]}</li>`;
        });
        resultDiv.innerHTML += `</ul>`;
    }

    // Adicionar botão para baixar a planilha com números válidos
    const downloadButton = document.createElement('button');
    downloadButton.textContent = 'Baixar Planilha com Números Válidos';
    downloadButton.onclick = () => downloadValidNumbers(novaPlanilha);
    
    resultDiv.appendChild(downloadButton);
    
    // Mostrar o resultado
    resultDiv.style.display = "block"; // Certifique-se de que o resultado é exibido
}

function downloadValidNumbers(novaPlanilha) {
    const validSheet = XLSX.utils.aoa_to_sheet(novaPlanilha);
    const newWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(newWorkbook, validSheet, "Válidos");

    const fileName = "numeros_validos.xlsx";
    XLSX.writeFile(newWorkbook, fileName);
}

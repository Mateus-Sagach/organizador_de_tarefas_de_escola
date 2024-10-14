let funcionarios = [];
let atividades = [];

// Função para cadastrar funcionário
function cadastrarFuncionario() {
    const nome = document.getElementById('nomeFuncionario').value.trim();
    const erroDiv = document.getElementById('mensagemErroFuncionario');
    
    // Verificar se o nome já existe
    if (funcionarios.some(func => func.nome === nome)) {
        erroDiv.textContent = 'Funcionário já cadastrado com este nome.';
        return;
    }

    if (nome) {
        funcionarios.push({ nome, ocupado: false });
        document.getElementById('nomeFuncionario').value = '';
        erroDiv.textContent = '';
        atualizarListaFuncionarios();
    } else {
        erroDiv.textContent = 'Nome do funcionário não pode ser vazio.';
    }
}

// Atualizar lista de funcionários na tela
function atualizarListaFuncionarios() {
    const lista = document.getElementById('listaFuncionarios');
    lista.innerHTML = '';
    funcionarios.forEach((func, index) => {
        const item = document.createElement('li');
        item.textContent = func.nome;
        item.setAttribute('draggable', true);
        item.setAttribute('data-index', index);
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
        lista.appendChild(item);
    });
}


function gerarGrade() {
    const horarios = Array.from({ length: 12 }, (_, i) => `${String(i + 6).padStart(2, '0')}:00`); // Horários formatados como 06:00, 07:00, etc.
    const gradeHorarios = document.getElementById('gradeHorarios');

    gradeHorarios.innerHTML = ''; // Limpa a grade antes de gerar novamente

    // Primeira coluna fixa com horários
    const blankHeader = document.createElement('div');
    blankHeader.classList.add('header');
    gradeHorarios.appendChild(blankHeader);

    // Nomes das salas, inicializando com valores padrão
    let salas = ['Sala 1', 'Sala 2', 'Sala 3', 'Sala 4', 'Sala 5', 'Sala 6', 'Sala 7'];

    // Cabeçalhos com os nomes das salas e editáveis
    salas.forEach((sala, index) => {
        const div = document.createElement('div');
        div.classList.add('header');
        
        const input = document.createElement('input');
        input.type = 'text';
        input.value = sala;
        input.addEventListener('input', (event) => {
            salas[index] = event.target.value; // Atualiza o nome da sala
            atualizarSelecaoSalas(); // Atualiza a seleção de salas no cadastro de atividades
        });
        
        div.appendChild(input);
        gradeHorarios.appendChild(div);
    });

    // Horários de 06:00 até 17:00 e as células correspondentes
    horarios.forEach(hora => {
        // Coluna com o horário
        const horaDiv = document.createElement('div');
        horaDiv.classList.add('header');
        horaDiv.textContent = hora;
        gradeHorarios.appendChild(horaDiv);

        salas.forEach((sala, index) => {
            const div = document.createElement('div');
            div.id = `${hora}-${sala}`;  // ID correto com espaço entre "Sala" e o número
            console.log(`Gerando célula com ID: ${div.id}`); // Verificação via console
            div.innerHTML = `<strong>${hora}</strong>`;
            div.addEventListener('dragover', handleDragOver);
            div.addEventListener('drop', handleDrop);
            gradeHorarios.appendChild(div);
        });
    });
}



// Função para preencher o select de salas no cadastro de atividades
function preencherOpcoesSalas() {
    const selectSalas = document.getElementById('salasAtividade');
    selectSalas.innerHTML = ''; // Limpa qualquer valor anterior

    let salas = ['Sala 1', 'Sala 2', 'Sala 3', 'Sala 4', 'Sala 5', 'Sala 6', 'Sala 7'];

    salas.forEach((sala, index) => {
        const option = document.createElement('option');
        option.value = `Sala ${index + 1}`;
        option.textContent = `Sala ${index + 1}`;
        selectSalas.appendChild(option);
    });
}

// Alteração na função de cadastrar atividade
function cadastrarAtividade() {
    const nomeAtividade = document.getElementById('nomeAtividade').value.trim();
    const horaInicio = document.getElementById('horaInicioAtividade').value;
    const horaFim = document.getElementById('horaFimAtividade').value;
    const salasSelecionadas = Array.from(document.getElementById('salasAtividade').selectedOptions).map(option => option.value);
    const observacao = document.getElementById('observacaoAtividade').value.trim();
    const numFuncionarios = parseInt(document.getElementById('numFuncionarios').value);

    console.log(`Tentando cadastrar atividade: ${nomeAtividade}, Início: ${horaInicio}, Fim: ${horaFim}, Sala: ${salasSelecionadas}`); // Verificação via console

    if (nomeAtividade && horaInicio && horaFim && salasSelecionadas.length > 0 && numFuncionarios > 0) {
        salasSelecionadas.forEach(sala => {
            atividades.push({
                horarioInicio: horaInicio,
                horarioFim: horaFim,
                sala: sala,
                atividade: nomeAtividade,
                observacao: observacao,
                funcionariosNecessarios: numFuncionarios,
                funcionariosAlocados: [] // Certifique-se de que essa lista está vazia inicialmente
            });
            console.log(`Atividade cadastrada com sucesso: ${nomeAtividade} na sala ${sala} das ${horaInicio} às ${horaFim}`); // Verificação via console
        });

        // Limpar campos de cadastro após inserir
        document.getElementById('nomeAtividade').value = '';
        document.getElementById('observacaoAtividade').value = '';
        document.getElementById('numFuncionarios').value = '';

        // Atualizar a grade para exibir as novas atividades
        atualizarGradeComAtividades();
    } else {
        alert('Por favor, preencha todos os campos corretamente.');
    }
}



// Alteração na função de atualizar a grade de atividades
function atualizarGradeComAtividades() {
    gerarGrade(); // Regenera a grade de horários

    atividades.forEach(atividade => {
        const horaFormatada = String(atividade.horarioInicio).padStart(5, '0'); // Garante que o horário tenha formato HH:MM
        const cellId = `${horaFormatada}-${atividade.sala}`;
        console.log(cellId)
        const cell = document.getElementById(cellId);
        
        if (cell) {
            console.log(`Inserindo atividade: ${atividade.atividade} na célula: ${cellId}`); // Verificação via console
            
            const funcionariosTexto = atividade.funcionariosAlocados.map((func, index) => {
                return `<div>${func} <button class="remover" data-func-index="${index}" data-horarioInicio="${atividade.horarioInicio}" data-sala="${atividade.sala}">Remover</button></div>`;
            }).join('');

            const funcionariosAlocados = atividade.funcionariosAlocados.length;
            const funcionariosRestantes = atividade.funcionariosNecessarios - funcionariosAlocados;

            let dropdown = `<select class="funcionario-disponivel" data-horarioInicio="${atividade.horarioInicio}" data-sala="${atividade.sala}">
                                <option value="">Selecione funcionário</option>`;
            funcionarios.forEach(func => {
                if (!atividade.funcionariosAlocados.includes(func.nome) && !func.ocupado) {
                    dropdown += `<option value="${func.nome}">${func.nome}</option>`;
                }
            });
            dropdown += `</select>`;

            const atividadeHtml = `
                <strong>${atividade.atividade}</strong><br>
                <em>(${atividade.horarioInicio} - ${atividade.horarioFim})</em><br>
                Observação: ${atividade.observacao}<br>
                Funcionários:<br> ${funcionariosTexto}<br>
                Alocados: ${funcionariosAlocados}/${atividade.funcionariosNecessarios}<br>
                Faltam: ${funcionariosRestantes}<br>
                ${dropdown}`;

            // Exibe a atividade na célula correspondente
            cell.innerHTML += atividadeHtml;
        } else {
            console.error(`Erro: célula não encontrada para ${atividade.atividade} com ID ${cellId}`);
        }
    });
}





// Função para preencher o select de salas com os nomes das salas do grid
function atualizarSelecaoSalas() {
    const selectSalas = document.getElementById('salasAtividade');
    selectSalas.innerHTML = ''; // Limpar opções anteriores
    
    let salas = document.querySelectorAll('#gradeHorarios .header input'); // Seleciona os inputs do cabeçalho (salas)

    salas.forEach((input, index) => {
        const option = document.createElement('option');
        option.value = input.value; // Usar o nome atual da sala
        option.textContent = input.value;
        selectSalas.appendChild(option);
    });
}


// Função para remover um funcionário
function removerFuncionario(event) {
    const funcIndex = event.target.getAttribute('data-func-index');
    const horario = event.target.getAttribute('data-horario');
    const dia = event.target.getAttribute('data-dia');

    const atividade = atividades.find(a => a.horario === horario && a.dia === dia);
    if (atividade) {
        const funcionarioRemovido = atividade.funcionariosAlocados.splice(funcIndex, 1)[0];
        const funcionario = funcionarios.find(f => f.nome === funcionarioRemovido);
        if (funcionario) {
            funcionario.ocupado = false;
        }
        atualizarGradeComAtividades();
    }
}

// Função para alocar funcionário pelo dropdown
function alocarFuncionarioPorDropdown(event) {
    const funcionarioNome = event.target.value;
    const horario = event.target.getAttribute('data-horario');
    const dia = event.target.getAttribute('data-dia');

    if (funcionarioNome) {
        const atividade = atividades.find(a => a.horario === horario && a.dia === dia);
        if (atividade && atividade.funcionariosAlocados.length < atividade.funcionariosNecessarios) {
            if (!atividade.funcionariosAlocados.includes(funcionarioNome)) {
                atividade.funcionariosAlocados.push(funcionarioNome);
                const funcionario = funcionarios.find(f => f.nome === funcionarioNome);
                if (funcionario) {
                    funcionario.ocupado = true;
                }
                event.target.value = ''; // Limpar a seleção
                atualizarGradeComAtividades();
            } else {
                alert('Esse funcionário já está alocado nesta atividade.');
            }
        } else {
            alert('Essa atividade já tem o número máximo de funcionários alocados.');
        }
    }
}

// Funções de Drag and Drop
let draggedFuncionario = null;

function handleDragStart(event) {
    draggedFuncionario = funcionarios[event.target.getAttribute('data-index')];
    event.target.classList.add('dragging');
}

function handleDragEnd(event) {
    event.target.classList.remove('dragging');
}

function handleDragOver(event) {
    event.preventDefault();
}

function handleDrop(event) {
    event.preventDefault();
    const cellId = event.target.id;
    const [hora, dia] = cellId.split('-');

    // Verifica se existe uma atividade no horário
    const atividade = atividades.find(a => a.horario === hora && a.dia === dia);

    // Verifica se o funcionário já está alocado nessa atividade
    if (atividade && !atividade.funcionariosAlocados.includes(draggedFuncionario.nome)) {
        if (atividade.funcionariosAlocados.length < atividade.funcionariosNecessarios) {
            atividade.funcionariosAlocados.push(draggedFuncionario.nome);
            draggedFuncionario.ocupado = true;
            atualizarGradeComAtividades();
        } else {
            alert('Essa atividade já tem o número máximo de funcionários alocados.');
        }
    } else if (atividade) {
        alert('Esse funcionário já está alocado nesta atividade.');
    }
}

// Função para verificar atividades sem funcionários
function verificarAtividades() {
    const atividadesSemFuncionario = atividades.filter(atividade => atividade.funcionariosAlocados.length === 0);
    const resultado = atividadesSemFuncionario.map(atividade => `${atividade.atividade} (${atividade.horario} - ${atividade.dia})`).join(', ');
    
    const mensagem = atividadesSemFuncionario.length > 0
        ? `Atividades sem funcionários: ${resultado}`
        : 'Todas as atividades têm funcionários alocados.';
    
    document.getElementById('atividadesSemFuncionario').textContent = mensagem;
}

// Inicializar grade de horários na tela
window.onload = () => {
    gerarGrade();
    preencherOpcoesSalas(); // Adiciona as opções de salas
    atualizarSelecaoSalas();
};

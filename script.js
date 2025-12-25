let funcionarios = [];
let atividades = [];
let salas = ['Sala 1', 'Sala 2', 'Sala 3', 'Sala 4', 'Sala 5', 'Sala 6', 'Sala 7'];


// Função para atualizar apenas os dropdowns de funcionários em todas as células
function atualizarDropdownFuncionarios() {
    console.log("Iniciando a atualização dos dropdowns de funcionários...");
    
    atividades.forEach(atividade => {
        const horaFormatada = String(atividade.horarioInicio).padStart(5, '0'); // Garante que o horário tenha formato HH:MM
        const cellId = `${horaFormatada}-${atividade.sala}`.replace(/\s+/g, '');
        const cell = document.getElementById(cellId);
    
        console.log(cell)
        if (cell) {
            console.log(`Atualizando dropdown na célula: ${atividade.horarioInicio}-${atividade.sala}`);
            
            const funcionariosTexto = atividade.funcionariosAlocados.map((func, index) => {
                return `<div>${func} <button class="remover" data-func-index="${index}" data-horarioInicio="${atividade.horarioInicio}" data-sala="${atividade.sala}">Remover</button></div>`;
            }).join('');

            const funcionariosAlocados = atividade.funcionariosAlocados.length;
            const funcionariosRestantes = atividade.funcionariosNecessarios - funcionariosAlocados;

            // Log dos funcionários disponíveis para o dropdown
            console.log(`Funcionários alocados: ${atividade.funcionariosAlocados}`);
            console.log(`Funcionários restantes: ${funcionariosRestantes}`);

            // Atualiza apenas o dropdown de funcionários, mantendo as outras informações
            let dropdown = `<select class="funcionario-disponivel" data-horarioInicio="${atividade.horarioInicio}" data-sala="${atividade.sala}">
                                <option value="">Selecione funcionário</option>`;
            funcionarios.forEach(func => {
                console.log(`Analisando funcionário: ${func.nome}, Ocupado: ${func.ocupado}`);
                if (!atividade.funcionariosAlocados.includes(func.nome) && !func.ocupado) {
                    dropdown += `<option value="${func.nome}">${func.nome}</option>`;
                }
            });
            dropdown += `</select>`;

            // Atualizar a célula com as novas opções no dropdown sem alterar as demais informações
            cell.innerHTML = `
                <strong>${atividade.atividade}</strong><br>
                <em>(${atividade.horarioInicio} - ${atividade.horarioFim})</em><br>
                Observação: ${atividade.observacao}<br>
                Funcionários:<br> ${funcionariosTexto}<br>
                Alocados: ${funcionariosAlocados}/${atividade.funcionariosNecessarios}<br>
                Faltam: ${funcionariosRestantes}<br>
                ${dropdown}`;

            console.log(`Dropdown atualizado para a célula: ${atividade.horarioInicio}-${atividade.sala}`);

            const removerButtons = cell.querySelectorAll('.remover');
            removerButtons.forEach(button => {
                button.addEventListener('click', removerFuncionario);
            });

            const select = cell.querySelector('.funcionario-disponivel');
            select.addEventListener('change', alocarFuncionarioPorDropdown);
        } else {
            console.warn(`Célula não encontrada: ${atividade.horarioInicio}-${atividade.sala}`);
        }
    });
}

// Chamar a função de atualização dos dropdowns após cadastrar um novo funcionário
function cadastrarFuncionario() {
    const nome = document.getElementById('nomeFuncionario').value.trim();
    const erroDiv = document.getElementById('mensagemErroFuncionario');
    
    // Verificar se o nome já existe
    if (funcionarios.some(func => func.nome === nome)) {
        erroDiv.textContent = 'Funcionário já cadastrado com este nome.';
        console.warn(`Tentativa de cadastrar funcionário já existente: ${nome}`);
        return;
    }

    if (nome) {
        funcionarios.push({ nome, ocupado: false });
        console.log(`Funcionário cadastrado: ${nome}`);
        
        document.getElementById('nomeFuncionario').value = '';
        erroDiv.textContent = '';
        atualizarListaFuncionarios();
        atualizarDropdownFuncionarios(); // Atualiza os dropdowns ao cadastrar um novo funcionário
    } else {
        erroDiv.textContent = 'Nome do funcionário não pode ser vazio.';
        console.warn('Tentativa de cadastro de funcionário com nome vazio.');
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
            const idGerado = `${hora}-${sala}`.replace(/\s+/g, ''); // Remove espaços extras do ID
            div.id = idGerado;  // ID correto com espaço entre "Sala" e o número
            console.log(`Gerando célula com ID: ${div.id}`); // Verificação via console
            div.innerHTML = `<strong>${hora}</strong>`;
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
    let horaInicioPrimeiroNum;
    let horaFimPrimeiroNum;

    //trecho para obter valor numerio correto da string hora inicial para comparação
    if(horaInicio.length>4){
        horaInicioPrimeiroNum = Number(horaInicio.slice(0, 2));
    }else{
        horaInicioPrimeiroNum = Number(horaInicio.slice(0, 1));
    }

    console.log(`HoraInicial em numero ${horaInicioPrimeiroNum}`);

    //trecho para obter valor numerio correto da string hora final para comparação

    if(horaFim.length>4){
        horaFimPrimeiroNum = Number(horaFim.slice(0, 2));
    }else{
        horaFimPrimeiroNum = Number(horaFim.slice(0, 1));
    }
    

    console.log(`Tentando cadastrar atividade: ${nomeAtividade}, Início: ${horaInicio}, Fim: ${horaFim}, Sala: ${salasSelecionadas}, horainicial em numero ${horaInicioPrimeiroNum}`);

    if (nomeAtividade && horaInicio && horaFim && salasSelecionadas.length > 0 && numFuncionarios > 0 && horaInicioPrimeiroNum<horaFimPrimeiroNum) {
        salasSelecionadas.forEach(sala => {
            // Verificar se já existe uma atividade no mesmo horário e sala
            const atividadeExistente = atividades.find(a => a.horarioInicio === horaInicio && a.sala === sala);

            if (atividadeExistente) {
                console.log(`Sobrescrevendo atividade existente: ${atividadeExistente.atividade} na sala ${sala} às ${horaInicio}`);
                
                // Liberar os funcionários alocados da atividade existente
                liberarFuncionarios(atividadeExistente);

                // Remover a atividade anterior da lista
                atividades = atividades.filter(a => !(a.horarioInicio === horaInicio && a.sala === sala));
            }

            // Adicionar a nova atividade
            atividades.push({
                horarioInicio: horaInicio,
                horarioFim: horaFim,
                sala: sala,
                atividade: nomeAtividade,
                observacao: observacao,
                funcionariosNecessarios: numFuncionarios,
                funcionariosAlocados: [] // Começa sem funcionários alocados
            });

            console.log(`Atividade cadastrada com sucesso: ${nomeAtividade} na sala ${sala} das ${horaInicio} às ${horaFim}`);
        });

        // Limpar campos de cadastro
        document.getElementById('nomeAtividade').value = '';
        document.getElementById('observacaoAtividade').value = '';
        document.getElementById('numFuncionarios').value = '';

        // Atualizar a grade para refletir as mudanças
        atualizarGradeComAtividades();
    } else {
        alert('Por favor, preencha todos os campos corretamente.');
    }
}

// Função para liberar os funcionários de uma atividade removida
function liberarFuncionarios(atividade) {
    if (atividade && atividade.funcionariosAlocados.length > 0) {
        atividade.funcionariosAlocados.forEach(funcionarioNome => {
            const funcionario = funcionarios.find(f => f.nome === funcionarioNome);
            if (funcionario) {
                funcionario.ocupado = false; // Libera o funcionário
                console.log(`Funcionário ${funcionarioNome} liberado da atividade ${atividade.atividade}`);
            }
        });
        atividade.funcionariosAlocados = []; // Remove todos os funcionários alocados da atividade
    }
}


// Alteração na função de atualizar a grade de atividades
function atualizarGradeComAtividades() {
    gerarGrade(); // Regenera a grade de horários

    atividades.forEach(atividade => {
        const horaFormatada = String(atividade.horarioInicio).padStart(5, '0'); // Garante que o horário tenha formato HH:MM
        const cellId = `${horaFormatada}-${atividade.sala}`.replace(/\s+/g, '');
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

    atualizarDropdownFuncionarios()
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
    console.log(`iniciando função remover funcionário...`)
    const funcIndex = event.target.getAttribute('data-func-index');
    const horario = event.target.getAttribute('data-horarioinicio');
    const sala = event.target.getAttribute('data-sala');
    console.log(atividades)
    const atividade = atividades.find(a => a.horarioInicio === horario && a.sala === sala);
    


    if (atividade) {
        const funcionarioRemovido = atividade.funcionariosAlocados.splice(funcIndex, 1)[0];
        const funcionario = funcionarios.find(f => f.nome === funcionarioRemovido);
        if (funcionario) {
            funcionario.ocupado = false;
        }
        atualizarGradeComAtividades();
    }
    else{
        console.error(`não foi encontrada a atividade com horario : ${horario} e sala ${sala}`);
    }
}

// Função para alocar funcionário pelo dropdown
function alocarFuncionarioPorDropdown(event) {
    console.log(`função alocar funcionario por dropdown iniciando...`)
    const funcionarioNome = event.target.value;
    const horarioInicio = event.target.getAttribute('data-horarioInicio');
    const sala = event.target.getAttribute('data-sala');

    console.log(`Tentando alocar funcionário: ${funcionarioNome}, para a sala: ${sala}, no horário: ${horarioInicio}`);

    if (funcionarioNome) {
        // Encontrar a atividade correspondente
        const atividade = atividades.find(a => a.horarioInicio === horarioInicio && a.sala === sala);

        // Verificar se a atividade foi encontrada
        if (atividade) {
            console.log(`Atividade encontrada: ${atividade.atividade}`);
            
            // Log do número de funcionários alocados e necessários
            console.log(`Funcionários alocados: ${atividade.funcionariosAlocados.length}`);
            console.log(`Funcionários necessários: ${atividade.funcionariosNecessarios}`);

            // Verificar se há espaço para mais funcionários
            if (atividade.funcionariosAlocados.length < atividade.funcionariosNecessarios) {
                // Verificar se o funcionário já foi alocado
                if (!atividade.funcionariosAlocados.includes(funcionarioNome)) {
                    // Alocar o funcionário
                    atividade.funcionariosAlocados.push(funcionarioNome);
                    console.log(`Funcionário ${funcionarioNome} alocado com sucesso!`);
                    
                    // Marcar o funcionário como ocupado
                    const funcionario = funcionarios.find(f => f.nome === funcionarioNome);
                    if (funcionario) {
                        funcionario.ocupado = true;
                    }

                    // Limpar a seleção
                    event.target.value = '';
                    atualizarGradeComAtividades(); // Atualiza a célula da atividade
            
                } else {
                    alert('Esse funcionário já está alocado nesta atividade.');
                    console.warn(`Funcionário ${funcionarioNome} já está alocado nesta atividade.`);
                }
            } else {
                alert('Essa atividade já tem o número máximo de funcionários alocados.');
                console.warn(`Atividade já tem o número máximo de funcionários alocados.`);
            }
        } else {
            console.error(`Erro: atividade não encontrada para o horário: ${horarioInicio}, sala: ${sala}`);
        }
    } else {
        console.warn('Nenhum funcionário foi selecionado.');
    }
}

// Função para verificar atividades sem funcionários
function verificarAtividades() {
    const atividadesSemFuncionario = atividades.filter(atividade => atividade.funcionariosAlocados.length === 0);

    const atividadesComPoucoFuncionario = atividades.filter(atividade => atividade.funcionariosAlocados.length < atividade.funcionariosNecessarios && atividade.funcionariosAlocados.length > 0);

    // Formatando cada atividade para exibir em uma nova linha
    const resultadoSemFuncionario = atividadesSemFuncionario.map(atividade => 
        `${atividade.atividade} (${atividade.horarioInicio} - ${atividade.sala})`
    ).join('<br>');
    const resultadoPoucoFuncionario = atividadesComPoucoFuncionario.map(atividade => 
        `${atividade.atividade} (${atividade.horarioInicio} - ${atividade.sala}) - Faltam ${atividade.funcionariosNecessarios - atividade.funcionariosAlocados.length} funcionários`
    ).join('<br>');
    let mensagemSemFunc ;
    let mensagemPoucoFunc ;
    if (atividadesSemFuncionario.length > 0) {
        document.getElementById('statusAtividadesSemFunc').classList.add("cor-erro");
        mensagemSemFunc = `Atividades sem funcionários:<br>${resultadoSemFuncionario}`;
        document.getElementById('statusAtividadesSemFunc').innerHTML = mensagemSemFunc;
    }
    else{
        document.getElementById('statusAtividadesSemFunc').innerHTML = '';
    }
    if(atividadesComPoucoFuncionario.length>0){
        mensagemPoucoFunc = `Atividades com pouco funcionários:<br>${resultadoPoucoFuncionario}`;
        document.getElementById('statusAtividadesPoucoFunc').classList.add("cor-aviso");
        document.getElementById('statusAtividadesPoucoFunc').innerHTML = mensagemPoucoFunc;
    }
    else{
        document.getElementById('statusAtividadesPoucoFunc').innerHTML = '';
    }
    if(atividadesSemFuncionario.length === 0 && atividadesComPoucoFuncionario.length === 0){
        document.getElementById('statusAtividadesPreenchidas').classList.add("cor-sucesso");
        mensagemSemFunc = 'Todas as atividades têm funcionários alocados.<br>';
        document.getElementById('statusAtividadesPreenchidas').innerHTML = mensagemSemFunc;
    }
    else{
         document.getElementById('statusAtividadesPreenchidas').innerHTML = '';
    }


    

}


// Inicializar grade de horários na tela
window.onload = () => {
    gerarGrade();
    preencherOpcoesSalas(); // Adiciona as opções de salas
    atualizarSelecaoSalas();
};

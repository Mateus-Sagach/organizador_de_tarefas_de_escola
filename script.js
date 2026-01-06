let funcionarios = [];
let atividades = [];
let salas = ['Sala 1', 'Sala 2', 'Sala 3', 'Sala 4', 'Sala 5', 'Sala 6', 'Patio'];
let contagemCiclos = 0;
let dbCarregado = null;
let diaSelecionado = "segunda";
const horarios = [
    "06:10",//entrada de alguns funcionarios
    "07:00",//entrada das turmas da manhã
    "07:50",
    "08:40",
    "09:30",
    // intervalo 09:30 ~ 09:50
    "09:50",
    "10:40",
    "11:30",
    "12:20",
    "13:00",//entrada das turmas da tarde
    "13:50",
    "14:40",
    "15:30",
    // intervalo 15:30 ~ 15:50
    "15:50",
    "16:40",
    "17:30"];

//const horarios = Array.from({ length: 12 }, (_, i) => `${String(i + 6).padStart(2, '0')}:00`); // Horários formatados como 06:00, 07:00, etc. se necessario mudar os horarios para horas cheias


document.getElementById("diaSemanaSelect").addEventListener("change", (e) => {
    diaSelecionado = e.target.value;
    console.log(`Dia da semana selecionado: ${diaSelecionado}`);
    atualizarGradeComAtividades();
});

function abrirBanco() {
    return new Promise((resolve, reject) => {

        // Se já estiver aberto, reutiliza
        if (dbCarregado) {
            resolve(dbCarregado);
            return;
        }

        const request = indexedDB.open('organizadorEscola', 3);

        request.onerror = () => reject("Erro ao abrir o banco");

        request.onupgradeneeded = function (event) {
            const db = event.target.result;

            if (!db.objectStoreNames.contains('funcionarios')) {
                const store = db.createObjectStore('funcionarios', {
                    keyPath: 'id',
                    autoIncrement: true
                });

                store.createIndex('nome', 'nome', { unique: true });
            }

            if (!db.objectStoreNames.contains('atividades')) {
                db.createObjectStore('atividades', {
                keyPath: 'id',
                autoIncrement: true
                });
                console.log('Criando object store atividades e o id');
            } else {
                store = event.target.transaction.objectStore('atividades');
        }
        };

        request.onsuccess = function (event) {
            dbCarregado = event.target.result;
            resolve(dbCarregado);
        };
    });
}
//função para obter a object store desejada com o modo desejado
async function obterStore(nomeStore, modo = 'readonly') {
    const db = await abrirBanco();
    const tx = db.transaction([nomeStore], modo);
    return tx.objectStore(nomeStore);
}


async function obterNomeFuncionario(idFuncionario) {
    var objectStore = await obterStore('funcionarios', 'readwrite');
    var request = objectStore.get(idFuncionario);
    request.onsuccess = function (event) {
        console.log('O nome do funcionario de id ' + idFuncionario + ' é ' + request.result.nome);
        return request.result.nome;
    }
    request.onerror = function (event) {
    // Trata erro
        console.log('Não foi possível obter o nome do funcionário com id ' + idFuncionario);
    };
}
    
async function obterIDFuncionario(nomeFuncionario) {
    var objectStore = await obterStore('funcionarios', 'readwrite');
    return new  Promise((resolve, reject) => {
            objectStore.openCursor().onsuccess = function (event) {
                var cursor = event.target.result;
                if (cursor) {
                    if(cursor.value.nome === nomeFuncionario){
                        console.log('O id do funcionário de nome ' + nomeFuncionario + ' é ' + cursor.value.id);
                        resolve(cursor.value.id);
                        return;
                    }
        
                    cursor.continue();
                } else {
                    console.log('Não existe mais registros!');
                    resolve(null); // Retorna null se não encontrar o nome passado no parametro
                    
                }
            };

        });
}


// função para deletar funcionário do indexedDB usando como parametro o id do funcionário
async function deletarFuncionarioIndexDB(idFuncionario) {
    const store = await obterStore('funcionarios', 'readwrite');
    return new Promise((resolve, reject) => {
            
            if (!idFuncionario) {
                console.log('ID do funcionário inválido para remoção.');
                reject('ID do funcionário inválido.');
                return;
            }
            const deleteRequest = store.delete(idFuncionario);
            console.log('Tentando deletar funcionário com id ' + idFuncionario);
            deleteRequest.onsuccess = function (event) {
                console.log('Funcionário deletado com sucesso!');
                resolve(); //remoção bem sucedida
            };
            deleteRequest.onerror = function (event) {
                console.log('Erro ao deletar funcionário: '+ event.target.error);
                reject(event.target.error); //falha ao deletar
            }
        });
}

async function adicionarFuncionarioIndexDB(funcionario) {
        const store = await obterStore('funcionarios', 'readwrite');
        const addRequest = store.add(funcionario);
        addRequest.onsuccess = () => {
            console.log('Funcionario cadastrado com sucesso no IndexedDB!');
        };
        addRequest.onerror = (e) => {
            if (e.target.error.name === 'ConstraintError') {
                console.log('Já existe um funcionário com esse nome no IndexedDB!');
                alert('Esse nome já está cadastrado!');
            } else {
                console.log('Erro ao salvar:', e.target.error);
            }
        };
}

// carrega os funcionários do indexedDB para o array funcionarios
async function carregarFuncionariosIndexDB() {
    const store = await obterStore('funcionarios', 'readonly');
    return new Promise((resolve, reject) => {
        const getAll = store.getAll();
        getAll.onsuccess = () => {
            funcionarios = getAll.result; // substitui o array
            resolve(funcionarios);
            console.log('Funcionários carregados do IndexedDB:', funcionarios);
        };

        getAll.onerror = () => reject(getAll.error);
    });
}

async function adicionarAtividadeIndexDB(atividade) {
    const store = await obterStore('atividades', 'readwrite');
    const addRequest = store.add(atividade);

    addRequest.onsuccess = () => {
        console.log('Atividade cadastrada com sucesso no IndexedDB!');
    };
    addRequest.onerror = (e) => {
        console.log('Erro ao salvar atividade:', e.target.error);
    };
}

async function deletarAtividadeIndexDB(idAtividade) {
    const store = await obterStore('atividades', 'readwrite');
    console.log('Tentando deletar atividade com id ' + idAtividade);
    const deleteRequest = store.delete(idAtividade);
    return new Promise((resolve, reject) => {
        deleteRequest.onsuccess = () => {
            console.log('Atividade deletada com sucesso!');
            resolve();
        };
        deleteRequest.onerror = (e) => {
            console.log('Erro ao deletar atividade:', e.target.error);
            reject(e.target.error);
        };
    });
}

async function adicionarFuncAlocadoAtividadeIndexDB(idAtividade, nomeFuncionario) {
    const store =  await obterStore('atividades', 'readwrite').then(store => {
            const getRequest = store.get(idAtividade);
            getRequest.onsuccess = function (event) {
                const atividadeData = getRequest.result;
                atividadeData.funcionariosAlocados.push(nomeFuncionario);
                const updateRequest = store.put(atividadeData);
            };
        });
}

async function atualizarFuncAlocadosAtividadeIndexDB(idAtividade, funcionariosAlocados) {
    console.log('Função do indexeddb começando a Atualizar funcionários alocados da atividade de identificador ' + idAtividade);
    const store = await obterStore('atividades', 'readwrite');
        const getRequest = store.get(idAtividade);
        getRequest.onsuccess = function (event) {
            const atividadeData = getRequest.result;
            atividadeData.funcionariosAlocados = funcionariosAlocados;
            const updateRequest = store.put(atividadeData);
            updateRequest.onsuccess = function () {
                console.log(`Funcionários alocados da atividade ${idAtividade} atualizados no IndexedDB.`);
            };
            updateRequest.onerror = function (e) {
                console.log('Erro ao atualizar atividade:', e.target.error);
            };
        };
        getRequest.onerror = function (e) {
                console.log('Erro ao obter atividade:', e.target.error);
        };
}

// função para remover funcionário alocado de uma atividade específica no indexedDB usando como parametros o identificador unico da atividade e o nome do funcionário
async function removerFuncAlocadoAtividadeIndexDB(idAtividade, nomeFuncionario) {
    console.log('Função do indexeddb começando a Remover funcionário ' + nomeFuncionario + ' da atividade de identificador ' + idAtividade);

    const store = await obterStore('atividades', 'readwrite');
        const getRequest = store.get(idAtividade);
        getRequest.onsuccess = function (event) {
            const atividadeData = getRequest.result;
            console.log('Funcionários alocados antes da remoção:', atividadeData.funcionariosAlocados);

            if (atividadeData.funcionariosAlocados) {
                atividadeData.funcionariosAlocados = atividadeData.funcionariosAlocados.filter(f => f !== nomeFuncionario);
            }   
            const updateRequest = store.put(atividadeData);
            updateRequest.onsuccess = function () {
                console.log(`Funcionário ${nomeFuncionario} removido da atividade ${idAtividade} no IndexedDB.`);
            };
            updateRequest.onerror = function (e) {
                console.log('Erro ao atualizar atividade:', e.target.error);
            };
        };
        getRequest.onerror = function (e) {
                console.log('Erro ao atualizar funcionário:', e.target.error);
        };
}

async function obterIdAtividadeIndexDB(identificadorUnico) {
    const store = await obterStore('atividades', 'readonly');
    return new Promise((resolve, reject) => {
         store.openCursor().onsuccess = function (event) {
                var cursor = event.target.result;
                if (cursor) {
                    if(cursor.value.identificadorUnico === identificadorUnico){
                        console.log('O id da atividade de Identificador ' + identificadorUnico + ' é ' + cursor.value.id);
                        resolve(cursor.value.id);
                        return;
                    }
                    cursor.continue();
                } else {
                    console.log('Não existe mais registros!');
                    resolve(null); // Retorna null se não encontrar o nome passado no parametro
                    
                }
            };
    });
}

// carrega as atividades do indexedDB para o array atividades
async function carregarAtividadesIndexDB() {
    const store = await obterStore('atividades', 'readonly');
    return new Promise((resolve, reject) => {
        const getAll = store.getAll();
        getAll.onsuccess = () => {
            atividades = getAll.result;
            resolve(atividades);
            console.log('Atividades carregadas do IndexedDB:', atividades);
        };

        getAll.onerror = () => reject(getAll.error);
    });
}

//função que verifica se o funcionário está alocado/ocupado em alguma atividade no dia e horário especificados, se sim retorna true, se não false
function funcionarioOcupadoNoDiaHorario(nomeFuncionario, dia, horario) {
    return atividades.some(atividade =>
        atividade.diaSemana === dia &&
        atividade.horarioInicio === horario &&
        atividade.funcionariosAlocados.includes(nomeFuncionario)
    );
}

function cadastrarFuncionario() {
    const nome = document.getElementById('nomeFuncionario').value.trim();
    const erroDiv = document.getElementById('mensagemErroFuncionario');

    console.log(`Tentando cadastrar funcionário: ${nome}`);

    
    // Verificar se o nome já existe
    if (funcionarios.some(func => func.nome === nome)) {
        erroDiv.textContent = 'Funcionário já cadastrado com este nome.';
        console.warn(`Tentativa de cadastrar funcionário já existente: ${nome}`);
        return;
    }

    if (nome) {
        funcionarios.push({ 
            nome
        });
        console.log(`Funcionário cadastrado: ${nome}`);
        
        document.getElementById('nomeFuncionario').value = '';
        erroDiv.textContent = '';
        adicionarFuncionarioIndexDB({ 
            nome: nome
        }); // Adiciona ao IndexedDB

        atualizarListaFuncionarios();
        atualizarGradeComAtividades();
 // Atualiza os dropdowns ao cadastrar um novo funcionário
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
        item.setAttribute('data-index', index);

        // Criar botão remover
        const botaoRemover = document.createElement('button');
        botaoRemover.textContent = 'Remover';
        botaoRemover.classList.add('remover');

        // evento de clique para remover
        botaoRemover.addEventListener('click', () => {
            funcionarios.splice(index, 1);

            // Remover do IndexedDB
            obterIDFuncionario(func.nome).then(idFuncionario => {
                if (idFuncionario) {
                    deletarFuncionarioIndexDB(idFuncionario).then(() => {
                        console.log(`Funcionário ${func.nome} removido do IndexedDB.`);
                    }).catch(error => {
                        console.log('Erro ao remover funcionário do IndexedDB:', error);
                    });
                }
            });


            removerFuncionarioDeTodasAtividades(func.nome);
            console.log('Atividades', atividades);
            atualizarListaFuncionarios();
            atualizarGradeComAtividades(); // Atualiza a grade para refletir a remoção do funcionário


            
        });

        // Adicionar botão ao item
        item.appendChild(botaoRemover);
        lista.appendChild(item);
    });

}

function gerarGrade() {
    contagemCiclos++;
    console.log(`Gerando grade de horários. Contagem de ciclos: passou ${contagemCiclos} vezes pelo gerarGrade()`);
    console.log('Horários gerados para a grade:', horarios);
    const gradeHorarios = document.getElementById('gradeHorarios');

    gradeHorarios.innerHTML = ''; // Limpa a grade antes de gerar novamente

    // Primeira coluna fixa com horários
    const blankHeader = document.createElement('div');
    blankHeader.classList.add('header');
    gradeHorarios.appendChild(blankHeader);

    // Cabeçalhos com os nomes das salas e editáveis
    salas.forEach((sala, index) => {
        const div = document.createElement('div');
        div.classList.add('header');
        div.textContent = sala; 
        gradeHorarios.appendChild(div);
    });

    atualizarSelecaoSalas(); 
    horarios.forEach(hora => {
        // Coluna com o horário
        const horaDiv = document.createElement('div');
        horaDiv.classList.add('header');
        horaDiv.textContent = hora;
        gradeHorarios.appendChild(horaDiv);

        salas.forEach((sala, index) => {
            const div = document.createElement('div');
            const idGerado = `${hora}-${sala}`.replace(/\s+/g, ''); // Remove espaços extras do ID
            div.id = idGerado;  // ID correto com espaço entre 'Sala' e o número
            div.innerHTML = `<strong>${hora}</strong>`;
            gradeHorarios.appendChild(div);
        });
    });
}

function atualizarSelectHorarios() {
    const select = document.getElementById('horaInicioAtividade');
    select.innerHTML = '';

    horarios.forEach(hora => {
        const option = document.createElement('option');
        option.value = hora;
        option.textContent = hora;
        select.appendChild(option);
    });

    const selectFim = document.getElementById('horaFimAtividade');
    selectFim.innerHTML = '';
    horarios.forEach(hora => {
        const option = document.createElement('option');
        option.value = hora;
        option.textContent = hora;
        selectFim.appendChild(option);
    });

    const option = document.createElement('option');
    option.value = '18:20';
    option.textContent = '18:20';
    selectFim.appendChild(option);
}
// Função para preencher o select de salas no cadastro de atividades
function preencherOpcoesSalas() {
    const selectSalas = document.getElementById('salasAtividade');
    selectSalas.innerHTML = ''; // Limpa qualquer valor anterior

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
    let horaInicioPrimeiroNum=Number(horaInicio.slice(0, 2));
    let horaInicioSegundoNum=Number(horaInicio.slice(3, 5));
    let horaFimPrimeiroNum=Number(horaFim.slice(0, 2));
    let horaFimSegundoNum=Number(horaFim.slice(3, 5));
    let totalminutosInicio=horaInicioPrimeiroNum*60+horaInicioSegundoNum;
    let totalminutosFim=horaFimPrimeiroNum*60+horaFimSegundoNum;

    console.log(`HoraInicial primeiro numero ${horaInicioPrimeiroNum}`);
    console.log(`HoraInicial segundo numero ${horaInicioSegundoNum}`);
    console.log(`HoraFim primeiro numero ${horaFimPrimeiroNum}`);
    console.log(`HoraFim segundo numero ${horaFimSegundoNum}`);
    console.log(`Tentando cadastrar atividade: ${nomeAtividade}, Início: ${horaInicio}, Fim: ${horaFim}, Sala: ${salasSelecionadas}, horainicial em numero ${horaInicioPrimeiroNum}`);

    if (nomeAtividade && horaInicio && horaFim && salasSelecionadas.length > 0 && numFuncionarios > 0 && totalminutosInicio<totalminutosFim) {
        salasSelecionadas.forEach(sala => {
            // Verificar se já existe uma atividade no mesmo horário e sala
            const atividadeExistente = atividades.find(a => a.horarioInicio === horaInicio && a.sala === sala && a.diaSemana === diaSelecionado);

            if (atividadeExistente) {
                console.log(`Sobrescrevendo atividade existente: ${atividadeExistente.atividade} na sala ${sala} às ${horaInicio}`);
                
                // Remover do IndexedDB caso exista uma atividade para sobrescrever
                obterIdAtividadeIndexDB(atividadeExistente.identificadorUnico).then(idAtividade => {
                    if (idAtividade) {
                        deletarAtividadeIndexDB(idAtividade).then(() => {
                            console.log(`Atividade ${atividadeExistente.atividade} removida do IndexedDB para sobrescrição.`);
                        }).catch(error => {
                            console.log('Erro ao remover atividade do IndexedDB:', error);
                        });
                    }
                });

                // Liberar os funcionários alocados da atividade existente
                liberarFuncionarios(atividadeExistente);

                // Remover a atividade anterior do array de atividades
                atividades = atividades.filter(a => !(a.horarioInicio === horaInicio && a.sala === sala && a.diaSemana === diaSelecionado));
            }

            // Adicionar a nova atividade
            atividades.push({
                horarioInicio: horaInicio,
                horarioFim: horaFim,
                sala: sala,
                atividade: nomeAtividade,
                observacao: observacao,
                identificadorUnico: `${diaSelecionado}-${horaInicio}-${sala}`,
                funcionariosNecessarios: numFuncionarios,
                funcionariosAlocados: [], // Começa sem funcionários alocados
                diaSemana: diaSelecionado
            });
            
            console.log(`Atividade cadastrada com sucesso: ${nomeAtividade} na sala ${sala} das ${horaInicio} às ${horaFim}`);

            adicionarAtividadeIndexDB({
                horarioInicio: horaInicio,
                horarioFim: horaFim,
                sala: sala,
                atividade: nomeAtividade,
                observacao: observacao,
                identificadorUnico: `${diaSelecionado}-${horaInicio}-${sala}`,
                funcionariosNecessarios: numFuncionarios,
                funcionariosAlocados: [],
                diaSemana: diaSelecionado
            });

        });

        // Limpar campos de cadastro
        document.getElementById('nomeAtividade').value = '';
        document.getElementById('observacaoAtividade').value = '';
        document.getElementById('numFuncionarios').value = '';

        // Atualizar a grade para refletir as mudanças
        atualizarGradeComAtividades();
    } else {
        console.warn('Erro ao cadastrar atividade: Preencha todos os campos corretamente.');
        if(horaInicioPrimeiroNum>=horaFimPrimeiroNum){
            alert('A hora de início deve ser um horário anterior que a hora de término.');
        }
        if(!nomeAtividade){
            alert('O nome da atividade não pode estar vazio.');
        }
        if(numFuncionarios<=0 || isNaN(numFuncionarios)){
            alert('O número de funcionários necessários deve ser um número maior que zero.');
        }
        
    }
}

function removerAtividade(event) {
    const horario = event.target.getAttribute('data-horarioinicio');
    const sala = event.target.getAttribute('data-sala');
    console.log(atividades)
    const atividade = atividades.find(a => a.horarioInicio === horario && a.sala === sala && a.diaSemana === diaSelecionado);
    console.log(`Tentando Remover atividade na sala ${sala} às ${horario}`);

    const atividadeIndex = atividades.findIndex(a => a.horarioInicio === horario && a.sala === sala && a.diaSemana === diaSelecionado);
    console.log('atividade a ser removida Index:', atividadeIndex);
    if (atividadeIndex !== -1) {
        const atividadeRemovida = atividades[atividadeIndex];
        console.log(`Atividade encontrada para remoção: ${atividadeRemovida} na sala ${sala} às ${horario}`);
        // Liberar os funcionários alocados da atividade removida
        liberarFuncionarios(atividadeRemovida);
        // Remover a atividade da lista
        
        obterIdAtividadeIndexDB(atividadeRemovida.identificadorUnico).then(idAtividade => {
                if (idAtividade) {
                    deletarAtividadeIndexDB(idAtividade).then(() => {
                        console.log(`Atividade ${atividadeRemovida.atividade} removida do IndexedDB.`);
                    }).catch(error => {
                        console.log('Erro ao remover atividade do IndexedDB:', error);
                    });
                }
            });
        atividades.splice(atividadeIndex, 1);
        atualizarGradeComAtividades();
    }
}

// Função para liberar os funcionários de uma atividade removida
function liberarFuncionarios(atividade) {
    if (atividade && atividade.funcionariosAlocados.length > 0) {
        atividade.funcionariosAlocados = []; // Remove todos os funcionários alocados da atividade
    }
}

// Alteração na função de atualizar a grade de atividades
function atualizarGradeComAtividades() {
    gerarGrade(); // Regenera a grade de horários
    
    console.log('Iniciando a atualização dos dropdowns de funcionários...');

     const atividadesFiltradas = atividades.filter(
        a => a.diaSemana === diaSelecionado
    );

    atividadesFiltradas.forEach(atividade => {
        const horaFormatada = String(atividade.horarioInicio).padStart(5, '0'); // Garante que o horário tenha formato HH:MM
        const cellId = `${horaFormatada}-${atividade.sala}`.replace(/\s+/g, '');
        console.log(`Procurando célula com ID: ${cellId}`);
        const cell = document.getElementById(cellId);
    
        console.log(cell)
        if (cell) {
            console.log(`Atualizando dropdown na célula: ${atividade.horarioInicio}-${atividade.sala}-${atividade.diaSemana}`);
            
            const funcionariosTexto = atividade.funcionariosAlocados.map((func, index) => {
                return `<div>${func} <button class='remover' data-func-index='${index}' data-horarioInicio='${atividade.horarioInicio}' data-sala='${atividade.sala}' data-diaSemana='${atividade.diaSemana}'>Remover</button></div>`;
            }).join('');

            const funcionariosAlocados = atividade.funcionariosAlocados.length;
            const funcionariosRestantes = atividade.funcionariosNecessarios - funcionariosAlocados;

            // Log dos funcionários disponíveis para o dropdown
            console.log(`Funcionários alocados: ${atividade.funcionariosAlocados}`);
            console.log(`Funcionários restantes: ${funcionariosRestantes}`);

            // Atualiza apenas o dropdown de funcionários, mantendo as outras informações
            let dropdown = `<select class='funcionario-disponivel' data-horarioInicio='${atividade.horarioInicio}' data-sala='${atividade.sala}'>
                                <option value=''>Selecione funcionário</option>`;
            funcionarios.forEach(func => {
                console.log(`Analisando funcionário: ${func.nome}`);
                if (!funcionarioOcupadoNoDiaHorario(func.nome, diaSelecionado, atividade.horarioInicio)) {
                    dropdown += `<option value='${func.nome}'>${func.nome}</option>`;
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
                <button class='remover-atividade' data-horarioInicio='${atividade.horarioInicio}' data-sala='${atividade.sala}'>Remover Atividade</button><br>
                ${dropdown}`;

            console.log(`Dropdown atualizado para a célula: ${atividade.horarioInicio}-${atividade.sala}`);

            const removerButtons = cell.querySelectorAll('.remover');
            removerButtons.forEach(button => {
                button.addEventListener('click', removerFuncionarioAtividadeEspecifica);
            });

            const removerButtonsAtividade = cell.querySelectorAll('.remover-atividade');
            removerButtonsAtividade.forEach(button => {
                button.addEventListener('click', removerAtividade);
            });

            const select = cell.querySelector('.funcionario-disponivel');
            select.addEventListener('change', alocarFuncionarioPorDropdown);
        } else {
            console.warn(`Célula não encontrada: ${atividade.horarioInicio}-${atividade.sala}`);
        }
    });

    verificarAtividades();
}

// Função para preencher o select de salas com os nomes das salas do grid
function atualizarSelecaoSalas() {
    console.log('Iniciando atualização da seleção de salas no cadastro de atividades...');
    const selectSalas = document.getElementById('salasAtividade');
    selectSalas.innerHTML = '';

    const headers = document.querySelectorAll('#gradeHorarios .header');

    headers.forEach(header => {
        const nomeSala = header.textContent.trim();
        console.log(`Adicionando sala ao select: ${nomeSala}`);
        if (nomeSala) {
            const option = document.createElement('option');
            option.value = nomeSala;
            option.textContent = nomeSala;
            selectSalas.appendChild(option);
        }
    });
}

// Função para remover um funcionário de todas as atividades quando o funcionario deixar de existir no array de funcionários
function removerFuncionarioDeTodasAtividades(nomeFuncionario) {
    atividades.forEach(atividade => {
        if (Array.isArray(atividade.funcionariosAlocados)) {
            atividade.funcionariosAlocados = atividade.funcionariosAlocados.filter(nome => nome !== nomeFuncionario);
            obterIdAtividadeIndexDB(atividade.identificadorUnico).then(idAtividade => {
                if (idAtividade) {
                    atualizarFuncAlocadosAtividadeIndexDB(idAtividade, atividade.funcionariosAlocados);
                }
            });
        }

    });
    console.log(`Funcionário ${nomeFuncionario} removido de todas as atividades.`);
    console.log(atividades);
    atualizarGradeComAtividades(); // Atualiza a grade após a remoção
}

// Função para remover um funcionário de uma atividade específica dentro do grid
function removerFuncionarioAtividadeEspecifica(event) {
    console.log(`iniciando função remover funcionário de atividade...`)
    const funcIndex = event.target.getAttribute('data-func-index');
    const horario = event.target.getAttribute('data-horarioinicio');
    const sala = event.target.getAttribute('data-sala');
    console.log(atividades)
    const atividade = atividades.find(a => a.horarioInicio === horario && a.sala === sala && a.diaSemana === diaSelecionado);
    

    if (atividade) {

        const funcionarioRemovido = atividade.funcionariosAlocados.splice(funcIndex, 1)[0];

        const funcionario = funcionarios.find(f => f.nome === funcionarioRemovido);
        if (funcionario) {
            obterIdAtividadeIndexDB(atividade.identificadorUnico).then(idAtividade => {
                if (idAtividade) {
                // Atualiza a atividade no IndexedDB
                    console.log(`Tentando chamar função para Remover funcionário ${funcionario.nome} da atividade ${atividade.identificadorUnico} no IndexedDB.`);
                    obterIdAtividadeIndexDB(atividade.identificadorUnico).then(idAtividade => {
                    removerFuncAlocadoAtividadeIndexDB(idAtividade, funcionario.nome);
                    });
                }
            });

            console.log(`Funcionário ${funcionarioRemovido} removido da atividade ${atividade.atividade} na sala ${sala} às ${horario}`);

        }
        atualizarGradeComAtividades();
    }
    else{
        console.error(`não foi encontrada a atividade com horario : ${horario} e sala ${sala}`);
    }
}

// Função para alocar funcionário pelo dropdown da atividade
function alocarFuncionarioPorDropdown(event) {
    console.log(`função alocar funcionario por dropdown iniciando...`)
    const funcionarioNome = event.target.value;
    const horarioInicio = event.target.getAttribute('data-horarioInicio');
    const sala = event.target.getAttribute('data-sala');

    console.log(`Tentando alocar funcionário: ${funcionarioNome}, para a sala: ${sala}, no horário: ${horarioInicio}, na ${diaSelecionado}`);

    if (funcionarioNome) {
        // Encontrar a atividade correspondente
        const atividade = atividades.find(a => a.horarioInicio === horarioInicio && a.sala === sala && a.diaSemana === diaSelecionado);

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
                    // Atualiza o IndexedDB para refletir a alocação
                    obterIdAtividadeIndexDB(atividade.identificadorUnico).then(idAtividade => {
                        if (idAtividade) {
                            // Atualiza a atividade no IndexedDB
                            adicionarFuncAlocadoAtividadeIndexDB(idAtividade, funcionarioNome);
                            console.log(`Funcionário ${funcionarioNome} adicionado à atividade ${atividade.atividade} no IndexedDB.`);
                        }
                    });

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
    atividadesFiltradas = atividades.filter(atividade => atividade.diaSemana === diaSelecionado);

    const atividadesSemFuncionario = atividadesFiltradas.filter(atividade => atividade.funcionariosAlocados.length === 0);

    const atividadesComPoucoFuncionario = atividadesFiltradas.filter(atividade => atividade.funcionariosAlocados.length < atividade.funcionariosNecessarios && atividade.funcionariosAlocados.length > 0);

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
        document.getElementById('statusAtividadesSemFunc').classList.add('cor-erro');
        mensagemSemFunc = `Atividades sem funcionários:<br>${resultadoSemFuncionario}`;
        document.getElementById('statusAtividadesSemFunc').innerHTML = mensagemSemFunc;
    }
    else{
        document.getElementById('statusAtividadesSemFunc').innerHTML = '';
    }
    if(atividadesComPoucoFuncionario.length>0){
        mensagemPoucoFunc = `Atividades com pouco funcionários:<br>${resultadoPoucoFuncionario}`;
        document.getElementById('statusAtividadesPoucoFunc').classList.add('cor-aviso');
        document.getElementById('statusAtividadesPoucoFunc').innerHTML = mensagemPoucoFunc;
    }
    else{
        document.getElementById('statusAtividadesPoucoFunc').innerHTML = '';
    }
    if(atividadesSemFuncionario.length === 0 && atividadesComPoucoFuncionario.length === 0){
        document.getElementById('statusAtividadesPreenchidas').classList.add('cor-sucesso');
        mensagemSemFunc = 'Todas as atividades existentes têm funcionários alocados.<br>';
        document.getElementById('statusAtividadesPreenchidas').innerHTML = mensagemSemFunc;
    }
    else{
         document.getElementById('statusAtividadesPreenchidas').innerHTML = '';
    }

}

//função que foi usada para realizar o teste de estresse no sistema, preenchendo o banco de dados com atividades em todas as salas, horários e dias da semana
async function testeDesempenho() {
    console.log("|-|-|-|Iniciando verificação para teste de desempenho completo...|-|-|-|");
    if(atividades.length > 0) {
        console.warn("O teste de desempenho só pode ser executado em um banco de dados vazio. Por favor, limpe as atividades antes de executar o teste.");
        return;
    }
    console.log(" Iniciando teste de desempenho completo...");

    const diasSemana = ["segunda", "terça", "quarta", "quinta", "sexta"];

    if (salas.length < 7 || funcionarios.length < 7) {
        console.error("É necessário pelo menos 7 salas e 7 funcionários.");
        return;
    }

    let atividadesGeradas = 0;
    for (const dia of diasSemana) {
        for (let i = 0; i < salas.length; i++) {
            const sala = salas[i];
            const funcionario = funcionarios[i]; // 1 funcionário fixo por sala

            for (const horario of horarios) {
                if (horario === horarios[horarios.length - 1]) {
                    const atividade = {
                    atividade: "Atividade Teste",
                    horarioInicio: horario,
                    horarioFim: '18:20',
                    sala: sala,
                    diaSemana: dia,
                    observacao: "Gerado para teste de desempenho",
                    funcionariosNecessarios: 1,
                    funcionariosAlocados: [funcionario.nome]
                    };

                     atividades.push(atividade);

                    // Salva no IndexedDB
                    await adicionarAtividadeIndexDB(atividade);
                    atividadesGeradas++;
                }else{
                    const atividade = {
                        atividade: "Atividade Teste",
                        horarioInicio: horario,
                        horarioFim: horarios[horarios.indexOf(horario) +1],
                        sala: sala,
                        diaSemana: dia,
                        observacao: "Gerado para teste de desempenho",
                        funcionariosNecessarios: 1,
                        funcionariosAlocados: [funcionario.nome]
                    };

                    // Atualiza estruturas em memória
                    atividades.push(atividade);

                    // Salva no IndexedDB
                    await adicionarAtividadeIndexDB(atividade);
                    atividadesGeradas++;
                }
            }
        }
    }


    console.log(`Total de atividades geradas: ${atividadesGeradas}`);
    console.log("Atividades geradas para o teste de desempenho:", atividades);
    atualizarGradeComAtividades();
    console.log(" Teste de desempenho finalizado com sucesso!");
}

// Inicializar grade de horários na tela
window.onload = () => {
    
    abrirBanco();

    //carrega os funcionarios do indexedDB para a pagina ao abrir a pagina
    carregarFuncionariosIndexDB().then(() => {
        console.log('Funcionarios no array ',funcionarios);
        gerarGrade();
        preencherOpcoesSalas();
        atualizarGradeComAtividades();
        atualizarListaFuncionarios();
        atualizarSelecaoSalas();
        atualizarSelectHorarios();
    });


    //carrega as atividades do indexedDB para a pagina ao abrir a pagina
    carregarAtividadesIndexDB().then(() => {
        console.log('Atividades no array ',atividades);
        gerarGrade();
        preencherOpcoesSalas();
        atualizarGradeComAtividades();
        atualizarListaFuncionarios();
        atualizarSelecaoSalas();
        atualizarSelectHorarios();

    });


};

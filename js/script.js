//===========================================================
//Váriaveis
//===========================================================

//Elementos do formulário
const descricao = document.getElementById("descricao");
const valor = document.getElementById("valor");
const tipo = document.getElementById("tipo");
const data = document.getElementById("data");
const botao = document.getElementById("add-movimentacao");
const listaMovimentacoes = document.getElementById("lista-movimentacoes");

//Elementos dos cartões
const valorSaldo = document.getElementById("valor-saldo");
const valorReceita = document.getElementById("valor-receitas");
const valorDespesa = document.getElementById("valor-despesas");
const mensagemErro = document.getElementById("mensagem-erro");



//===========================================================
//Dados
//===========================================================

let movimentacoes = [];
let indiceEditando = null;

const dadosSalvos = localStorage.getItem("movimentacoes");

if (dadosSalvos){
    movimentacoes = JSON.parse(dadosSalvos);
}


//===========================================================
//Validações
//===========================================================

//Verifica se algum campo não foi preenchido
function verificarCampo(){
    if (descricao.value === "" || valor.value === "" || data.value === ""){
        mensagemErro.textContent = "Todos os campos devem ser preenchidos";
        return false;
    }

    return true;
}

//Verifica se o valor é inválido (<=0)
function verificarValor(movimentacao){
    if (movimentacao.valor <= 0){
        mensagemErro.textContent = "O valor deve ser maior que 0";
        return false;
    }

    return true;
}


//Verifica se a data é inválida
function verificarData(movimentacao){
    const hoje = new Date().toISOString().split("T")[0];

    if (movimentacao.data > hoje){
        mensagemErro.textContent = "Data inválida"
        return false;
    }

    return true;
}

//===========================================================
//Formatações
//===========================================================

function formatarMoeda(valor){
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function formatarData(data){
    const partes = data.split("-");

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}


//===========================================================
//Resumo
//===========================================================

//Atualiza o resumo das movimentações
function atualizarResumo(){
    let receitas = 0;
    let despesas = 0;

    movimentacoes.forEach(function(movimentacao){
        if (movimentacao.tipo === "receita"){
            receitas += movimentacao.valor;
        };

        if (movimentacao.tipo === "despesa"){
            despesas += movimentacao.valor;
        };
    });


    const saldo = receitas - despesas;

    valorSaldo.textContent = formatarMoeda(saldo);
    valorReceita.textContent = formatarMoeda(receitas);
    valorDespesa.textContent = formatarMoeda(despesas);
}

//===========================================================
//Movimentações
//===========================================================

//Cria uma div e seus elementos para cada movimentação, assim fica mais organizado visualmente
function mostrarMovimentacoes(){
    listaMovimentacoes.innerHTML ="";

    movimentacoes.forEach(function(movimentacao, indice){
        const item = document.createElement("div");
        item.classList.add("movimentacao");

        if (movimentacao.tipo === "receita"){
            item.classList.add("receita");
        }else{
            item.classList.add("despesa");
        }


        const titulo = document.createElement("h3");
        const valorItem = document.createElement("p");
        const tipoItem = document.createElement("p");
        const dataItem = document.createElement("p");
        const botaoExcluir = document.createElement("button");
        const botaoEditar = document.createElement("button");

        const informacoes = document.createElement("div");
        const detalhes = document.createElement("div");

        informacoes.classList.add("informacoes");
        detalhes.classList.add("detalhes");
        botaoExcluir.classList.add("botao-excluir");
        botaoEditar.classList.add("botao-editar");

        //Adicionando elemento na div de lista de movimentações
        titulo.textContent = movimentacao.descricao;
        valorItem.textContent = formatarMoeda(movimentacao.valor)
        tipoItem.textContent = movimentacao.tipo;
        dataItem.textContent = formatarData(movimentacao.data);
        botaoExcluir.textContent = "Excluir";
        botaoEditar.textContent = "Editar";

        //Add titulo e o valor da movimentação na div de informações
        informacoes.appendChild(titulo);
        informacoes.appendChild(valorItem);

        //Add o tipo e data da movimentação na div detalhes
        detalhes.appendChild(tipoItem);
        detalhes.appendChild(dataItem);

        //Add todas as informações + botões na div de movimentação
        item.appendChild(informacoes);
        item.appendChild(detalhes);
        item.appendChild(botaoEditar);
        item.appendChild(botaoExcluir)


        //Botão de excluir as movimentações
        botaoExcluir.addEventListener("click", function(){
            const confirmar = confirm("Tem certeza que deseja excluir essa movimentação?")

            if (!confirmar){
                return;
            }

            movimentacoes.splice(indice, 1)

            localStorage.setItem(
                "movimentacoes",
                JSON.stringify(movimentacoes)
            );

            mostrarMovimentacoes();
            atualizarResumo();
        });

        //Botão para editar as informações das movimentações
        botaoEditar.addEventListener("click", function(){
            indiceEditando = indice;

            descricao.value = movimentacao.descricao;
            valor.value = movimentacao.valor;
            tipo.value = movimentacao.tipo;
            data.value = movimentacao.data;

            botao.textContent = "Atualizar";
        });

        listaMovimentacoes.appendChild(item);

        
    });

}


//===========================================================
//Adicionar/Editar
//===========================================================

//Adiciona Receita/Despesa toda vez que o botão adicionar é clicado
botao.addEventListener("click", function(){

    mensagemErro.textContent = "";

    if (!verificarCampo()){
        return;
    }

    const descricaoDigitada = descricao.value
    const valorDigitado = Number(valor.value);
    const tipoSelecionado = tipo.value;
    const dataSelecionada = data.value;

    const movimentacao = {
        descricao: descricaoDigitada,
        valor: valorDigitado,
        tipo: tipoSelecionado,
        data: dataSelecionada
    }

    if (!verificarValor(movimentacao)){
        return;
    }

    if (!verificarData(movimentacao)){
        return;
    }


    //Substituir a movimentação está sendo editada
    if (indiceEditando === null){
        movimentacoes.push(movimentacao);
    }else{
        movimentacoes[indiceEditando] = movimentacao;
        indiceEditando = null;
        botao.textContent = "Adicionar";
    }

    localStorage.setItem(
        "movimentacoes",
        JSON.stringify(movimentacoes)
    )

  
    mostrarMovimentacoes();
    atualizarResumo();

    descricao.value = "";
    valor.value = "";
    data.value = "";

})

//===========================================================
//Inicialização
//===========================================================

mostrarMovimentacoes();
atualizarResumo();
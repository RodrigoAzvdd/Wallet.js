document.addEventListener('DOMContentLoaded', getTransactions)

const addDepositBtn = document.querySelector('#addDeposit')
const addWithdrawalBtn = document.querySelector('#addWithdrawal')

addDepositBtn.addEventListener('click', addDeposit)
addWithdrawalBtn.addEventListener('click', addWithdrawal)

function formatNumber(number) {
    //deixando o valor em formato PTBR
    const formater = Intl.NumberFormat('pt-BR', {
        compactDisplay: 'long',
        currency: 'BRL',
        style: 'currency',
    })
    const formatedAmount = formater.format(number)

    return formatedAmount
}

async function totalValue() {
    //CACULAR O SALDO TOTAL DO USUARIO
    const balance = document.querySelector('.balance')
    const response = await fetch(`http://localhost:3000/transactions`).then(res => res.json())
    let sum = 0
    response.forEach(transation => {
        sum += Number(transation.value)
    });

    const value = formatNumber(sum)

    if (value < 0) balance.textContent = `Saldo = -R$${-value}`
    else balance.textContent = `Saldo: R$${value}`
}

async function getTransactions() {
    // PEGA TODOS OS OBJETOS DA ARRAY DA REQ DB.JSON => E GERA OS ELEMENTOS ABAIXO P CADA OBJETO
    const transactions = document.querySelector('.transactions')
    const response = await fetch(`http://localhost:3000/transactions`).then(res => res.json())
    response.forEach(transation => {
        const transationDiv = document.createElement('div')
        const typeOfTransation = document.createElement('p')
        const updateBtn = document.createElement('button')
        const deleteBtn = document.createElement('button')
        const description = document.createElement('p')
        const value = document.createElement('p')
        const btnDiv = document.createElement('div')
        const infoDiv = document.createElement('div')

        typeOfTransation.classList.add('transation-type')
        transationDiv.classList.add('transation-div')
        updateBtn.classList.add('btn')
        deleteBtn.classList.add('btn')
        btnDiv.classList.add('btn-div')
        infoDiv.classList.add('info-div')
        description.classList.add('description')
        value.classList.add('value')

        const formatedValue = formatNumber(transation.value)

        if (transation.type == 'saq') {
            typeOfTransation.textContent = 'Tipo: Saque'
            value.textContent = `Valor: ${(formatedValue)}`
        }
        else {
            typeOfTransation.textContent = 'Tipo: Deposito'
            value.textContent = `Valor: ${formatedValue}`
        }

        description.textContent = `Descrição: ${transation.name}`
        deleteBtn.textContent = `Deletar Transação`
        updateBtn.textContent = `Atualizar Transação`

        btnDiv.classList.add('btn-div')

        infoDiv.append(description, value)
        btnDiv.append(updateBtn, deleteBtn)
        transationDiv.append(typeOfTransation, infoDiv, btnDiv)
        transactions.append(transationDiv)

        deleteBtn.addEventListener('click', ev => {
            ev.preventDefault()
            deleteTransaction(transation.id)
        })

        updateBtn.addEventListener('click', ev => {
            ev.preventDefault()
            updateTransaction(transation.id)
        })
    })
    totalValue()
    isEmpty()
}

async function addWithdrawal() { 
    //FUNCAO ADD UM SAQUE => ADD O VALOR NEGATIVO REFERENTE AO SAQUE
    const description = document.querySelector('#description')
    const value = document.querySelector('#value')

    const transationData = {
        name: description.value,
        value: -value.value,
        type: "saq"
    }

    const response = await fetch(`http://localhost:3000/transactions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(transationData)
    })

    form.reset()
    updateTransactionsList()
}

async function addDeposit() {
    //FUNCAO ADD DEPOSITO => PEGA O VALOR E DESCRICAO REFERENTE AO DEPOSITO
    const description = document.querySelector('#description')
    const value = document.querySelector('#value')

    const transationData = {
        name: description.value,
        value: value.value,
        type: "dep"
    }

    const response = await fetch(`http://localhost:3000/transactions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(transationData)
    })

    form.reset()
    updateTransactionsList()
}

async function deleteTransaction(id) {
    // PEGA O ID DO OBJETO E REMOVE POR MEIO DO METODO DELETE 
    const response = await fetch(`http://localhost:3000/transactions/${id}`, {
        method: 'DELETE'
    })
    updateTransactionsList()
}

async function updateTransaction(id) {
    // PEGO OS ELEMENTOS BG-OPACITY E UPDATE SECTION (FAZEM PARTE DO PROMPT PERSONALIZADO QUE FIZ)
    // REMOVO O DISPLAY NONE DE AMBOS OS ELEMENTOS
    // ADD UM EVENTO DE CLICK NO BOTAO CONFIRMUPDATE
    // APOS O CLICK ELE PEGA OS NOVOS VALORES E FAZ A REQ POST COM OS VALORES RECEBIDOS PELOS INPUTS

    const bgOpacity = document.querySelector('.background-opacity')
    const updateSection = document.querySelector('.update-section')
    const confirmUpdateBtn = document.querySelector('.update-btn')

    updateSection.classList.remove('dnone')
    bgOpacity.classList.remove('dnone')

    confirmUpdateBtn.addEventListener('click', async () => {
        let newDescription = document.getElementById('newDescription').value
        let newValue = document.getElementById('newValue').value

        const type = await fetch(`http://localhost:3000/transactions/${id}`).then(res => res.json())

        if (type.type == "saq") newValue = newValue * -1

        const transationData = {
            name: newDescription,
            value: newValue,
            type: type.type
        }

        const response = await fetch(`http://localhost:3000/transactions/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(transationData)
        })

        updateSection.classList.add('dnone')
        bgOpacity.classList.add('dnone')

        updateTransactionsList()
    })
}

async function updateTransactionsList() {
    // METODO QUE EU USEI PARA FAZER A ATUALIZACAO DA PAGINA SEM PRECISAR RECARREGAR
    // EU 'REMOVO' OS ELEMENTOS DA DIV TRANSACTIONS E CHAMO A FUNCAO GET Q VAI GERAR TODOS OS ELEMENTOS NOVAMENTE JUNTAMENTE COM O NOVO TOTAL DO SALDO
    const transactions = document.querySelector('.transactions')
    transactions.innerHTML = ''
    await getTransactions()
    totalValue()
}

async function isEmpty() {
    // FUNCAO PARA CHECAR SE A ARRAY ESTA VAZIA
    // ELA SERVER PARA HABILITAR, OU NAO, O TEXTO DE 'NENHUMA TRANSACAO FEITA'
    const message = document.querySelector('#user-message')
    const transactions = await fetch(`http://localhost:3000/transactions`).then(res => res.json())

    if (transactions.length > 0 && !message.classList.contains('dnone')) {
        message.classList.add('dnone')
    } else if (transactions.length == 0 && message.classList.contains('dnone')) {
        message.classList.remove('dnone')
    }
}

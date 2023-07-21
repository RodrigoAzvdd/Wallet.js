const addDepositBtn = document.querySelector('#addDeposit')
const addWithdrawalBtn = document.querySelector('#addWithdrawal')

addDepositBtn.addEventListener('click', addDeposit)
addWithdrawalBtn.addEventListener('click', addWithdrawal)

async function totalValue() {
    const balance = document.querySelector('.balance')
    const response = await fetch(`http://localhost:3000/transactions`).then(res => res.json())
    let sum = 0
    response.forEach(transation => {
        sum += Number(transation.value)
    });

    balance.textContent = `Saldo: R$${sum}`
}

async function getTransactions() {
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

        if (transation.type == 'saq') typeOfTransation.textContent = 'Tipo: Saque'
        else typeOfTransation.textContent = 'Tipo: Deposito'

        description.textContent = `Descrição: ${transation.name}`
        value.textContent = `Valor: R$${transation.value}`
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

document.addEventListener('DOMContentLoaded', getTransactions)

async function addWithdrawal() {
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
    const response = await fetch(`http://localhost:3000/transactions/${id}`, {
        method: 'DELETE'
    })
    updateTransactionsList()
}

async function updateTransaction(id) {

    const newDescription = prompt('Nova Descrição:')
    let newValue = prompt('Novo Valor:')
    const type = await fetch(`http://localhost:3000/transactions/${id}`).then(res => res.json())

    console.log(type);

    if(type.type == "saq") newValue = newValue * -1

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

    updateTransactionsList()
}

async function updateTransactionsList() {
    const transactions = document.querySelector('.transactions')
    transactions.innerHTML = ''
    await getTransactions()
    totalValue()
}

async function isEmpty() {
    const message = document.querySelector('#user-message')
    const transactions = await fetch(`http://localhost:3000/transactions`).then(res => res.json())

    if (transactions.length > 0 && !message.classList.contains('dnone')) {
        message.classList.add('dnone')
    } else if (transactions.length == 0 && message.classList.contains('dnone')) {
        message.classList.remove('dnone')
    }
}

document.addEventListener('DOMContentLoaded', () => { //var declaration
    const incomeForm = document.getElementById('income-form');
    const expenseForm = document.getElementById('expense-form');
    const incomeBody = document.getElementById('income-body');
    const expenseBody = document.getElementById('expense-body');
    const balanceDisplay = document.getElementById('balance');
    const summaryPeriod = document.getElementById('summary-period');
    const summaryResult = document.getElementById('summary-result');
    const searchQuery = document.getElementById('search-query');

    let transactions = [];
    let balance = 0;

    function updateBalance() { //add income and subtract expenses
        balance = transactions.reduce((total, transaction) => {
            return total + (transaction.type === 'income' ? transaction.amount : -transaction.amount);
        }, 0);
        balanceDisplay.textContent = balance.toFixed(2);
    }

    function renderTransactions() {//render to the webpage
        incomeBody.innerHTML = '';
        expenseBody.innerHTML = '';

        transactions.forEach((transaction, index) => {//add new income/expense box to webpage
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${transaction.amount.toFixed(2)}</td>
                <td>${transaction.category}</td>
                <td>${transaction.date}</td>
                <td class="actions">
                    <button onclick="editTransaction(${index})">Edit</button>
                    <button onclick="deleteTransaction(${index})">Delete</button>
                </td>
            `;
            if (transaction.type === 'income') {
                incomeBody.appendChild(row);
            } else {
                expenseBody.appendChild(row);
            }
        });
    }

    incomeForm.addEventListener('submit', (event) => {//button press triggers change on page (income)
        event.preventDefault();
        const amount = parseFloat(document.getElementById('income-amount').value);
        const category = document.getElementById('income-category').value;
        const date = document.getElementById('income-date').value;

        transactions.push({ type: 'income', amount, category, date });
        updateBalance();
        renderTransactions();
        incomeForm.reset();
    });

    expenseForm.addEventListener('submit', (event) => {//button press triggers change on page(expenses)
        event.preventDefault();
        const amount = parseFloat(document.getElementById('expense-amount').value);
        const category = document.getElementById('expense-category').value;
        const date = document.getElementById('expense-date').value;
		
        transactions.push({ type: 'expense', amount, category, date });//EXPENSE MEANS MINUS NOT PLUS
        updateBalance();
        renderTransactions();
        expenseForm.reset();
    });

    window.deleteTransaction = (index) => {//delete mistakes
        transactions.splice(index, 1);
        updateBalance();
        renderTransactions();
    };

    window.editTransaction = (index) => {//edit boxes that are already made (jonah help please, boxes revert when pages refreshes)
        const transaction = transactions[index];
        const newAmount = prompt('Enter new amount:', transaction.amount.toFixed(2));
        const newCategory = prompt('Enter new category:', transaction.category);
        const newDate = prompt('Enter new date:', transaction.date);

        if (newAmount !== null && newCategory !== null && newDate !== null) {
            transactions[index] = {
                ...transaction,
                amount: parseFloat(newAmount),
                category: newCategory,
                date: newDate
            };
            updateBalance();
            renderTransactions();
        }
    };

    window.generateSummary = () => {//get transactions from a certain amount of time in the past
        const period = summaryPeriod.value;
        const now = new Date();
        let startDate;

        if (period === 'weekly') {
            startDate = new Date(now.setDate(now.getDate() - 7));
        } else if (period === 'monthly') {
            startDate = new Date(now.setMonth(now.getMonth() - 1));
        }

        const filteredTransactions = transactions.filter(transaction => new Date(transaction.date) >= startDate);
        const incomeSummary = filteredTransactions.filter(transaction => transaction.type === 'income').reduce((total, transaction) => total + transaction.amount, 0);
        const expenseSummary = filteredTransactions.filter(transaction => transaction.type === 'expense').reduce((total, transaction) => total + transaction.amount, 0);

        summaryResult.innerHTML = `
            <p>Income: ${incomeSummary.toFixed(2)}</p>
            <p>Expenses: ${expenseSummary.toFixed(2)}</p>
        `;
    };

    window.filterTransactions = () => {//filter through searching (why wont console commands work in here???!?)
        const query = searchQuery.value.toLowerCase();
        const filteredTransactions = transactions.filter(transaction =>
            transaction.category.toLowerCase().includes(query) ||
            transaction.amount.toString().includes(query) ||
            transaction.date.includes(query)
        );

        incomeBody.innerHTML = '';
        expenseBody.innerHTML = '';

        filteredTransactions.forEach((transaction, index) => {//rendering to the webpage
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${transaction.amount.toFixed(2)}</td>
                <td>${transaction.category}</td>
                <td>${transaction.date}</td>
                <td class="actions">
                    <button onclick="editTransaction(${index})">Edit</button>
                    <button onclick="deleteTransaction(${index})">Delete</button>
                </td>
            `;
            if (transaction.type === 'income') {
                incomeBody.appendChild(row);
            } else {
                expenseBody.appendChild(row);
            }
        });
    };
/* 	//why wont this work??? 
	//every single test page has worked
	//commenting this all out for the presentation
	
    function genPDF() {
        if (transactions.length === 0) {
            alert('No transactions to generate PDF');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        //set the title
        doc.setFontSize(24);
        doc.text("Exported Finances", 105, 20, { align: 'center' });

        //set the header background color
        doc.setFillColor(144, 238, 144); // Light green color
        doc.rect(0, 25, 210, 10, 'F');

        //setup the table
        doc.setFontSize(12);
        doc.text("Type", 10, 35);
        doc.text("Amount", 60, 35);
        doc.text("Category", 110, 35);
        doc.text("Date", 160, 35);

        let yPosition = 40;

        //add transactions to the PDF
        transactions.forEach(transaction => {
            const type = transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1);
            doc.text(type, 10, yPosition);
            doc.text(`$${transaction.amount.toFixed(2)}`, 60, yPosition);
            doc.text(transaction.category, 110, yPosition);
            doc.text(transaction.date, 160, yPosition);
            yPosition += 10;

            //check if we need to add a new page
            if (yPosition > 280) {
                doc.addPage();
                yPosition = 20;

                //re-add the header on the new page, page wont load when this is added >:(
                doc.setFontSize(24);
                doc.text("Exported Finances", 105, 20, { align: 'center' });
                doc.setFillColor(144, 238, 144);
                doc.rect(0, 25, 210, 10, 'F');
                doc.setFontSize(12);
                doc.text("Type", 10, 35);
                doc.text("Amount", 60, 35);
                doc.text("Category", 110, 35);
                doc.text("Date", 160, 35);
                yPosition = 40;
            }
        });

        doc.save('transactions.pdf');
	
    }*/
});

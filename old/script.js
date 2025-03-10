document.addEventListener('DOMContentLoaded', () => {
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

    function updateBalance() {
        balance = transactions.reduce((total, transaction) => {
            return total + (transaction.type === 'income' ? transaction.amount : -transaction.amount);
        }, 0);
        balanceDisplay.textContent = balance.toFixed(2);
    }

    function renderTransactions() {
        incomeBody.innerHTML = '';
        expenseBody.innerHTML = '';

        transactions.forEach((transaction, index) => {
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

    incomeForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const amount = parseFloat(document.getElementById('income-amount').value);
        const category = document.getElementById('income-category').value;
        const date = document.getElementById('income-date').value;

        transactions.push({ type: 'income', amount, category, date });
        updateBalance();
        renderTransactions();
        incomeForm.reset();
    });

    expenseForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const amount = parseFloat(document.getElementById('expense-amount').value);
        const category = document.getElementById('expense-category').value;
        const date = document.getElementById('expense-date').value;

        transactions.push({ type: 'expense', amount, category, date });
        updateBalance();
        renderTransactions();
        expenseForm.reset();
    });

    window.deleteTransaction = (index) => {
        transactions.splice(index, 1);
        updateBalance();
        renderTransactions();
    };

    window.editTransaction = (index) => {
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

    window.generateSummary = () => {
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

    window.filterTransactions = () => {
        const query = searchQuery.value.toLowerCase();
        const filteredTransactions = transactions.filter(transaction =>
            transaction.category.toLowerCase().includes(query) ||
            transaction.amount.toString().includes(query) ||
            transaction.date.includes(query)
        );

        incomeBody.innerHTML = '';
        expenseBody.innerHTML = '';

        filteredTransactions.forEach((transaction, index) => {
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

    function genPDF() {
        if (transactions.length === 0) {
            alert('No transactions to generate PDF');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Set the title
        doc.setFontSize(24);
        doc.text("Exported Finances", 105, 20, { align: 'center' });

        // Set the header background color
        doc.setFillColor(144, 238, 144); // Light green color
        doc.rect(0, 25, 210, 10, 'F');

        // Set the table header
        doc.setFontSize(12);
        doc.text("Type", 10, 35);
        doc.text("Amount", 60, 35);
        doc.text("Category", 110, 35);
        doc.text("Date", 160, 35);

        let yPosition = 40;

        // Add transactions to the PDF
        transactions.forEach(transaction => {
            const type = transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1);
            doc.text(type, 10, yPosition);
            doc.text(`$${transaction.amount.toFixed(2)}`, 60, yPosition);
            doc.text(transaction.category, 110, yPosition);
            doc.text(transaction.date, 160, yPosition);
            yPosition += 10;

            // Check if we need to add a new page
            if (yPosition > 280) {
                doc.addPage();
                yPosition = 20;

                // Re-add the header on the new page
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
    }
});

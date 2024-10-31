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

        // Create a new table for income and expense transactions
        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';

        const headerRow = document.createElement('tr');
        const headers = ['Type', 'Amount', 'Category', 'Date'];
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.style.padding = '10px';
            th.style.textAlign = 'left';
            th.style.borderBottom = '1px solid #ddd';
            th.style.backgroundColor = '#f2f2f2';
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);

        transactions.forEach(transaction => {
            const row = document.createElement('tr');
            const cells = [transaction.type, transaction.amount.toFixed(2), transaction.category, transaction.date];
            cells.forEach(cellText => {
                const td = document.createElement('td');
                td.style.padding = '10px';
                td.style.textAlign = 'left';
                td.style.borderBottom = '1px solid #ddd';
                td.textContent = cellText;
                row.appendChild(td);
            });
            table.appendChild(row);
        });

        // Convert the table to an image and add it to the PDF
        html2canvas(table).then(canvas => {
            console.log('Table converted to canvas');
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 210; // A4 size width in mm
            const pageHeight = 295; // A4 size height in mm
            const imgHeight = canvas.height * imgWidth / canvas.width;
            let heightLeft = imgHeight;

            doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            console.log('Image added to PDF');
            let position = 0;

            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                doc.addPage();
                doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            console.log('PDF generated');
            doc.save('transactions.pdf');
            console.log('PDF saved');
        }).catch(error => {
            console.error('Error generating PDF:', error);
        });
    }
});

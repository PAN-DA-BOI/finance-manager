function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Get the values from the input fields
    const input1 = document.getElementById('input1').value;
    const input2 = document.getElementById('input2').value;
    const input3 = document.getElementById('input3').value;

    // Add the input values to the PDF
    doc.text('Input 1: ' + input1, 10, 10);
    doc.text('Input 2: ' + input2, 10, 20);
    doc.text('Input 3: ' + input3, 10, 30);

    // Save the PDF
    doc.save('test.pdf');
}
